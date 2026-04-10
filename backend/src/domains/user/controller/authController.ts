// ---------------------------------------------------------------------------
// Auth Controller — registration, login, OAuth callbacks, token refresh
// ---------------------------------------------------------------------------

import { Request, Response } from 'express';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import passport from '../../../utils/passport.js';
import { getRedisClient } from '../../../config/database.js';
import { env } from '../../../config/env.js';
import { JwtService } from '../../../utils/jwt.js';
import { hashPassword, verifyPassword } from '../../../utils/password.js';
import {
  registerToken,
  blacklistToken,
  isTokenBlacklisted,
  revokeFamily,
} from '../../../utils/tokenStore.js';
import { createLogger, logError } from '../../../utils/logger.js';

const logger = createLogger('user', 'controller');

// ---------------------------------------------------------------------------
// OAuth — Google
// ---------------------------------------------------------------------------

export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

export function googleCallback(req: Request, res: Response): void {
  const state = req.query.state as string | undefined;
  if (state) {
    try {
      req.calendarState = JSON.parse(
        Buffer.from(state, 'base64').toString(),
      );
    } catch {
      /* ignore */
    }
  }

  const handler = passport.authenticate('google', {
    failureRedirect: `${env.FRONTEND_URL}/login`,
  });

  handler(req, res, async () => {
    if (!req.user) {
      res.redirect(`${env.FRONTEND_URL}/oauth-callback?error=oauth_failed`);
      return;
    }

    if (req.calendarState) {
      try {
        const redisClient = getRedisClient();
        const { email, timeZone, date, time, eventTitle } = req.calendarState;

        const userData = await redisClient.hGetAll(`user:${req.user.id}`);

        const token = JwtService.signLegacy({
          id: req.user.id,
          email: req.user.email,
          role: userData.role || 'user',
          accessToken: req.user.accessToken,
          refreshToken: req.user.refreshToken,
        });

        const bookingData = {
          email,
          timeZone,
          date,
          time,
          eventTitle,
          googleAccessToken: req.user.accessToken,
          googleRefreshToken: req.user.refreshToken,
        };

        await redisClient.set(
          `calendar:${req.user.id}`,
          JSON.stringify(bookingData),
          { EX: 3600 },
        );

        res.redirect(
          `${env.FRONTEND_URL}/oauth-callback?token=${token}&calendar=true`,
        );
      } catch (error) {
        logError(error, { context: 'googleCallback_calendar' });
        res.redirect(
          `${env.FRONTEND_URL}/oauth-callback?error=server_error`,
        );
      }
    } else {
      const token = JwtService.signLegacy({
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
      });

      res.redirect(
        `${env.FRONTEND_URL}/oauth-callback?token=${token}`,
      );
    }
  });
}

// ---------------------------------------------------------------------------
// OAuth — Facebook
// ---------------------------------------------------------------------------

export const facebookAuth = passport.authenticate('facebook', {
  scope: ['email', 'public_profile'],
});

