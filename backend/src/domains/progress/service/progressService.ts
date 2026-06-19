// ---------------------------------------------------------------------------
// Progress Service — business logic for per-user milestones
// ---------------------------------------------------------------------------

import { createLogger } from '../../../utils/logger.js';
import {
  Milestone,
  MilestoneStatus,
  MILESTONE_STATUSES,
  toApiMilestone,
} from '../model/progressModel.js';
import progressRepository, {
  UpdateMilestoneInput,
} from '../repository/progressRepository.js';

const logger = createLogger('progress', 'service');

export function isValidStatus(value: unknown): value is MilestoneStatus {
  return typeof value === 'string' && MILESTONE_STATUSES.includes(value as MilestoneStatus);
}

/**
 * Return a user's milestones, lazily seeding the default journey the first
 * time it is requested so existing users get a populated timeline.
 */
export async function getUserMilestones(userId: string): Promise<Milestone[]> {
  let rows = await progressRepository.findByUserId(userId);
  if (rows.length === 0) {
    rows = await progressRepository.seedDefaults(userId);
  }
  return rows.map(toApiMilestone);
}

export async function getMilestone(id: string): Promise<Milestone | null> {
  const row = await progressRepository.findById(id);
  return row ? toApiMilestone(row) : null;
}

export async function updateMilestone(
  id: string,
  input: UpdateMilestoneInput,
): Promise<Milestone | null> {
  const row = await progressRepository.update(id, input);
  if (row) {
    logger.info({ milestoneId: id, status: row.status }, 'Milestone updated');
  }
  return row ? toApiMilestone(row) : null;
}

export async function createMilestone(
  userId: string,
  data: { title: string; description?: string; status?: MilestoneStatus; note?: string },
): Promise<Milestone> {
  const count = await progressRepository.countForUser(userId);
  const row = await progressRepository.create({
    userId,
    title: data.title,
    description: data.description,
    status: data.status,
    note: data.note,
    position: count,
  });
  return toApiMilestone(row);
}

export async function deleteMilestone(id: string): Promise<boolean> {
  return progressRepository.delete(id);
}

export async function getUsersProgressSummary() {
  const rows = await progressRepository.summaryByUser();
  return rows.map((r) => ({
    userId: r.userId,
    email: r.email,
    firstName: r.firstName,
    lastName: r.lastName,
    username: r.username,
    company: r.company,
    total: parseInt(r.total, 10),
    completed: parseInt(r.completed, 10),
    inProgress: parseInt(r.inProgress, 10),
  }));
}
