const express = require("express");
const router = express.Router();
const { getRedisClient } = require("../config/database");
const authenticateJWT = require("../middleware/authenticateJWT");
const { authorizeRoles } = require("../helpers/authorizationHelpers");

router.get("/me", authenticateJWT, (req, res) => {
  const redisClient = getRedisClient();

  redisClient
    .hGetAll(`user:${req.user.id}`)
    .then((userData) => {
      if (!userData || Object.keys(userData).length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        userId: req.user.id,
        username: userData.username || userData.email,
        email: userData.email,
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        role: userData.role || req.user.role || "user",
      });
    })
    .catch((err) => {
      console.error("Redis error:", err);
      res.status(500).json({ error: "Server error" });
    });
});

router.get("/:username", async (req, res) => {
  try {
    const redisClient = getRedisClient();
    const { username } = req.params;

    const user = await redisClient.hGetAll(`user:${username}`);
    if (!user || Object.keys(user).length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/updateUserRole/:userId", async (req, res) => {
  try {
    const redisClient = getRedisClient();
    const { userId } = req.params;
    const { role } = req.body;

    console.log(
      `Received role change request for user ID: ${userId}, New role: ${role}`
    );

    if (!["admin", "user", "owner"].includes(role)) {
      return res.status(400).json({
        error: "Invalid role. Allowed roles are: admin, user, owner",
      });
    }

    const userKey = `user:${userId}`;
    const userData = await redisClient.hGetAll(userKey);

    if (!userData || Object.keys(userData).length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    await redisClient.hSet(userKey, "role", role);
    console.log(`User role updated to ${role} for user ID: ${userId}`);

    res.status(200).json({
      message: `User role updated successfully to ${role}`,
      user: {
        id: userId,
        email: userData.email,
        name: userData.name,
        role: role,
      },
    });
  } catch (error) {
    console.error("Error changing user role:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/listAllUsers", authenticateJWT, async (req, res) => {
  try {
    const listAllUsersAdmin = require("../utils/listAllUsersAdmin");
    const users = await listAllUsersAdmin();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error listing all users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/add-user", authenticateJWT, async (req, res) => {
  try {
    const redisClient = getRedisClient();
    const { firstName, lastName, email, username, company } = req.body;

    console.log("Received registration request:", req.body);

    if (!firstName || !lastName || !email || !username) {
      return res.status(400).json({
        error: "firstName, lastName, email, and username are required",
      });
    }

    const userExists = await redisClient.exists(`user:email:${email}`);
    if (userExists) {
      return res.status(409).json({ error: "User already exists with this email" });
    }

    const { v4: uuidv4 } = require("uuid");
    const userId = uuidv4();

    await redisClient.hSet(`user:${userId}`, {
      id: userId,
      email,
      firstName,
      lastName,
      username,
      company: company || "",
      role: "user",
      createdAt: new Date().toISOString(),
    });

    await redisClient.set(`user:email:${email}`, userId);
    await redisClient.set(`user:username:${username}`, userId);

    console.log(`[USER] User created: ${userId}, email: ${email}`);

    res.status(201).json({
      message: "User created successfully",
      userId,
      user: {
        id: userId,
        email,
        firstName,
        lastName,
        username,
        company,
      },
    });
  } catch (error) {
    console.error("[USER] Error adding user:", error);
    res.status(500).json({ error: "Failed to add user" });
  }
});

router.get("/profile", authenticateJWT, async (req, res) => {
  try {
    const redisClient = getRedisClient();
    const userData = await redisClient.hGetAll(`user:${req.user.id}`);

    if (!userData || Object.keys(userData).length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: req.user.id,
      email: userData.email,
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
      username: userData.username || "",
      company: userData.company || "",
      role: userData.role || "user",
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/profile", authenticateJWT, async (req, res) => {
  try {
    const redisClient = getRedisClient();
    const { firstName, lastName, phoneNumber, company, profileImg } = req.body;

    const userKey = `user:${req.user.id}`;
    const userData = await redisClient.hGetAll(userKey);

    if (!userData || Object.keys(userData).length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const updatedData = {};
    if (firstName !== undefined) updatedData.firstName = firstName;
    if (lastName !== undefined) updatedData.lastName = lastName;
    if (phoneNumber !== undefined) updatedData.phoneNumber = phoneNumber;
    if (company !== undefined) updatedData.company = company;
    if (profileImg !== undefined) updatedData.profileImg = profileImg;

    await redisClient.hSet(userKey, updatedData);

    const updated = await redisClient.hGetAll(userKey);

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: req.user.id,
        email: updated.email,
        firstName: updated.firstName || "",
        lastName: updated.lastName || "",
        username: updated.username || "",
        phoneNumber: updated.phoneNumber || "",
        company: updated.company || "",
        profileImg: updated.profileImg || "",
      },
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:userId", authenticateJWT, async (req, res) => {
  try {
    const redisClient = getRedisClient();
    const { userId } = req.params;

    const userData = await redisClient.hGetAll(`user:${userId}`);

    if (!userData || Object.keys(userData).length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: userId,
      email: userData.email,
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
      username: userData.username || "",
      company: userData.company || "",
      role: userData.role || "user",
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/modifyUserData", authenticateJWT, async (req, res) => {
  try {
    const redisClient = getRedisClient();
    const { firstName, lastName, email, username, company, country, state, city } =
      req.body;

    const userKey = `user:${req.user.id}`;
    const currentUserData = await redisClient.hGetAll(userKey);

    if (!currentUserData || Object.keys(currentUserData).length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const updatedData = {};
    if (firstName) updatedData.firstName = firstName;
    if (lastName) updatedData.lastName = lastName;
    if (email) updatedData.email = email;
    if (username) updatedData.username = username;
    if (company) updatedData.company = company;
    if (country) updatedData.country = country;
    if (state) updatedData.state = state;
    if (city) updatedData.city = city;

    if (Object.keys(updatedData).length === 0) {
      return res
        .status(400)
        .json({ error: "No data provided to update" });
    }

    await redisClient.hSet(userKey, updatedData);

    const updated = await redisClient.hGetAll(userKey);

    res.status(200).json({
      message: "User data modified successfully",
      user: {
        id: req.user.id,
        firstName: updated.firstName || "",
        lastName: updated.lastName || "",
        email: updated.email || "",
        username: updated.username || "",
        company: updated.company || "",
        country: updated.country || "",
        state: updated.state || "",
        city: updated.city || "",
      },
    });
  } catch (error) {
    console.error("Error modifying user data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
