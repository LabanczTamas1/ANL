import { Router } from 'express';
import { authMiddleware } from '../../../middleware/authMiddleware.js';
import * as ac from '../controller/availabilityController.js';

const router = Router();

router.patch('/standard-availability', authMiddleware, ac.updateStandardAvailability);
router.get('/standard-availability', ac.getStandardAvailability);
router.get('/add-availability/:rawDate', authMiddleware, ac.getAddAvailability);
router.get('/delete-availability/:rawDate', authMiddleware, ac.getDeleteAvailability);
router.post('/add-availability-to-the-database', authMiddleware, ac.addAvailabilityToDb);
router.delete('/delete-availability-to-the-database', authMiddleware, ac.deleteAvailabilityFromDb);
router.get('/show-available-times/:rawDate', ac.showAvailableTimes);

// Admin — overview & custom-time management
router.get('/admin-day-overview/:startDate/:endDate', authMiddleware, ac.adminDayOverview);
router.delete('/remove-added-time', authMiddleware, ac.removeAddedTime);
router.delete('/remove-deleted-time', authMiddleware, ac.removeDeletedTime);

export default router;
