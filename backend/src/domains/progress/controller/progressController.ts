// ---------------------------------------------------------------------------
// Progress Controller
// ---------------------------------------------------------------------------

import { Request, Response } from 'express';
import { getRedisClient } from '../../../config/database.js';
import { logError } from '../../../utils/logger.js';

export async function changeUserProgress(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const r = getRedisClient();
    const { userId } = req.params;
    const { progressionStatus, progressionCategory, progressionTimeline } =
      req.body;

    const userKey = `user:${userId}`;
    const userData = await r.hGetAll(userKey);

    if (!userData || Object.keys(userData).length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const updateData: Record<string, string> = {};
    if (progressionStatus !== undefined)
      updateData.progressionStatus = progressionStatus;
    if (progressionCategory !== undefined)
      updateData.progressionCategory = progressionCategory;
    if (progressionTimeline !== undefined)
      updateData.progressionTimeline = progressionTimeline;

    await r.hSet(userKey, updateData);
    const updated = await r.hGetAll(userKey);

    res.status(200).json({
      message: 'User progress updated successfully',
      user: updated,
    });
  } catch (error) {
    logError(error, { context: 'changeUserProgress' });
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function allUsersProgress(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const r = getRedisClient();
    const usersProgress: Record<string, string>[] = [];

    let cursor = 0;
    do {
      const result = await r.scan(cursor, { MATCH: 'user:*', COUNT: 100 });
      cursor = result.cursor;

      for (const key of result.keys) {
        if (
          key.includes('email') ||
          key.includes('username') ||
          !key.startsWith('user:')
        )
          continue;

        const userData = await r.hGetAll(key);
        if (userData?.email) {
          usersProgress.push({
            userId: userData.id || key.replace('user:', ''),
            email: userData.email,
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            progressionStatus: userData.progressionStatus || 'pending',
            progressionCategory: userData.progressionCategory || '',
            progressionTimeline: userData.progressionTimeline || '',
          });
        }
      }
    } while (cursor !== 0);

    res.status(200).json({ count: usersProgress.length, data: usersProgress });
  } catch (error) {
    logError(error, { context: 'allUsersProgress' });
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function terminatedStatistics(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const r = getRedisClient();
    const usersStats: any = {
      total: 0,
      active: 0,
      inactive: 0,
      terminated: 0,
      byStatus: {},
    };

    let cursor = 0;
    do {
      const result = await r.scan(cursor, { MATCH: 'user:*', COUNT: 100 });
      cursor = result.cursor;

      for (const key of result.keys) {
        if (
          key.includes('email') ||
          key.includes('username') ||
          !key.startsWith('user:')
        )
          continue;

        const userData = await r.hGetAll(key);
        if (userData?.email) {
          usersStats.total++;
          const status = userData.progressionStatus || 'active';
          usersStats.byStatus[status] =
            (usersStats.byStatus[status] || 0) + 1;

          if (status === 'active') usersStats.active++;
          else if (status === 'inactive') usersStats.inactive++;
          else if (status === 'terminated') usersStats.terminated++;
        }
      }
    } while (cursor !== 0);

    res.status(200).json(usersStats);
  } catch (error) {
    logError(error, { context: 'terminatedStatistics' });
    res.status(500).json({ error: 'Internal server error' });
  }
}
