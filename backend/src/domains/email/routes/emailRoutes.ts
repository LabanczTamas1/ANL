import { Router } from 'express';
import { authMiddleware } from '../../../middleware/authMiddleware.js';
import * as ec from '../controller/emailController.js';

const router = Router();

router.post('/save-email', authMiddleware, ec.saveEmail);
router.put('/mark-as-read', authMiddleware, ec.markAsRead);
router.delete('/delete-emails', authMiddleware, ec.deleteEmails);
// unread-count reads username from query param — must be before /:username
router.get('/unread-count', authMiddleware, ec.getUnreadCount);
// SSE stream — token passed as query param (EventSource can't set headers)
router.get('/updates/stream', ec.streamUpdates);
router.get('/sentmails/:username', ec.getSentMails);
// catch-all must be last
router.get('/:username', ec.getInbox);

export default router;
