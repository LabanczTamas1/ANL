import { Router } from 'express';
import { authMiddleware } from '../../../middleware/authMiddleware.js';
import * as uc from '../controller/userController.js';

const router = Router();

router.get('/me', authMiddleware, uc.getMe);
router.get('/listAllUsers', authMiddleware, uc.getAllUsers);
router.post('/add-user', authMiddleware, uc.addUser);
router.get('/profile', authMiddleware, uc.getProfile);
router.put('/profile', authMiddleware, uc.updateProfile);
router.patch('/updateUserRole/:userId', uc.updateUserRole);
router.patch('/modifyUserData', authMiddleware, uc.modifyUserData);
router.patch('/change-password', authMiddleware, uc.changePassword);
router.get('/:userId', authMiddleware, uc.getUserById);
router.get('/:username', uc.getUserByUsername);

export default router;
