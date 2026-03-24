import { Router } from 'express';
import { handleContactSubmission } from '../../../utils/mailUtils/contact.js';

const router = Router();

router.post('/contact', handleContactSubmission);

export default router;
