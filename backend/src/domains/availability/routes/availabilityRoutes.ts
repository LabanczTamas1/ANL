import { Router } from 'express';
import { authMiddleware } from '../../../middleware/authMiddleware.js';
import { authorizeRole } from '../../../middleware/authorizationMiddleware.js';
import { UserRole } from '../../../utils/rbac.js';
import * as ac from '../controller/availabilityController.js';

const router = Router();

router.patch('/standard-availability', authMiddleware, authorizeRole(UserRole.ADMIN, UserRole.OWNER), ac.updateStandardAvailability);
router.get('/standard-availability', ac.getStandardAvailability);
router.get('/add-availability/:rawDate', authMiddleware, authorizeRole(UserRole.ADMIN, UserRole.OWNER), ac.getAddAvailability);
router.get('/delete-availability/:rawDate', authMiddleware, authorizeRole(UserRole.ADMIN, UserRole.OWNER), ac.getDeleteAvailability);
router.post('/add-availability-to-the-database', authMiddleware, authorizeRole(UserRole.ADMIN, UserRole.OWNER), ac.addAvailabilityToDb);
router.delete('/delete-availability-to-the-database', authMiddleware, authorizeRole(UserRole.ADMIN, UserRole.OWNER), ac.deleteAvailabilityFromDb);
router.get('/show-available-times/:rawDate', ac.showAvailableTimes);

// Admin/Owner — overview & custom-time management
router.get('/admin-day-overview/:startDate/:endDate', authMiddleware, authorizeRole(UserRole.ADMIN, UserRole.OWNER), ac.adminDayOverview);
router.delete('/remove-added-time', authMiddleware, authorizeRole(UserRole.ADMIN, UserRole.OWNER), ac.removeAddedTime);
router.delete('/remove-deleted-time', authMiddleware, authorizeRole(UserRole.ADMIN, UserRole.OWNER), ac.removeDeletedTime);

export default router;
