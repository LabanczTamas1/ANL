const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const { getRedisClient } = require("../config/database");
const authenticateJWT = require("../middleware/authenticateJWT");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "deid.unideb@gmail.com",
    pass: "ytke aiwa pzin kmwc",
  },
});

router.post("/save-email", authenticateJWT, async (req, res) => {
  const { subject, recipient, body, name } = req.body;

  if (!subject || !recipient || !body) {
    return res
      .status(400)
      .json({ error: "All fields (subject, recipient, body) are required" });
  }

  try {
    const redisClient = getRedisClient();
    console.log("Incoming Data:", { subject, recipient, body, name });

    const recipientString =
      typeof recipient === "string" ? recipient : JSON.stringify(recipient);
    const bodyString = typeof body === "string" ? body : JSON.stringify(body);

    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const userName = `username:${name}`;
    console.log("------------", userName);
    const userId =
      (await redisClient.get(`user:${userName}`)) ||
      (await redisClient.get(userName));

    console.log("Here is the id:", userId);

    const userData = await redisClient.hGetAll(`user:${userId}`);
    console.log("User Data: ", userData);

    const fromEmail = userData.email;

    if (!userId) {
      return res.status(404).json({ error: "User not found" });
    }

    const mailId = uuidv4();
    const emailDetails = `MailDetails:${mailId}`;
    const currentDate = new Date();
    const timestamp = currentDate.getTime();

    await redisClient.hSet(emailDetails, {
      fromId: userId,
      fromName: name,
      fromEmail: fromEmail,
      subject: subject,
      recipient: recipientString,
      body: bodyString,
      timeSended: timestamp,
      isRead: "false",
    });

    const inboxRankingName = `inbox:${userId}`;
    await redisClient.zAdd(inboxRankingName, {
      score: timestamp,
      value: mailId,
    });

    const sentMailRankingName = `SentMail:${userId}`;
    await redisClient.zAdd(sentMailRankingName, {
      score: timestamp,
      value: mailId,
    });

    const storedData = await redisClient.hGetAll(emailDetails);
    console.log("Stored Data in Redis:", storedData);

    await redisClient.expire(emailDetails, 30 * 24 * 60 * 60);

    console.log(recipient);
    const mailOptions = {
      from: "deid.unideb@gmail.com",
      to: `${recipient}`,
      subject: `${subject}`,
      text: `Email from ANL Website:
      ${body}
      `,
    };
    console.log(mailOptions);

    await transporter.sendMail(mailOptions);

    res
      .status(200)
      .json({ message: "Email saved successfully", id: mailId });
  } catch (error) {
    console.error("Error saving email:", error);
    res.status(500).json({ error: "Failed to save email" });
  }
});

router.get("/:username", async (req, res) => {
  const { username } = req.params;
  console.log("Your username: ", username);
  const userNameCreated = `username:${username}`;

  try {
    const redisClient = getRedisClient();
    const userId = await redisClient.get(userNameCreated);
    console.log("User ID:", userId);

    const mails = await redisClient.zRange(`inbox:${userId}`, 0, -1);
    console.log("Your mails:", mails);

    const mailDetails = await Promise.all(
      mails.map(async (mailId) => {
        return await redisClient.hGetAll(`MailDetails:${mailId}`);
      })
    );

    console.log("Mail details:", mailDetails);
    res.json(mailDetails);
  } catch (error) {
    console.error("Error fetching inbox:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/sentmails/:username", async (req, res) => {
  const { username } = req.params;
  console.log("Your username: ", username);
  const userNameCreated = `username:${username}`;

  try {
    const redisClient = getRedisClient();
    const userId = await redisClient.get(userNameCreated);
    console.log("User ID:", userId);

    const mails = await redisClient.zRange(`SentMail:${userId}`, 0, -1);
    console.log("Your mails:", mails);

    const mailDetails = await Promise.all(
      mails.map((mailId) => redisClient.hGetAll(`MailDetails:${mailId}`))
    );

    console.log("Mail details:", mailDetails);
    res.json(mailDetails);
  } catch (error) {
    console.error("Error fetching inbox:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/mark-as-read", authenticateJWT, async (req, res) => {
  const { emailIds, username } = req.body;

  if (!emailIds || !Array.isArray(emailIds)) {
    return res.status(400).json({ error: "Valid emailIds array is required" });
  }

  try {
    const redisClient = getRedisClient();
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const name = username || req.body.name;
    const userNameCreated = `username:${name}`;

    console.log("Looking up user with key:", userNameCreated);
    const userId = await redisClient.get(userNameCreated);

    if (!userId) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log("Found user ID:", userId);
    console.log("Marking emails as read:", emailIds);

    for (const emailId of emailIds) {
      await redisClient.hSet(`MailDetails:${emailId}`, { isRead: "true" });
    }

    res
      .status(200)
      .json({ message: "Emails marked as read successfully" });
  } catch (error) {
    console.error("Error marking emails as read:", error);
    res.status(500).json({ error: "Failed to mark emails as read" });
  }
});

router.get("/unread-count/:username", authenticateJWT, async (req, res) => {
  const { username } = req.query;
  console.log("Fetching unread count for username:", username);
  const userNameCreated = `user:username:${username}`;

  try {
    const redisClient = getRedisClient();
    const userId =
      (await redisClient.get(userNameCreated)) ||
      (await redisClient.get(`username:${username}`));
    if (!userId) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log("User ID:", userId);

    const mails = await redisClient.zRange(`inbox:${userId}`, 0, -1);
    console.log("Total emails in inbox:", mails.length);

    let unreadCount = 0;

    for (const mailId of mails) {
      const mailData = await redisClient.hGet(
        `MailDetails:${mailId}`,
        "isRead"
      );
      if (mailData === "false" || !mailData) {
        unreadCount++;
      }
    }

    console.log("Unread email count:", unreadCount);
    res.json({ count: unreadCount });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/delete-emails", authenticateJWT, async (req, res) => {
  const { emailIds, username } = req.body;

  if (!emailIds || !Array.isArray(emailIds) || emailIds.length === 0) {
    return res.status(400).json({ error: "Email IDs array is required" });
  }

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    const redisClient = getRedisClient();
    const userName = `username:${username}`;
    const userId = await redisClient.get(userName);

    if (!userId) {
      return res.status(404).json({ error: "User not found" });
    }

    const inboxKey = `inbox:${userId}`;

    for (const emailId of emailIds) {
      const mailDetailsKey = `MailDetails:${emailId}`;
      await redisClient.del(mailDetailsKey);
      await redisClient.zRem(inboxKey, emailId);
    }

    res.status(200).json({
      message: `Successfully deleted ${emailIds.length} email(s)`,
      deletedIds: emailIds,
    });
  } catch (error) {
    console.error("Error deleting emails:", error);
    res.status(500).json({ error: "Failed to delete emails" });
  }
});

module.exports = router;
