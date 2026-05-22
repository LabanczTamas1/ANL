import { Router } from 'express';
import { authMiddleware } from '../../../middleware/authMiddleware.js';
import * as fc from '../controller/financeController.js';

const router = Router();

router.get('/balance/:userId', authMiddleware, fc.getBalance);
router.get('/balances', authMiddleware, fc.getAllBalances);
router.post('/transaction', authMiddleware, fc.createTransaction);
router.get('/history/:userId', authMiddleware, fc.getTransactionHistory);

export default router;
