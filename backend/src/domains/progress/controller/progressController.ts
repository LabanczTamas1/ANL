// ---------------------------------------------------------------------------
// Progress Controller
// ---------------------------------------------------------------------------

import { Request, Response } from 'express';
import { logError } from '../../../utils/logger.js';
import { notifyProgressUpdated } from '../../../utils/systemNotifications.js';
import * as userRepo from '../../user/repository/userRepository.js';
import { query } from '../../../utils/db.js';

export async function changeUserProgress(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { userId } = req.params;
    const { progressionStatus, progressionCategory, progressionTimeline } = req.body;

    const user = await userRepo.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const updates: Record<string, any> = {};
    if (progressionStatus !== undefined) updates.progressionStatus = progressionStatus;
    if (progressionCategory !== undefined) updates.progressionCategory = progressionCategory;
    if (progressionTimeline !== undefined) updates.progressionTimeline = progressionTimeline;

    await userRepo.updateUser(userId, updates);
    const updated = await userRepo.findById(userId);

    await notifyProgressUpdated(
      userId,
      updated?.first_name || updated?.username || 'there',
      progressionStatus,
      progressionCategory,
    );

    res.status(200).json({
      message: 'User progress updated successfully',
      user: updated ? userRepo.toApiUser(updated) : null,
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
    const users = await query(
      `SELECT id as "userId", email, first_name as "firstName", last_name as "lastName",
              company, progression_status as "progressionStatus",
              progression_category as "progressionCategory",
              progression_timeline as "progressionTimeline"
       FROM users WHERE email IS NOT NULL`,
    );

    const data = users.map((u: any) => ({
      ...u,
      firstName: u.firstName || '',
      lastName: u.lastName || '',
      company: u.company || '',
      progressionStatus: u.progressionStatus || 'pending',
      progressionCategory: u.progressionCategory || '',
      progressionTimeline: u.progressionTimeline || '',
    }));

    res.status(200).json({ count: data.length, data });
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
    const rows = await query<{ status: string; count: string }>(
      `SELECT COALESCE(progression_status, 'active') as status, COUNT(*)::text as count
       FROM users WHERE email IS NOT NULL GROUP BY COALESCE(progression_status, 'active')`,
    );

    const byStatus: Record<string, number> = {};
    let total = 0, active = 0, inactive = 0, terminated = 0;

    for (const r of rows) {
      const cnt = parseInt(r.count, 10);
      byStatus[r.status] = cnt;
      total += cnt;
      if (r.status === 'active') active = cnt;
      else if (r.status === 'inactive') inactive = cnt;
      else if (r.status === 'terminated') terminated = cnt;
    }

    res.status(200).json({ total, active, inactive, terminated, byStatus });
  } catch (error) {
    logError(error, { context: 'terminatedStatistics' });
    res.status(500).json({ error: 'Internal server error' });
  }
}
