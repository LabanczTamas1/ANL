const { v4: uuidv4 } = require("uuid");
const { google } = require("googleapis");
const bookingRepository = require("../repositories/bookingRepository");
const { getRedisClient } = require("../config/database");
const { convertMinutesToTime } = require("../helpers/timeHelpers");
const { checkCustomAvailability } = require("../helpers/availabilityHelpers");
const { logger, logError, logBusinessEvent } = require("../config/logger");

const REFERRAL_SOURCES = [
  "Google Search",
  "Social Media (LinkedIn, Facebook, etc.)",
  "Friend or Colleague Referral",
  "Conference or Event",
  "Advertisement",
  "Blog or Article",
  "Other",
];

/**
 * Business logic for bookings
 */
class BookingService {
  constructor() {
    this.referralSources = REFERRAL_SOURCES;
  }

  /**
   * Validate booking data
   */
  validateBookingData(data) {
    const errors = [];

    if (!data.fullName || !data.fullName.trim()) {
      errors.push("Full name is required.");
    }
    if (!data.email || !data.email.trim()) {
      errors.push("Email is required.");
    }
    if (!data.company || !data.company.trim()) {
      errors.push("Company name is required.");
    }
    if (!data.referralSource || !data.referralSource.trim()) {
      errors.push('"Where did you hear about us?" is required.');
    }
    if (
      data.referralSource === "Other" &&
      (!data.referralSourceOther || !data.referralSourceOther.trim())
    ) {
      errors.push("Please specify where you heard about us.");
    }
    if (!data.date) {
      errors.push("Date is required.");
    }
    if (data.time === undefined || data.time === null || data.time === "") {
      errors.push("Time is required.");
    }

    return errors;
  }

  /**
   * Get available times for a date
   */
  async getAvailableTimesForDate(date) {
    const redisClient = getRedisClient();
    
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
    const dayNumber = dateObj.getDay() === 0 ? 6 : dateObj.getDay() - 1;
    const dayName = weekdays[dayNumber] || "Monday";

    const standardAvailability = await redisClient.hGetAll(
      `StandardAvailability:${dayName}`
    );

    let availableTimes = [];
    if (standardAvailability && standardAvailability.IsDayOff !== "true") {
      const openingTimeStr = standardAvailability.OpeningTime || "09:00";
      const closingTimeStr = standardAvailability.ClosingTime || "17:00";
      const [openH, openM] = openingTimeStr.split(":").map(Number);
      const [closeH, closeM] = closingTimeStr.split(":").map(Number);
      const openingMinutes = openH * 60 + openM;
      const closingMinutes = closeH * 60 + closeM;
      
      for (let i = openingMinutes; i < closingMinutes; i += 60) {
        availableTimes.push(i);
      }
    }

    const customAvailability = await checkCustomAvailability(
      date,
      availableTimes,
      "both"
    );

    return customAvailability.length > 0 ? customAvailability : availableTimes;
  }

