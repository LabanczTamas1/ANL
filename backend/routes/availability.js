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

router.get("/standard-availability", async (req, res) => {
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

// ---------------------------------------------------------------------------
// GET /show-available-times/:date - Public route for booking page
// Returns available time slots for a given date (no auth required)
// ---------------------------------------------------------------------------
router.get("/show-available-times/:rawDate", async (req, res) => {
  const { rawDate } = req.params;
  const currentTime = req.query.current_time;

  try {
    const redisClient = getRedisClient();
    const dateInput = new Date(rawDate);
    const dayNumber = dateInput.getDay() === 0 ? 6 : dateInput.getDay() - 1;

    const weekdays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const dayName = weekdays[dayNumber] || "Monday";

    const availability = await redisClient.hGetAll(
      `StandardAvailability:${dayName}`
    );

    if (!availability || availability.IsDayOff === "true") {
      return res.status(200).json({
        availableTimes: [],
        message: "No availability on this day",
      });
    }

    const openingTimeStr = availability.OpeningTime || "09:00";
    const closingTimeStr = availability.ClosingTime || "17:00";

    const [openH, openM] = openingTimeStr.split(":").map(Number);
    const [closeH, closeM] = closingTimeStr.split(":").map(Number);
    const openingMinutes = openH * 60 + openM;
    const closingMinutes = closeH * 60 + closeM;

    let availableTimes = [];
    for (let i = openingMinutes; i < closingMinutes; i += 60) {
      availableTimes.push(i);
    }

    const customTimes = await checkCustomAvailability(
      rawDate,
      availableTimes,
      "both"
    );

    const finalAvailableTimes =
      customTimes.length > 0 ? customTimes : availableTimes;

    const convertedTimes = finalAvailableTimes.map((minutes) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHour = hours % 12 === 0 ? 12 : hours % 12;
      return `${displayHour}:${mins.toString().padStart(2, "0")} ${ampm}`;
    });

    res.status(200).json({
      date: rawDate,
      availableTimes: convertedTimes,
      rawMinutes: finalAvailableTimes,
    });
  } catch (error) {
    console.error("Error fetching availability:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

module.exports = router;
