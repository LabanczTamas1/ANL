import { Router } from 'express';
import { authMiddleware } from '../../../middleware/authMiddleware.js';
import { authorizeRole } from '../../../middleware/authorizationMiddleware.js';
import { UserRole } from '../../../utils/rbac.js';
import * as pc from '../controller/progressController.js';

const router = Router();

const adminOrOwner = authorizeRole(UserRole.ADMIN, UserRole.OWNER);

// ── Current user ─────────────────────────────────────────────────────────────
router.get('/me', authMiddleware, pc.getMyProgress);

// ── Admin / owner management ─────────────────────────────────────────────────
router.get('/summary', authMiddleware, adminOrOwner, pc.getUsersProgressSummary);
router.get('/users/:userId', authMiddleware, adminOrOwner, pc.getUserProgress);
router.post(
  '/users/:userId/milestones',
  authMiddleware,
  adminOrOwner,
  pc.createMilestone,
);
router.patch(
  '/milestones/:milestoneId',
  authMiddleware,
  adminOrOwner,
  pc.updateMilestone,
);
router.delete(
  '/milestones/:milestoneId',
  authMiddleware,
  adminOrOwner,
  pc.deleteMilestone,
);

// ── Legacy progression endpoints (kept for backward compatibility) ───────────
router.patch('/changeUserProgress/:userId', authMiddleware, pc.changeUserProgress);
router.get('/allUsersProgress', authMiddleware, pc.allUsersProgress);
router.get('/terminatedStatistics', authMiddleware, pc.terminatedStatistics);

export default router;