  /**
   * Create Google Meet event
   */
  async createGoogleMeetEvent(date, time, email, oauth2Client, timezone = "America/New_York") {
    try {
      const calendar = google.calendar({ version: "v3", auth: oauth2Client });
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
            conferenceSolution: { key: { conferenceType: "hangoutsMeet" } },
          },
        },
        attendees: [{ email }],
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
      logError(error, { 
        context: 'createGoogleMeetEvent',
        email,
        date,
        time
      });
      return null;
    }
  }

  /**
   * Create a new booking
   */
  async createBooking(bookingData) {
    // Validate
    const errors = this.validateBookingData(bookingData);
    if (errors.length > 0) {
      throw { status: 400, errors };
    }

    // Check availability
    const availableTimes = await this.getAvailableTimesForDate(bookingData.date);
    const timeInMinutes = parseInt(bookingData.time, 10);
    
    if (!availableTimes.includes(timeInMinutes)) {
      throw {
        status: 400,
        error: "Selected time is not available.",
        availableTimes,
      };
    }

    // Try to create Google Meet link if calendar data exists
    let meetLink = null;
    const redisClient = getRedisClient();
    const calendarData = await redisClient.get(`calendar:${bookingData.email}`);
    
    if (calendarData) {
      try {
        const bookingCalData = JSON.parse(calendarData);
        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          "http://localhost:5173/oauth-callback"
        );
        oauth2Client.setCredentials({
          access_token: bookingCalData.googleAccessToken,
          refresh_token: bookingCalData.googleRefreshToken,
        });
        
        const result = await this.createGoogleMeetEvent(
          bookingData.date,
          convertMinutesToTime(timeInMinutes),
          bookingData.email,
          oauth2Client,
          bookingData.timezone || "America/New_York"
        );
        
        if (result) {
          meetLink = result.meetLink;
        }
      } catch (meetError) {
        logError(meetError, {
          context: 'createBooking_meetLink',
          email: bookingData.email,
          date: bookingData.date
        });
      }
    }

    // Create booking
    const bookingId = uuidv4();
    const newBooking = await bookingRepository.insert({
      id: bookingId,
      fullName: bookingData.fullName.trim(),
      email: bookingData.email.trim(),
      company: bookingData.company.trim(),
      referralSource: bookingData.referralSource.trim(),
      referralSourceOther:
        bookingData.referralSource === "Other"
          ? (bookingData.referralSourceOther || "").trim()
          : null,
      date: bookingData.date,
      time: timeInMinutes,
      timezone: bookingData.timezone || "America/New_York",
      meetLink,
      status: "confirmed",
      notes: bookingData.notes || null,
    });

    // Cache in Redis
    try {
      await redisClient.setEx(
        `booking:${bookingId}`,
        86400,
        JSON.stringify(newBooking)
      );
    } catch (cacheErr) {
      logger.warn({ err: cacheErr, bookingId }, 'Redis cache write failed (non-critical)');
    }

    // Log business event
    logBusinessEvent('booking_created', {
      bookingId,
      email: bookingData.email,
      company: bookingData.company,
      date: bookingData.date,
      hasMeetLink: !!meetLink
    });

    return {
      id: bookingId,
      fullName: newBooking.full_name,
      email: newBooking.email,
      company: newBooking.company,
      referralSource: newBooking.referral_source,
      date: newBooking.date,
      time: convertMinutesToTime(timeInMinutes),
      timezone: newBooking.timezone,
      meetLink: meetLink || "",
    };
  }

  /**
   * Get booking by ID with caching
   */
  async getBookingById(bookingId) {
    const redisClient = getRedisClient();
    
    // Try cache first
    const cached = await redisClient.get(`booking:${bookingId}`);
    if (cached) {
      return JSON.parse(cached);
    }

    // Get from database
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      return null;
    }

    // Re-cache
    try {
      await redisClient.setEx(
        `booking:${bookingId}`,
        86400,
        JSON.stringify(booking)
      );
    } catch (_) {
      // Ignore cache errors
    }

    return booking;
  }

  /**
   * Get all bookings for a user
   */
  async getBookingsByEmail(email) {
    return await bookingRepository.findByEmail(email);
  }

  /**
   * Get latest bookings for a user
   */
  async getLatestBookingsByEmail(email, limit = 5) {
    return await bookingRepository.findLatestByEmail(email, limit);
  }

  /**
   * Get all bookings (admin)
   */
  async getAllBookings(limit = 100, offset = 0) {
    return await bookingRepository.findAll(limit, offset);
  }

  /**
   * Delete a booking
   */
  async deleteBooking(bookingId, userEmail) {
    const booking = await bookingRepository.findById(bookingId);
    
    if (!booking) {
      throw { status: 404, error: "Booking not found" };
    }
    
    if (booking.email !== userEmail) {
      throw { status: 403, error: "Unauthorized" };
    }

    await bookingRepository.delete(bookingId);

    // Evict from cache
    try {
      const redisClient = getRedisClient();
      await redisClient.del(`booking:${bookingId}`);
    } catch (_) {
      // Ignore cache errors
    }

    return { message: "Booking deleted successfully" };
  }

  /**
   * Get availability for a date with formatted times
   */
  async getAvailabilityForDate(date) {
    const availableTimes = await this.getAvailableTimesForDate(date);

    const convertedTimes = availableTimes.map((minutes) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHour = hours % 12 === 0 ? 12 : hours % 12;
      return `${displayHour}:${mins.toString().padStart(2, "0")} ${ampm}`;
    });

    return {
      date,
      availableTimes: convertedTimes,
      rawMinutes: availableTimes,
    };
  }
}

module.exports = new BookingService();
