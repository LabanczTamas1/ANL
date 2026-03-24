// ---------------------------------------------------------------------------
// API v1 — route prefix constants and router mounting
// ---------------------------------------------------------------------------

import { Router } from 'express';

// Domain routers
import authRoutes from '../../domains/user/routes/authRoutes.js';
import userRoutes from '../../domains/user/routes/userRoutes.js';
import adminRoutes from '../../domains/admin/routes/adminRoutes.js';
import emailRoutes from '../../domains/email/routes/emailRoutes.js';
import contactRoutes from '../../domains/contact/routes/contactRoutes.js';
import kanbanRoutes from '../../domains/kanban/routes/kanbanRoutes.js';
import availabilityRoutes from '../../domains/availability/routes/availabilityRoutes.js';
import bookingRoutes from '../../domains/booking/routes/bookingRoutes.js';
import fileManagementRoutes from '../../domains/fileManagement/routes/fileManagementRoutes.js';
import progressRoutes from '../../domains/progress/routes/progressRoutes.js';
import reviewRoutes from '../../domains/review/routes/reviewRoutes.js';

const router = Router();

// ─── Domain prefixes ─────────────────────────────────────────────────────────

router.use('/user/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/admin', adminRoutes);
router.use('/email', emailRoutes);
router.use('/contact', contactRoutes);
router.use('/kanban', kanbanRoutes);
router.use('/availability', availabilityRoutes);
router.use('/booking', bookingRoutes);
router.use('/file', fileManagementRoutes);
router.use('/progress', progressRoutes);
router.use('/reviews', reviewRoutes);

export default router;
