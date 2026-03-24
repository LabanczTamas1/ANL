// ---------------------------------------------------------------------------
// Admin Controller — stats, IP banning, user email listing
// ---------------------------------------------------------------------------

import { Request, Response } from 'express';
import { getRedisClient } from '../../../config/database.js';
import {
  getRequestStats,
  resetRequestStats,
} from '../../../utils/admin/trackRequest.js';
import { createLogger, logError } from '../../../utils/logger.js';

const logger = createLogger('admin', 'controller');

export async function getStats(_req: Request, res: Response): Promise<void> {
  try {
    const stats = await getRequestStats();
    res.json(stats);
  } catch (error) {
    logError(error, { context: 'getStats' });
    res.status(500).json({ error: 'Failed to retrieve request statistics' });
  }
}

export async function resetStats(_req: Request, res: Response): Promise<void> {
  try {
    const result = await resetRequestStats();
    res.json(result);
  } catch (error) {
    logError(error, { context: 'resetStats' });
    res.status(500).json({ error: 'Failed to reset request statistics' });
  }
}

export async function banIp(req: Request, res: Response): Promise<void> {
  try {
    const r = getRedisClient();
    const { ip } = req.body;
    if (!ip) {
      res.status(400).json({ error: 'IP address is required' });
      return;
    }
    await r.sAdd('banned_ips', ip);
    res.json({ message: `IP ${ip} has been banned.` });
  } catch (err) {
    logError(err, { context: 'banIp' });
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function unbanIp(req: Request, res: Response): Promise<void> {
  try {
    const r = getRedisClient();
    const { ip } = req.body;
    if (!ip) {
      res.status(400).json({ error: 'IP address is required' });
      return;
    }
    await r.sRem('banned_ips', ip);
    res.json({ message: `IP ${ip} has been unbanned.` });
  } catch (err) {
    logError(err, { context: 'unbanIp' });
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getBannedIps(_req: Request, res: Response): Promise<void> {
  try {
    const r = getRedisClient();
    const ips = await r.sMembers('banned_ips');
    res.json({ banned: ips });
  } catch (err) {
    logError(err, { context: 'getBannedIps' });
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getEmails(_req: Request, res: Response): Promise<void> {
  try {
    const r = getRedisClient();
    const pattern = 'user:email:*';
    const userDetails: Record<string, string>[] = [];
    const emails: string[] = [];

    let cursor = 0;
    do {
      const result = await r.scan(cursor, { MATCH: pattern, COUNT: 100 });
      cursor = result.cursor;
      for (const key of result.keys) {
        const email = key.replace('user:email:', '');
        emails.push(email);
        const userId = await r.get(key);
        const userInfo = await r.hGetAll(`user:${userId}`);
        userDetails.push({
          userId: userId || '',
          email,
          firstName: userInfo.firstName || '',
          lastName: userInfo.lastName || '',
          username: userInfo.username || '',
          createdAt: userInfo.createdAt || '',
        });
      }
    } while (cursor !== 0);

    res.status(200).json({
      success: true,
      count: emails.length,
      emails: userDetails,
    });
  } catch (err) {
    logError(err, { context: 'getEmails' });
    res.status(500).json({
      success: false,
      error: 'Server error while fetching emails',
    });
  }
}
