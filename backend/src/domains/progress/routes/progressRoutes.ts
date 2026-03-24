import { Router } from 'express';
import { authMiddleware } from '../../../middleware/authMiddleware.js';
import * as pc from '../controller/progressController.js';

const router = Router();

router.patch('/changeUserProgress/:userId', authMiddleware, pc.changeUserProgress);
router.get('/allUsersProgress', authMiddleware, pc.allUsersProgress);
router.get('/terminatedStatistics', authMiddleware, pc.terminatedStatistics);

export default router;
