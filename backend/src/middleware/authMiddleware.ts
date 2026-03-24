// ---------------------------------------------------------------------------
// Auth Middleware — JWT verification
// ---------------------------------------------------------------------------

import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../utils/jwt.js';
import { getRedisClient } from '../config/database.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('auth', 'middleware');

/**
 * Verify the access token from the `Authorization: Bearer <token>` header.
 * Attaches `req.user` with id, role, and Redis-stored user data.
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    // Try new RS256/HS256 access token first
    let decoded: Record<string, any>;
    try {
      decoded = JwtService.verifyAccessToken(token);
    } catch {
      // Fall back to legacy HS256 token (backward compat)
      decoded = JwtService.verifyLegacy(token) as Record<string, any>;
    }

    const userId = decoded.sub || decoded.id;
    if (!userId) {
      res.status(401).json({ error: 'Invalid token payload' });
      return;
    }

    const redisClient = getRedisClient();
    const exists = await redisClient.exists(`user:${userId}`);
    if (!exists) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const userData = await redisClient.hGetAll(`user:${userId}`);
    if (!userData) {
      res.status(404).json({ error: 'User data not found' });
      return;
    }

    req.user = {
      id: userId,
      sub: userId,
      email: decoded.email || userData.email,
      username: decoded.username || userData.username,
      role: userData.role || decoded.role || 'user',
      ...userData,
    };

    logger.debug(
      { userId, role: req.user.role },
      'User authenticated',
    );
    next();
  } catch (err) {
    logger.warn({ err }, 'JWT verification failed');
    res.status(403).json({ error: 'Invalid or expired token' });
  }
}
