const express = require("express");
const router = express.Router();
const { getRedisClient } = require("../config/database");
const authenticateJWT = require("../middleware/authenticateJWT");
const { authorizeRoles } = require("../helpers/authorizationHelpers");

router.get("/stats", authenticateJWT, authorizeRoles("admin", "owner"), async (req, res) => {
  try {
    const { getRequestStats } = require("../utils/admin/trackRequest");
    const stats = await getRequestStats();
    res.json(stats);
  } catch (error) {
    console.error("Error retrieving request stats:", error);
    res.status(500).json({ error: "Failed to retrieve request statistics" });
  }
});

router.post("/stats/reset", authenticateJWT, authorizeRoles("owner", "admin"), async (req, res) => {
  try {
    const { resetRequestStats } = require("../utils/admin/trackRequest");
    const result = await resetRequestStats();
    res.json(result);
  } catch (error) {
    console.error("Error resetting request stats:", error);
    res.status(500).json({ error: "Failed to reset request statistics" });
  }
});

router.post("/ban-ip", authenticateJWT, authorizeRoles("admin"), async (req, res) => {
  try {
    const redisClient = getRedisClient();
    const { ip } = req.body;
    if (!ip) return res.status(400).json({ error: "IP address is required" });

    await redisClient.sAdd("banned_ips", ip);
    res.json({ message: `IP ${ip} has been banned.` });
  } catch (err) {
    console.error("Error banning IP:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/unban-ip", authenticateJWT, authorizeRoles("admin"), async (req, res) => {
  try {
    const redisClient = getRedisClient();
    const { ip } = req.body;
    if (!ip) return res.status(400).json({ error: "IP address is required" });

    await redisClient.sRem("banned_ips", ip);
    res.json({ message: `IP ${ip} has been unbanned.` });
  } catch (err) {
    console.error("Error unbanning IP:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/banned-ips", authenticateJWT, authorizeRoles("admin"), async (req, res) => {
  try {
    const redisClient = getRedisClient();
    const ips = await redisClient.sMembers("banned_ips");
    res.json({ banned: ips });
  } catch (err) {
    console.error("Error fetching banned IPs:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/emails", authenticateJWT, authorizeRoles("admin", "owner"), async (req, res) => {
  try {
    const redisClient = getRedisClient();
    const pattern = "user:email:*";
    const emails = [];
    const userDetails = [];

    let cursor = 0;
    do {
      const result = await redisClient.scan(cursor, { MATCH: pattern, COUNT: 100 });
      cursor = result.cursor;
      const keys = result.keys;

      for (const key of keys) {
        const email = key.replace("user:email:", "");
        emails.push(email);

        const userId = await redisClient.get(key);
        const userInfo = await redisClient.hGetAll(`user:${userId}`);

        userDetails.push({
          userId,
          email,
          firstName: userInfo.firstName || "",
          lastName: userInfo.lastName || "",
          username: userInfo.username || "",
          createdAt: userInfo.createdAt || "",
        });
      }
    } while (cursor !== 0);

    res.setHeader("Content-Type", "application/json");
    res.status(200).json({
      success: true,
      count: emails.length,
      emails: userDetails,
    });
  } catch (err) {
    console.error("Failed to get emails:", err);
    res.status(500).json({
      success: false,
      error: "Server error while fetching emails",
      message: err.message,
    });
  }
});

module.exports = router;
