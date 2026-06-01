import { Request, Response, NextFunction } from 'express';
import { queryOne } from '../db.js';
import { createLogger } from '../logger.js';

const logger = createLogger('admin', 'middleware');

export function blockBannedIPs() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ip =
      (req.headers['x-forwarded-for'] as string) ||
      req.socket.remoteAddress ||
      '';

    try {
      const row = await queryOne<{ value: string[] }>(
        `SELECT value FROM app_settings WHERE key = 'banned_ips'`,
      );
      const bannedIps = row ? (Array.isArray(row.value) ? row.value : []) : [];
      if (bannedIps.includes(ip)) {
        logger.warn({ ip, url: req.originalUrl }, 'Blocked banned IP');
        res.status(403).json({ error: 'Access denied: IP is banned' });
        return;
      }
      next();
    } catch (err) {
      logger.error({ err }, 'IP check error');
      next();
    }
  };
}
