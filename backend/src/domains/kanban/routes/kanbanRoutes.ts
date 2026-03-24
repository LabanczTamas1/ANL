import { Router } from 'express';
import { authMiddleware } from '../../../middleware/authMiddleware.js';
import * as kc from '../controller/kanbanController.js';

const router = Router();

// Columns
router.post('/columns', authMiddleware, kc.createColumn);
router.get('/columns', authMiddleware, kc.getColumns);
router.put('/columns/priority', authMiddleware, kc.updateColumnPriority);
router.delete('/columns/:id', authMiddleware, kc.deleteColumn);

// Cards
router.post('/cards', authMiddleware, kc.createCard);
router.put('/cards/:cardId', authMiddleware, kc.updateCard);
router.delete('/cards/:cardId', authMiddleware, kc.deleteCard);
router.get('/cards/:columnId', authMiddleware, kc.getCards);
router.put('/cards/change/priority', authMiddleware, kc.moveCard);

// Comments
router.post('/cards/comments/:cardId', authMiddleware, kc.createComment);
router.get('/cards/comments/:cardId', authMiddleware, kc.getComments);
router.put('/cards/comments/:commentId', authMiddleware, kc.updateComment);
router.delete('/cards/comments/:commentId', authMiddleware, kc.deleteComment);

export default router;
