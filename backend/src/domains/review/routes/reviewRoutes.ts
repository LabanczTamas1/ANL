import { Router } from 'express';
import { authMiddleware } from '../../../middleware/authMiddleware.js';
import { reviewLimiter } from '../../../middleware/rateLimiter.js';
import * as rc from '../controller/reviewController.js';

const router = Router();

router.post('/', authMiddleware, reviewLimiter, rc.addReview);
router.get('/', rc.getReviews);

export default router;
