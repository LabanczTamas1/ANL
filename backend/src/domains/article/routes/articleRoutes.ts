// ---------------------------------------------------------------------------
// Article Routes — public reads + admin/owner authoring
// ---------------------------------------------------------------------------

import { Router } from 'express';
import { authMiddleware } from '../../../middleware/authMiddleware.js';
import { authorizeRole } from '../../../middleware/authorizationMiddleware.js';
import { apiLimiter } from '../../../middleware/rateLimiter.js';
import { UserRole } from '../../../utils/rbac.js';
import * as ac from '../controller/articleController.js';

const router = Router();

// ─── Public (no auth) ─────────────────────────────────────────────────────────
// Specific paths must be declared before the admin `/:id` param route so they
// are not shadowed by it.
router.get('/published', ac.listPublished);
router.get('/published/:slug', ac.getPublishedBySlug);

// ─── Admin / Owner authoring ──────────────────────────────────────────────────
const manage = [authMiddleware, authorizeRole(UserRole.ADMIN, UserRole.OWNER), apiLimiter];

router.get('/', ...manage, ac.listAll);
router.post('/', ...manage, ac.create);
router.get('/:id', ...manage, ac.getById);
router.put('/:id', ...manage, ac.update);
router.patch('/:id/status', ...manage, ac.setStatus);
router.delete('/:id', ...manage, ac.remove);

export default router;
