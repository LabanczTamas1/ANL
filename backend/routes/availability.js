const express = require("express");
const router = express.Router();
const { getRedisClient } = require("../config/database");
const authenticateJWT = require("../middleware/authenticateJWT");
const {
  timeToMinutes,
  getAvailableTimes,
  getUnavailableTimes,
} = require("../helpers/timeHelpers");
const { checkCustomAvailability } = require("../helpers/availabilityHelpers");

router.patch("/standard-availability", authenticateJWT, async (req, res) => {
  const { availableTimes } = req.body;

  console.log("Received availableTimes:", availableTimes);

  if (!Array.isArray(availableTimes)) {
    return res.status(400).json({
      error: "Invalid input: availableTimes must be an array",
    });
  }

  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const redisClient = getRedisClient();
    await Promise.all(
      availableTimes.map(async (entry) => {
        const {
          day,
          openingTime,
          closingTime,
          isDayOff,
        } = entry;

        await redisClient.hSet(
          `StandardAvailability:${day}`,
          {
            Day: day,
            OpeningTime: openingTime,
            ClosingTime: closingTime,
            IsDayOff: isDayOff,
          }
        );
      })
    );

    res
      .status(200)
      .json({ message: "Availability updated successfully" });
  } catch (error) {
    console.error("Error updating availability:", error);
    res.status(500).json({
      error: `Failed to update availability: ${error.message}`,
    });
  }
});

router.get("/standard-availability", authenticateJWT, async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  try {
    const redisClient = getRedisClient();
    const standardAvailability = await Promise.all(
      daysOfWeek.map(async (day) => {
        const availability = await redisClient.hGetAll(
          `StandardAvailability:${day}`
        );
        return {
          day,
          openingTime: availability.OpeningTime || "09:00",
          closingTime: availability.ClosingTime || "17:00",
          isDayOff: availability.IsDayOff || "false",
        };
      })
    );

    console.log(JSON.stringify(standardAvailability, null, 2));
    res.status(200).json(standardAvailability);
  } catch (error) {
    console.error("Error fetching availability:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/add-availability/:rawDate", authenticateJWT, async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  const { rawDate } = req.params;
  console.log("RawDate", rawDate);

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const redisClient = getRedisClient();
    const date = new Date(rawDate);
    const dayNumber = date.getDay();

    const weekdays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const dayName = weekdays[dayNumber];

    const availability = await redisClient.hGetAll(
      `StandardAvailability:${dayName}`
    );

    if (availability.IsDayOff.toLowerCase() === "true") {
      return res.status(200).json({ unavailableTimes: [] });
    }

    const startHour = parseInt(timeToMinutes(availability.OpeningTime));
    const endHour = parseInt(timeToMinutes(availability.ClosingTime));
    console.log(startHour);
    console.log(endHour);

    const allAvailableTimes = getAvailableTimes(startHour, endHour, 60, 0);
    console.log(allAvailableTimes);
    const allUnavailableTimes = getUnavailableTimes(startHour, endHour);
    console.log("From here:");

    console.log(allAvailableTimes, "\nunavailable", allUnavailableTimes);

    return res.status(200).json({ unavailableTimes: allUnavailableTimes });
  } catch (error) {
    console.error("Error fetching availability:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/delete-availability/:rawDate", authenticateJWT, async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  const { rawDate } = req.params;
  console.log("RawDate", rawDate);

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const redisClient = getRedisClient();
    const date = new Date(rawDate);
    const dayNumber = date.getDay();

    const weekdays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const dayName = weekdays[dayNumber];

    console.log(dayNumber);
    console.log(dayName);

    const availability = await redisClient.hGetAll(
      `StandardAvailability:${dayName}`
    );
    console.log(availability);
    console.log(typeof availability.IsDayOff);

    if (availability.IsDayOff.toLowerCase() === "true") {
      return res.status(200).json({ availableTimes: [] });
    }

    const startHour = parseInt(timeToMinutes(availability.OpeningTime));
    const endHour = parseInt(timeToMinutes(availability.ClosingTime));
    console.log(startHour);

    return res.status(200).json({
      availableTimes: getAvailableTimes(startHour, endHour, 60, 0),
    });
  } catch (error) {
    console.error("Error fetching availability:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/add-availability-to-the-database", authenticateJWT, async (req, res) => {
  const { date, times } = req.body;

  if (!date || !Array.isArray(times) || times.length === 0) {
    return res.status(400).json({
      error: "date and times array are required",
    });
  }

  try {
    const redisClient = getRedisClient();
    const timeEntries = times.map((time) => ({
      score: time,
      value: String(time),
    }));

    await redisClient.zAdd(`AddedTimes:${date}`, timeEntries);

    res.status(200).json({
      message: "Availability added successfully",
    });
  } catch (err) {
    console.error("Error adding availability:", err);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

router.delete("/delete-availability-to-the-database", authenticateJWT, async (req, res) => {
  const { date, times } = req.body;

  if (!date || !Array.isArray(times) || times.length === 0) {
    return res.status(400).json({
      error: "date and times array are required",
    });
  }

  try {
    const redisClient = getRedisClient();
    const timeEntries = times.map((time) => ({
      score: time,
      value: String(time),
    }));

    await redisClient.zAdd(`DeletedTimes:${date}`, timeEntries);

    res.status(200).json({
      message: "Availability deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting availability:", err);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

module.exports = router;
