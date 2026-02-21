const express = require("express");
const router = express.Router();
const { google } = require("googleapis");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { getRedisClient } = require("../config/database");
const authenticateJWT = require("../middleware/authenticateJWT");
const { convertMinutesToTime, utcToMinutes } = require("../helpers/timeHelpers");
const { checkCustomAvailability } = require("../helpers/availabilityHelpers");

const CREDENTIALS_PATH = path.join(__dirname, "../credentials.json");

const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
];

async function createGoogleMeetEvent(
  date,
  time,
  email,
  customAuth = null,
  timezone = "America/New_York"
) {
  try {
    const auth = customAuth;

    const calendar = google.calendar({ version: "v3", auth });

    const eventDateTime = new Date(`${date}T${time}:00`);

    const meetRequestBody = {
      summary: `Meeting with ${email}`,
      description: "Meeting scheduled via ANL Website",
      start: {
        dateTime: eventDateTime.toISOString(),
        timeZone: timezone,
      },
      end: {
        dateTime: new Date(
          eventDateTime.getTime() + 60 * 60 * 1000
        ).toISOString(),
        timeZone: timezone,
      },
      conferenceData: {
        createRequest: {
          requestId: uuidv4(),
          conferenceSolution: {
            key: {
              conferenceType: "hangoutsMeet",
            },
          },
        },
      },
      attendees: [{ email: email }],
    };

    const event = await calendar.events.insert({
      calendarId: "primary",
      resource: meetRequestBody,
      conferenceDataVersion: 1,
    });

    return {
      success: true,
      eventId: event.data.id,
      meetLink: event.data.conferenceData?.entryPoints?.[0]?.uri || null,
      calendarLink: event.data.htmlLink,
    };
  } catch (error) {
    console.error("Error creating Google Meet event:", error);
    throw error;
  }
}

router.post("/booking/add-booking", async (req, res) => {
  try {
    const redisClient = getRedisClient();
    const {
      email,
      date,
      time,
      timezone,
      fullName,
      phoneNumber,
      company,
      notes,
    } = req.body;

    if (!email || !date || !time) {
      return res
        .status(400)
        .json({ error: "email, date, and time are required" });
    }

    const weekdays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    const dateObj = new Date(date);
    const dayNumber = dateObj.getDay() || 6;
    const dayName = weekdays[dayNumber] || "Monday";

    const bookingId = uuidv4();
    const timestamp = Date.now();

    const standardAvailability = await redisClient.hGetAll(
      `StandardAvailability:${dayName}`
    );

    let availableTimes = [];
    if (standardAvailability && standardAvailability.IsDayOff !== "true") {
      const openingMinutes = parseInt(
        standardAvailability.OpeningTime?.replace(":", "") || "0900"
      );
      const closingMinutes = parseInt(
        standardAvailability.ClosingTime?.replace(":", "") || "1700"
      );
      availableTimes = [];
      for (let i = openingMinutes; i < closingMinutes; i += 100) {
        availableTimes.push(i);
      }
    }

    const customAvailability = await checkCustomAvailability(
      date,
      availableTimes,
      "both"
    );

    const finalAvailableTimes = customAvailability.length > 0
      ? customAvailability
      : availableTimes;

    const timeInMinutes = parseInt(time);
    if (!finalAvailableTimes.includes(timeInMinutes)) {
      return res.status(400).json({
        error: "Selected time is not available",
        availableTimes: finalAvailableTimes,
      });
    }

    let meetLink = null;
    const calendarData = await redisClient.get(`calendar:${email}`);
    if (calendarData) {
      const bookingData = JSON.parse(calendarData);
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        "http://localhost:5173/oauth-callback"
      );

      oauth2Client.setCredentials({
        access_token: bookingData.googleAccessToken,
        refresh_token: bookingData.googleRefreshToken,
      });

      try {
        const result = await createGoogleMeetEvent(
          date,
          time,
          email,
          oauth2Client,
          timezone || "America/New_York"
        );
        meetLink = result.meetLink;
      } catch (meetError) {
        console.error("Error creating meet link:", meetError);
      }
    }

    await redisClient.hSet(`Meeting:${bookingId}`, {
      BookingId: bookingId,
      UserId: email,
      Email: email,
      FullName: fullName || "",
      PhoneNumber: phoneNumber || "",
      Company: company || "",
      Notes: notes || "",
      Date: date,
      Time: time,
      Timezone: timezone || "America/New_York",
      MeetLink: meetLink || "",
      CreatedAt: timestamp,
      Status: "confirmed",
    });

    await redisClient.zAdd(`UserMeetings:${email}`, {
      score: timestamp,
      value: bookingId,
    });

    res.status(200).json({
      message: "Booking created successfully",
      bookingId,
      meetLink: meetLink || "",
      bookingDetails: {
        email,
        date,
        time: convertMinutesToTime(timeInMinutes),
        fullName,
        timezone,
      },
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({
      error: "Failed to create booking",
      message: error.message,
    });
  }
});

router.get("/meeting", authenticateJWT, async (req, res) => {
  try {
    const redisClient = getRedisClient();
    const userId = req.user.id;

    const bookingIds = await redisClient.zRange(`UserMeetings:${userId}`, 0, -1);

    if (bookingIds.length === 0) {
      return res.status(200).json({ meetings: [] });
    }

    const meetings = await Promise.all(
      bookingIds.map(async (bookingId) => {
        return await redisClient.hGetAll(`Meeting:${bookingId}`);
      })
    );

    const sortedMeetings = meetings.sort(
      (a, b) => parseInt(b.CreatedAt) - parseInt(a.CreatedAt)
    );

    res.status(200).json({ meetings: sortedMeetings });
  } catch (error) {
    console.error("Error fetching meetings:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch meetings", message: error.message });
  }
});

