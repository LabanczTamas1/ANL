import { Router } from 'express';
import { contactLimiter } from '../../../middleware/rateLimiter.js';
import { handleContactSubmission } from '../../../utils/mailUtils/contact.js';

const router = Router();

router.post('/contact', contactLimiter, handleContactSubmission);

export default router;
