import { Router } from 'express';
import { authMiddleware } from '../../../middleware/authMiddleware.js';
import * as rc from '../controller/reviewController.js';

const router = Router();

router.post('/', authMiddleware, rc.addReview);
router.get('/', rc.getReviews);

export default router;