router.get("/meetings/:meetingId", authenticateJWT, async (req, res) => {
  try {
    const redisClient = getRedisClient();
    const { meetingId } = req.params;

    const meeting = await redisClient.hGetAll(`Meeting:${meetingId}`);

    if (!meeting || Object.keys(meeting).length === 0) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    if (meeting.UserId !== req.user.id) {
      return res.status(403).json({
        error: "Unauthorized",
      });
    }

    res.status(200).json({ meeting });
  } catch (error) {
    console.error("Error fetching meeting details:", error);
    res.status(500).json({
      error: "Failed to fetch meeting details",
      message: error.message,
    });
  }
});

router.delete("/meetings/:meetingId", authenticateJWT, async (req, res) => {
  try {
    const redisClient = getRedisClient();
    const { meetingId } = req.params;
    const userId = req.user.id;

    const meeting = await redisClient.hGetAll(`Meeting:${meetingId}`);

    if (!meeting || Object.keys(meeting).length === 0) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    if (meeting.UserId !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await redisClient.del(`Meeting:${meetingId}`);
    await redisClient.zRem(`UserMeetings:${userId}`, meetingId);

    res.status(200).json({ message: "Meeting deleted successfully" });
  } catch (error) {
    console.error("Error deleting meeting:", error);
    res.status(500).json({
      error: "Failed to delete meeting",
      message: error.message,
    });
  }
});

router.get("/meetings/latest", authenticateJWT, async (req, res) => {
  try {
    const redisClient = getRedisClient();
    const userId = req.user.id;

    const bookingIds = await redisClient.zRange(
      `UserMeetings:${userId}`,
      -5,
      -1
    );

    if (bookingIds.length === 0) {
      return res.status(200).json({ meetings: [] });
    }

    const meetings = await Promise.all(
      bookingIds.map(async (bookingId) => {
        return await redisClient.hGetAll(`Meeting:${bookingId}`);
      })
    );

    const sortedMeetings = meetings.sort(
      (a, b) => parseInt(b.CreatedAt) - parseInt(a.CreatedAt)
    );

    res.status(200).json({ meetings: sortedMeetings });
  } catch (error) {
    console.error("Error fetching latest meetings:", error);
    res.status(500).json({
      error: "Failed to fetch latest meetings",
      message: error.message,
    });
  }
});

router.get("/availability/booking/latest", authenticateJWT, async (req, res) => {
  try {
    const redisClient = getRedisClient();
    const userId = req.user.id;

    const bookingIds = await redisClient.zRange(
      `UserMeetings:${userId}`,
      -5,
      -1
    );

    if (bookingIds.length === 0) {
      return res.status(200).json({ bookings: [] });
    }

    const bookings = await Promise.all(
      bookingIds.map(async (bookingId) => {
        return await redisClient.hGetAll(`Meeting:${bookingId}`);
      })
    );

    const sortedBookings = bookings.sort(
      (a, b) => parseInt(b.CreatedAt) - parseInt(a.CreatedAt)
    );

    res.status(200).json({ bookings: sortedBookings });
  } catch (error) {
    console.error("Error fetching latest bookings:", error);
    res.status(500).json({
      error: "Failed to fetch latest bookings",
      message: error.message,
    });
  }
});

router.get("/show-available-times/:rawDate", async (req, res) => {
  console.log("-------------Availability-------------------");
  const token = req.headers["authorization"]?.split(" ")[1];
  const { rawDate } = req.params;
  console.log("RawDate", rawDate);
  const currentTime = req.query.current_time;

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const redisClient = getRedisClient();
    const date = new Date(rawDate);
    const dayNumber = date.getDay() || 6;

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

    const [openHours, openMins] = openingTimeStr.split(":").map(Number);
    const [closeHours, closeMins] = closingTimeStr.split(":").map(Number);

    const openingMinutes = openHours * 60 + openMins;
    const closingMinutes = closeHours * 60 + closeMins;

    let availableTimes = [];
    for (let i = openingMinutes; i < closingMinutes; i += 60) {
      availableTimes.push(i);
    }

    const customTimes = await checkCustomAvailability(
      rawDate,
      availableTimes,
      "both"
    );

    const finalAvailableTimes = customTimes.length > 0
      ? customTimes
      : availableTimes;

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
