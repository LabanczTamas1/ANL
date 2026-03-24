import { Router } from 'express';
import { authMiddleware } from '../../../middleware/authMiddleware.js';
import * as ec from '../controller/emailController.js';

const router = Router();

router.post('/save-email', authMiddleware, ec.saveEmail);
router.put('/mark-as-read', authMiddleware, ec.markAsRead);
router.get('/unread-count/:username', authMiddleware, ec.getUnreadCount);
router.delete('/delete-emails', authMiddleware, ec.deleteEmails);
router.get('/sentmails/:username', ec.getSentMails);
router.get('/:username', ec.getInbox);

export default router;
