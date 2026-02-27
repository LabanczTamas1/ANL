const bookingService = require("../services/bookingService");
const { logError, logBusinessEvent } = require("../config/logger");

/**
 * Controller for booking-related HTTP requests
 */
class BookingController {
  /**
   * Create a new booking
   * POST /api/booking
   */
  async createBooking(req, res) {
    try {
      const bookingDetails = await bookingService.createBooking(req.body);
      
      res.status(201).json({
        message: "Booking created successfully",
        meetingId: bookingDetails.id,
        meetLink: bookingDetails.meetLink,
        bookingDetails,
      });
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json(error);
      }
      logError(error, { context: 'createBooking', body: req.body });
      res.status(500).json({
        error: "Failed to create booking",
        message: error.message,
      });
    }
  }

  /**
   * Get referral sources
   * GET /api/booking/referral-sources
   */
  getReferralSources(req, res) {
    res.status(200).json({ sources: bookingService.referralSources });
  }

  /**
   * Get all bookings (admin only)
   * GET /api/booking/all
   */
  async getAllBookings(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const offset = parseInt(req.query.offset) || 0;
      
      const bookings = await bookingService.getAllBookings(limit, offset);
      
      res.status(200).json({
        bookings,
        count: bookings.length,
        limit,
        offset,
      });
    } catch (error) {
      logError(error, { context: 'getAllBookings' });
      res.status(500).json({
        error: "Failed to fetch all bookings",
        message: error.message,
      });
    }
  }

  /**
   * Get bookings for authenticated user
   * GET /api/booking
   */
  async getUserBookings(req, res) {
    try {
      const userId = req.user.id; // email
      const bookings = await bookingService.getBookingsByEmail(userId);
      
      res.status(200).json({ bookings });
    } catch (error) {
      logError(error, { context: 'getUserBookings', userId: req.user?.id });
      res.status(500).json({
        error: "Failed to fetch bookings",
        message: error.message,
      });
    }
  }

  /**
   * Get latest bookings for authenticated user
   * GET /api/booking/latest
   */
  async getLatestBookings(req, res) {
    try {
      const userId = req.user.id;
      const bookings = await bookingService.getLatestBookingsByEmail(userId, 5);
      
      res.status(200).json({ bookings });
    } catch (error) {
      logError(error, { context: 'getLatestBookings', userId: req.user?.id });
      res.status(500).json({
        error: "Failed to fetch latest bookings",
        message: error.message,
      });
    }
  }

  /**
   * Get a single booking by ID
   * GET /api/booking/:bookingId
   */
  async getBookingById(req, res) {
    try {
      const { bookingId } = req.params;
      const booking = await bookingService.getBookingById(bookingId);

      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      res.status(200).json({ booking });
    } catch (error) {
      logError(error, { context: 'getBookingById', bookingId: req.params.bookingId });
      res.status(500).json({
        error: "Failed to fetch booking details",
        message: error.message,
      });
    }
  }

  /**
   * Delete a booking
   * DELETE /api/booking/:bookingId
   */
  async deleteBooking(req, res) {
    try {
      const { bookingId } = req.params;
      const userId = req.user.id;

      const result = await bookingService.deleteBooking(bookingId, userId);
      
      logBusinessEvent('booking_deleted', { bookingId, userId });
      
      res.status(200).json(result);
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json({ error: error.error });
      }
      logError(error, { context: 'deleteBooking', bookingId: req.params.bookingId, userId: req.user?.id });
      res.status(500).json({
        error: "Failed to delete booking",
        message: error.message,
      });
    }
  }

  /**
   * Get availability for a date
   * GET /api/booking/availability/:date
   */
  async getAvailability(req, res) {
    try {
      const { date } = req.params;
      const availability = await bookingService.getAvailabilityForDate(date);

      if (availability.availableTimes.length === 0) {
        return res.status(200).json({
          availableTimes: [],
          message: "No availability on this day",
        });
      }

      res.status(200).json(availability);
    } catch (error) {
      logError(error, { context: 'getAvailability', date: req.params.date });
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  }
}

module.exports = new BookingController();
