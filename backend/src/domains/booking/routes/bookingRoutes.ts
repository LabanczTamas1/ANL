import { Router } from 'express';
import { authMiddleware } from '../../../middleware/authMiddleware.js';
import { authorizeRole } from '../../../middleware/authorizationMiddleware.js';
import { bookingController } from '../controller/bookingController.js';
import { UserRole } from '../../../utils/rbac.js';

const router = Router();

// ---------------------------------------------------------------------------
// Public Routes
// ---------------------------------------------------------------------------
router.post('/', bookingController.createBooking.bind(bookingController));
router.get(
  '/referral-sources',
  bookingController.getReferralSources.bind(bookingController),
);
router.get(
  '/availability/:date',
  bookingController.getAvailability.bind(bookingController),
);
router.get(
  '/view/:accessToken',
  bookingController.getBookingByAccessToken.bind(bookingController),
);

// ---------------------------------------------------------------------------
// Authenticated Routes
// ---------------------------------------------------------------------------
router.get(
  '/',
  authMiddleware,
  bookingController.getUserBookings.bind(bookingController),
);
router.get(
  '/latest',
  authMiddleware,
  bookingController.getLatestBookings.bind(bookingController),
);
router.get(
  '/:bookingId',
  authMiddleware,
  bookingController.getBookingById.bind(bookingController),
);
router.delete(
  '/:bookingId',
  authMiddleware,
  bookingController.deleteBooking.bind(bookingController),
);

// ---------------------------------------------------------------------------
// Admin Routes
// ---------------------------------------------------------------------------
router.get(
  '/all',
  authMiddleware,
  authorizeRole(UserRole.ADMIN),
  bookingController.getAllBookings.bind(bookingController),
);

export default router;
