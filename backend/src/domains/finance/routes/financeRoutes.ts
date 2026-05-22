import { Router } from 'express';
import { authMiddleware } from '../../../middleware/authMiddleware.js';
import * as fc from '../controller/financeController.js';

const router = Router();

router.get('/balance/:userId', authMiddleware, fc.getBalance);
router.get('/balances', authMiddleware, fc.getAllBalances);
router.get('/rates', authMiddleware, fc.getRates);
router.post('/transaction', authMiddleware, fc.createTransaction);
router.get('/history/:userId', authMiddleware, fc.getTransactionHistory);

// Pending (expected) payments
router.post('/pending', authMiddleware, fc.createPendingPayment);
router.get('/pending', authMiddleware, fc.getAllPendingPayments);
router.get('/pending/:userId', authMiddleware, fc.getUserPendingPayments);
router.post('/pending/:pendingId/confirm', authMiddleware, fc.confirmPendingPayment);
router.post('/pending/:pendingId/reject', authMiddleware, fc.rejectPendingPayment);

export default router;
