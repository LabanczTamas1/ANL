const express = require("express");
const router = express.Router();
const authenticateJWT = require("../middleware/authenticateJWT");
const { authorizeRoles } = require("../helpers/authorizationHelpers");
const bookingController = require("../controllers/bookingController");

// ---------------------------------------------------------------------------
// Public Routes
// ---------------------------------------------------------------------------

/**
 * Create a new booking
 * POST /api/booking
 */
router.post("/", bookingController.createBooking.bind(bookingController));

/**
 * Get referral sources
 * GET /api/booking/referral-sources
 */
router.get("/referral-sources", bookingController.getReferralSources.bind(bookingController));

/**
 * Get availability for a specific date
 * GET /api/booking/availability/:date
 */
router.get("/availability/:date", bookingController.getAvailability.bind(bookingController));

// ---------------------------------------------------------------------------
// Authenticated Routes
// ---------------------------------------------------------------------------

/**
 * Get all bookings for the authenticated user
 * GET /api/booking
 */
router.get("/", authenticateJWT, bookingController.getUserBookings.bind(bookingController));

/**
 * Get latest bookings for authenticated user
 * GET /api/booking/latest
 */
router.get("/latest", authenticateJWT, bookingController.getLatestBookings.bind(bookingController));

/**
 * Get a single booking by ID
 * GET /api/booking/:bookingId
 */
router.get("/:bookingId", authenticateJWT, bookingController.getBookingById.bind(bookingController));

/**
 * Delete a booking
 * DELETE /api/booking/:bookingId
 */
router.delete("/:bookingId", authenticateJWT, bookingController.deleteBooking.bind(bookingController));

// ---------------------------------------------------------------------------
// Admin Routes
// ---------------------------------------------------------------------------

/**
 * Get ALL bookings (admin only)
 * GET /api/booking/all
 */
router.get("/all", authenticateJWT, authorizeRoles("admin"), bookingController.getAllBookings.bind(bookingController));

module.exports = router;
