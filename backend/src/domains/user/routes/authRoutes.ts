import { Router } from 'express';
import { authMiddleware } from '../../../middleware/authMiddleware.js';
import * as auth from '../controller/authController.js';

const router = Router();

// OAuth
router.get('/google', auth.googleAuth);
router.get('/google/callback', auth.googleCallback);
router.get('/facebook', auth.facebookAuth);
router.get('/facebook/callback', auth.facebookCallback);

// Email/password
router.post('/register', auth.register);
router.post('/verify-email', auth.verifyEmail);
router.post('/resend-verification', auth.resendVerification);
router.post('/login', auth.login);
router.post('/forgot-password', auth.forgotPassword);
router.post('/reset-password', auth.resetPassword);

// Token management
router.post('/refresh', auth.refresh);
router.post('/logout', authMiddleware, auth.logout);
router.get('/check', authMiddleware, auth.authCheck);
router.get('/token-login', authMiddleware, auth.authCheck);

export default router;
