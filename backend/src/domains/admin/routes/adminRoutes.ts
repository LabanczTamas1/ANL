import { Router } from 'express';
import { authMiddleware } from '../../../middleware/authMiddleware.js';
import { authorizeRole } from '../../../middleware/authorizationMiddleware.js';
import { UserRole } from '../../../utils/rbac.js';
import * as ac from '../controller/adminController.js';

const router = Router();

router.get(
  '/stats',
  authMiddleware,
  authorizeRole(UserRole.ADMIN, UserRole.OWNER),
  ac.getStats,
);
router.post(
  '/stats/reset',
  authMiddleware,
  authorizeRole(UserRole.ADMIN, UserRole.OWNER),
  ac.resetStats,
);
router.post(
  '/ban-ip',
  authMiddleware,
  authorizeRole(UserRole.ADMIN),
  ac.banIp,
);
router.post(
  '/unban-ip',
  authMiddleware,
  authorizeRole(UserRole.ADMIN),
  ac.unbanIp,
);
router.get(
  '/banned-ips',
  authMiddleware,
  authorizeRole(UserRole.ADMIN),
  ac.getBannedIps,
);
router.get(
  '/emails',
  authMiddleware,
  authorizeRole(UserRole.ADMIN, UserRole.OWNER),
  ac.getEmails,
);

// ── Meeting Hosts management ─────────────────────────────────────────────
router.get(
  '/meeting-hosts',
  authMiddleware,
  authorizeRole(UserRole.ADMIN, UserRole.OWNER),
  ac.getMeetingHosts,
);
router.post(
  '/meeting-hosts',
  authMiddleware,
  authorizeRole(UserRole.ADMIN, UserRole.OWNER),
  ac.addMeetingHost,
);
router.delete(
  '/meeting-hosts',
  authMiddleware,
  authorizeRole(UserRole.ADMIN, UserRole.OWNER),
  ac.removeMeetingHost,
);

// ── Google Calendar connection ────────────────────────────────────────────
router.get(
  '/calendar/status',
  authMiddleware,
  authorizeRole(UserRole.ADMIN, UserRole.OWNER),
  ac.getCalendarStatus,
);
router.get(
  '/calendar/auth-url',
  authMiddleware,
  authorizeRole(UserRole.ADMIN, UserRole.OWNER),
  ac.getCalendarAuthUrl,
);
router.post(
  '/calendar/callback',
  authMiddleware,
  authorizeRole(UserRole.ADMIN, UserRole.OWNER),
  ac.handleCalendarCallback,
);
router.post(
  '/calendar/disconnect',
  authMiddleware,
  authorizeRole(UserRole.ADMIN, UserRole.OWNER),
  ac.disconnectCalendar,
);

export default router;
