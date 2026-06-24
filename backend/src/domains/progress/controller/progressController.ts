// ---------------------------------------------------------------------------
// Progress Controller
// ---------------------------------------------------------------------------

import { Request, Response } from 'express';
import { logError } from '../../../utils/logger.js';
import { notifyProgressUpdated } from '../../../utils/systemNotifications.js';
import * as userRepo from '../../user/public.js';
import { query } from '../../../utils/db.js';
import * as progressService from '../service/progressService.js';

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

// ---------------------------------------------------------------------------
// Milestone journey — per-user timeline
// ---------------------------------------------------------------------------

/** GET /progress/me — current user's milestone journey (seeded if empty). */
export async function getMyProgress(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const milestones = await progressService.getUserMilestones(userId);
    res.status(200).json({ milestones });
  } catch (error) {
    logError(error, { context: 'getMyProgress' });
    res.status(500).json({ error: 'Internal server error' });
  }
}

/** GET /progress/summary — aggregated per-user progress (admin/owner). */
export async function getUsersProgressSummary(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const data = await progressService.getUsersProgressSummary();
    res.status(200).json({ count: data.length, data });
  } catch (error) {
    logError(error, { context: 'getUsersProgressSummary' });
    res.status(500).json({ error: 'Internal server error' });
  }
}

/** GET /progress/users/:userId — a user's milestone journey (admin/owner). */
export async function getUserProgress(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = req.params;
    const user = await userRepo.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const milestones = await progressService.getUserMilestones(userId);
    res.status(200).json({
      user: userRepo.toApiUser(user),
      milestones,
    });
  } catch (error) {
    logError(error, { context: 'getUserProgress' });
    res.status(500).json({ error: 'Internal server error' });
  }
}

/** POST /progress/users/:userId/milestones — add a milestone (admin/owner). */
export async function createMilestone(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = req.params;
    const { title, description, category, status, note } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }
    if (status !== undefined && !progressService.isValidStatus(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const user = await userRepo.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const milestone = await progressService.createMilestone(userId, {
      title: title.trim(),
      description,
      category,
      status,
      note,
    });
    res.status(201).json({ milestone });
  } catch (error) {
    logError(error, { context: 'createMilestone' });
    res.status(500).json({ error: 'Internal server error' });
  }
}

/** PATCH /progress/milestones/:milestoneId — update a milestone (admin/owner). */
export async function updateMilestone(req: Request, res: Response): Promise<void> {
  try {
    const { milestoneId } = req.params;
    const { title, description, category, status, position, note } = req.body;

    if (status !== undefined && !progressService.isValidStatus(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const existing = await progressService.getMilestone(milestoneId);
    if (!existing) {
      res.status(404).json({ error: 'Milestone not found' });
      return;
    }

    const updated = await progressService.updateMilestone(milestoneId, {
      title,
      description,
      category,
      status,
      position,
      note,
    });

    // Notify the user when a milestone is newly completed.
    if (
      updated &&
      status === 'completed' &&
      existing.status !== 'completed'
    ) {
      const user = await userRepo.findById(existing.userId);
      await notifyProgressUpdated(
        existing.userId,
        user?.first_name || user?.username || 'there',
        updated.title,
        'completed',
      );
    }

    res.status(200).json({ milestone: updated });
  } catch (error) {
    logError(error, { context: 'updateMilestone' });
    res.status(500).json({ error: 'Internal server error' });
  }
}

/** DELETE /progress/milestones/:milestoneId — remove a milestone (admin/owner). */
export async function deleteMilestone(req: Request, res: Response): Promise<void> {
  try {
    const { milestoneId } = req.params;
    const existing = await progressService.getMilestone(milestoneId);
    if (!existing) {
      res.status(404).json({ error: 'Milestone not found' });
      return;
    }
    await progressService.deleteMilestone(milestoneId);
    res.status(200).json({ message: 'Milestone deleted' });
  } catch (error) {
    logError(error, { context: 'deleteMilestone' });
    res.status(500).json({ error: 'Internal server error' });
  }
}