export function facebookCallback(req: Request, res: Response): void {
  passport.authenticate('facebook', {
    failureRedirect: `${env.FRONTEND_URL}/login`,
  })(req, res, () => {
    if (!req.user) {
      res.redirect(`${env.FRONTEND_URL}/login`);
      return;
    }

    const token = JwtService.signLegacy({
      id: req.user.id,
      email: req.user.email,
      role: req.user.role || 'user',
    });

    res.redirect(
      `${env.FRONTEND_URL}/oauth-callback?token=${token}`,
    );
  });
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const redisClient = getRedisClient();
    const { email, password, firstName, lastName, username } = req.body;

    if (!email || !password || !firstName || !lastName || !username) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    const userExists = await redisClient.exists(`user:email:${email}`);
    if (userExists) {
      res.status(409).json({ error: 'User already exists' });
      return;
    }

    const userId = uuidv4();
    const hashedPw = await hashPassword(password);

    await redisClient.hSet(`user:${userId}`, {
      id: userId,
      email,
      firstName,
      lastName,
      username,
      password: hashedPw,
      role: 'user',
      verified: 'false',
      createdAt: new Date().toISOString(),
    });

    await redisClient.set(`user:email:${email}`, userId);
    await redisClient.set(`user:username:${username}`, userId);

    // Email verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    await redisClient.set(`verify:email:${email}`, verificationCode, {
      EX: 15 * 60,
    });

    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: false,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
      to: env.APP_ENV === 'PRODUCTION' ? email : 'deid.unideb@gmail.com',
      subject: 'Verify your email',
      text: `Your verification code is: ${verificationCode}`,
      html: `<p>Your verification code is: <strong>${verificationCode}</strong></p>`,
    });

    logger.info({ userId, email }, 'User registered (verification sent)');

    // Issue tokens
    const accessToken = JwtService.signAccessToken({
      id: userId,
      email,
      username,
      role: 'user',
    });

    const { token: refreshTokenStr, jti, fid } =
      JwtService.signRefreshToken(userId);
    await registerToken(userId, fid, jti);

    // Set refresh token cookie for web clients
    const isWeb = req.headers['x-client-platform'] === 'web';
    if (isWeb) {
      res.cookie('refreshToken', refreshTokenStr, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: env.REFRESH_TOKEN_EXPIRY_SECONDS * 1000,
      });
    }

    res.status(201).json({
      message:
        'Registration successful. Please check your email for the verification code.',
      userId,
      accessToken,
      ...(isWeb ? {} : { refreshToken: refreshTokenStr }),
      user: { id: userId, email, username, role: 'user' },
    });
  } catch (error) {
    logError(error, { context: 'register' });
    res.status(500).json({ error: 'Registration failed' });
  }
}

// ---------------------------------------------------------------------------
// Email Verification
// ---------------------------------------------------------------------------

export async function verifyEmail(req: Request, res: Response): Promise<void> {
  try {
    const redisClient = getRedisClient();
    const { email, code } = req.body;

    if (!email || !code) {
      res.status(400).json({ error: 'Email and code are required' });
      return;
    }

    const storedCode = await redisClient.get(`verify:email:${email}`);
    if (!storedCode) {
      res.status(400).json({ error: 'Verification code expired' });
      return;
    }
    if (storedCode !== code) {
      res.status(400).json({ error: 'Invalid verification code' });
      return;
    }

    const userId = await redisClient.get(`user:email:${email}`);
    if (!userId) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    await redisClient.hSet(`user:${userId}`, {
      verified: 'true',
      verifiedAt: new Date().toISOString(),
    });
    await redisClient.del(`verify:email:${email}`);

    logger.info({ userId, email }, 'Email verified');
    res.status(200).json({ message: 'Email successfully verified', userId });
  } catch (error) {
    logError(error, { context: 'verifyEmail' });
    res.status(500).json({ error: 'Email verification failed' });
  }
}

// ---------------------------------------------------------------------------
// Resend Verification
// ---------------------------------------------------------------------------

