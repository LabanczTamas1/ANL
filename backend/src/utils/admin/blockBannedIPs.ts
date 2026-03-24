import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '../../config/database.js';
import { createLogger } from '../logger.js';

const logger = createLogger('admin', 'middleware');
const blockedIPsKey = 'banned_ips';

export function blockBannedIPs() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ip =
      (req.headers['x-forwarded-for'] as string) ||
      req.socket.remoteAddress ||
      '';

    try {
      const redisClient = getRedisClient();
      const isBanned = await redisClient.sIsMember(blockedIPsKey, ip);
      if (isBanned) {
        logger.warn({ ip, url: req.originalUrl }, 'Blocked banned IP');
        res.status(403).json({ error: 'Access denied: IP is banned' });
        return;
      }
      next();
    } catch (err) {
      logger.error({ err }, 'IP check error');
      next(); // Let the request pass if Redis fails
    }
  };
}
