import { Router } from 'express';
import { authMiddleware } from '../../../middleware/authMiddleware.js';
import {
  authLimiter,
  passwordResetLimiter,
  verificationLimiter,
} from '../../../middleware/rateLimiter.js';
import * as auth from '../controller/authController.js';

const router = Router();

// OAuth
router.get('/google', auth.googleAuth);
router.get('/google/callback', auth.googleCallback);
router.get('/facebook', auth.facebookAuth);
router.get('/facebook/callback', auth.facebookCallback);

// Email/password — brute-force + abuse protection
router.post('/register', authLimiter, auth.register);
router.post('/verify-email', verificationLimiter, auth.verifyEmail);
router.post('/resend-verification', verificationLimiter, auth.resendVerification);
router.post('/login', authLimiter, auth.login);
router.post('/forgot-password', passwordResetLimiter, auth.forgotPassword);
router.post('/reset-password', passwordResetLimiter, auth.resetPassword);

// Token management
router.post('/refresh', authLimiter, auth.refresh);
router.post('/logout', authMiddleware, auth.logout);
router.get('/check', authMiddleware, auth.authCheck);
router.get('/token-login', authMiddleware, auth.authCheck);

export default router;