export async function resendVerification(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const redisClient = getRedisClient();
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const userId = await redisClient.get(`user:email:${email}`);
    if (!userId) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = await redisClient.hGetAll(`user:${userId}`);
    if (user.verified === 'true') {
      res.status(400).json({ error: 'User is already verified' });
      return;
    }

    const verificationCode = crypto.randomInt(100000, 999999).toString();
    await redisClient.set(`verify:email:${email}`, verificationCode, {
      EX: 15 * 60,
    });

    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: false,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
      to: email,
      subject: 'Verify your email',
      text: `Your new verification code is: ${verificationCode}`,
      html: `<p>Your new verification code is: <strong>${verificationCode}</strong></p>`,
    });

    logger.info({ userId, email }, 'Verification code resent');
    res
      .status(200)
      .json({ message: 'Verification code resent. Please check your email.' });
  } catch (error) {
    logError(error, { context: 'resendVerification' });
    res.status(500).json({ error: 'Failed to resend verification code' });
  }
}

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const redisClient = getRedisClient();
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    let userId: string | null;
    if (email.includes('@')) {
      userId = await redisClient.get(`user:email:${email}`);
    } else {
      userId = await redisClient.get(`user:username:${email}`);
    }

    if (!userId) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const userData = await redisClient.hGetAll(`user:${userId}`);
    if (!userData) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const passwordValid = await verifyPassword(
      password,
      userData.password || userData.hashedPassword || '',
    );
    if (!passwordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Issue tokens
    const accessToken = JwtService.signAccessToken({
      id: userId,
      email: userData.email,
      username: userData.username,
      role: userData.role || 'user',
    });

    const { token: refreshTokenStr, jti, fid } =
      JwtService.signRefreshToken(userId);
    await registerToken(userId, fid, jti);

    const isWeb = req.headers['x-client-platform'] === 'web';
    if (isWeb) {
      res.cookie('refreshToken', refreshTokenStr, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: env.REFRESH_TOKEN_EXPIRY_SECONDS * 1000,
      });
    }

    logger.info({ userId, email: userData.email }, 'User logged in');

    res.json({
      accessToken,
      ...(isWeb ? {} : { refreshToken: refreshTokenStr }),
      userId,
      user: {
        id: userId,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        verified: userData.verified,
      },
    });
  } catch (error) {
    logError(error, { context: 'login' });
    res.status(500).json({ error: 'Login failed' });
  }
}

// ---------------------------------------------------------------------------
// Refresh Token Rotation
// ---------------------------------------------------------------------------

export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    const tokenStr =
      req.cookies?.refreshToken || req.body?.refreshToken;

    if (!tokenStr) {
      res.status(401).json({ error: 'Refresh token required' });
      return;
    }

    let payload;
    try {
      payload = JwtService.verifyRefreshToken(tokenStr);
    } catch {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    const { sub: userId, jti, fid } = payload;

    // Check blacklist — reuse detection
    const blacklisted = await isTokenBlacklisted(jti);
    if (blacklisted) {
      logger.warn(
        { userId, jti, fid },
        'Refresh token reuse detected — revoking family',
      );
      await revokeFamily(fid);
      res.status(401).json({ error: 'Unauthorized — session revoked' });
      return;
    }

    // Blacklist old token
    await blacklistToken(jti, fid);

    // Issue new pair
    const redisClient = getRedisClient();
    const userData = await redisClient.hGetAll(`user:${userId}`);

    const accessToken = JwtService.signAccessToken({
      id: userId,
      email: userData.email,
      username: userData.username,
      role: userData.role || 'user',
    });

    const { token: newRefreshStr, jti: newJti } =
      JwtService.signRefreshToken(userId, fid);
    await registerToken(userId, fid, newJti);

    const isWeb = req.headers['x-client-platform'] === 'web';
    if (isWeb) {
      res.cookie('refreshToken', newRefreshStr, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: env.REFRESH_TOKEN_EXPIRY_SECONDS * 1000,
      });
    }

    res.json({
      accessToken,
      ...(isWeb ? {} : { refreshToken: newRefreshStr }),
    });
  } catch (error) {
    logError(error, { context: 'refresh' });
    res.status(500).json({ error: 'Token refresh failed' });
  }
}

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------

export async function logout(req: Request, res: Response): Promise<void> {
  try {
    const tokenStr =
      req.cookies?.refreshToken || req.body?.refreshToken;

    if (tokenStr) {
      try {
        const payload = JwtService.verifyRefreshToken(tokenStr);
        await revokeFamily(payload.fid);
      } catch {
        /* token already invalid — ok */
      }
    }

    res.clearCookie('refreshToken', { path: '/' });
    res.status(204).send();
  } catch (error) {
    logError(error, { context: 'logout' });
    res.status(500).json({ error: 'Logout failed' });
  }
}

// ---------------------------------------------------------------------------
// Auth Check (token-login)
// ---------------------------------------------------------------------------

export function authCheck(req: Request, res: Response): void {
  res.json({
    user: {
      id: req.user!.id,
      email: req.user!.email,
      name: (req.user as any).name || req.user!.username,
      role: req.user!.role,
    },
  });
}
