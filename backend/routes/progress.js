const express = require("express");
const router = express.Router();
const { getRedisClient } = require("../config/database");
const authenticateJWT = require("../middleware/authenticateJWT");

router.patch("/changeUserProgress/:userId", authenticateJWT, async (req, res) => {
  try {
    const redisClient = getRedisClient();
    const { userId } = req.params;
    const { progressionStatus, progressionCategory, progressionTimeline } =
      req.body;

    const userKey = `user:${userId}`;
    const userData = await redisClient.hGetAll(userKey);

    if (!userData || Object.keys(userData).length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const updateData = {};
    if (progressionStatus !== undefined)
      updateData.progressionStatus = progressionStatus;
    if (progressionCategory !== undefined)
      updateData.progressionCategory = progressionCategory;
    if (progressionTimeline !== undefined)
      updateData.progressionTimeline = progressionTimeline;

    await redisClient.hSet(userKey, updateData);

    const updated = await redisClient.hGetAll(userKey);

    res.status(200).json({
      message: "User progress updated successfully",
      user: updated,
    });
  } catch (error) {
    console.error("Error updating user progress:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/allUsersProgress", authenticateJWT, async (req, res) => {
  try {
    const redisClient = getRedisClient();
    const pattern = "user:*";
    const usersProgress = [];

    let cursor = 0;
    do {
      const result = await redisClient.scan(cursor, { MATCH: pattern, COUNT: 100 });
      cursor = result.cursor;
      const keys = result.keys;

      for (const key of keys) {
        if (
          key.includes("email") ||
          key.includes("username") ||
          !key.startsWith("user:")
        ) {
          continue;
        }

        const userData = await redisClient.hGetAll(key);
        if (userData && userData.email) {
          usersProgress.push({
            userId: userData.id || key.replace("user:", ""),
            email: userData.email,
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            progressionStatus: userData.progressionStatus || "pending",
            progressionCategory: userData.progressionCategory || "",
            progressionTimeline: userData.progressionTimeline || "",
          });
        }
      }
    } while (cursor !== 0);

    res.status(200).json({ count: usersProgress.length, data: usersProgress });
  } catch (error) {
    console.error("Error fetching users progress:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/terminatedStatistics", authenticateJWT, async (req, res) => {
  try {
    const redisClient = getRedisClient();
    const pattern = "user:*";
    const usersStats = {
      total: 0,
      active: 0,
      inactive: 0,
      terminated: 0,
      byStatus: {},
    };

    let cursor = 0;
    do {
      const result = await redisClient.scan(cursor, { MATCH: pattern, COUNT: 100 });
      cursor = result.cursor;
      const keys = result.keys;

      for (const key of keys) {
        if (
          key.includes("email") ||
          key.includes("username") ||
          !key.startsWith("user:")
        ) {
          continue;
        }

        const userData = await redisClient.hGetAll(key);
        if (userData && userData.email) {
          usersStats.total++;
          const status = userData.progressionStatus || "active";

          usersStats.byStatus[status] = (usersStats.byStatus[status] || 0) + 1;

          if (status === "active") usersStats.active++;
          else if (status === "inactive") usersStats.inactive++;
          else if (status === "terminated") usersStats.terminated++;
        }
      }
    } while (cursor !== 0);

    res.status(200).json(usersStats);
  } catch (error) {
    console.error("Error fetching terminated statistics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
