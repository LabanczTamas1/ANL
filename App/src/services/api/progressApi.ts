// ---------------------------------------------------------------------------
// Progress API — /api/v1/progress/*
// ---------------------------------------------------------------------------

import apiClient from './client';

export type MilestoneStatus = 'pending' | 'in_progress' | 'completed';

export interface Milestone {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: MilestoneStatus;
  position: number;
  note: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProgressUserSummary {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  company: string;
  total: number;
  completed: number;
  inProgress: number;
}

/**
 * Defensive cleanup for legacy rows whose string columns captured literal
 * dollar-quoted defaults (e.g. note stored as the two characters `''`, or
 * status stored as `'pending'` including the quotes). Safe for clean data.
 */
const stripQuoteArtifact = (value: string): string => {
  if (!value) return '';
  if (value === "''") return '';
  if (value.length >= 2 && value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1);
  }
  return value;
};

export const normalizeMilestone = (m: Milestone): Milestone => ({
  ...m,
  status: stripQuoteArtifact(m.status) as MilestoneStatus,
  note: stripQuoteArtifact(m.note),
  description: stripQuoteArtifact(m.description),
});

/** GET /api/v1/progress/me — current user's milestone journey. */
export const getMyProgress = () =>
  apiClient.get<{ milestones: Milestone[] }>('/progress/me');

/** GET /api/v1/progress/summary — per-user progress overview (admin/owner). */
export const getUsersProgressSummary = () =>
  apiClient.get<{ count: number; data: ProgressUserSummary[] }>(
    '/progress/summary',
  );

/** GET /api/v1/progress/users/:userId — a user's milestones (admin/owner). */
export const getUserProgress = (userId: string) =>
  apiClient.get<{ user: Record<string, unknown>; milestones: Milestone[] }>(
    `/progress/users/${userId}`,
  );

/** POST /api/v1/progress/users/:userId/milestones — add milestone (admin/owner). */
export const createMilestone = (
  userId: string,
  payload: {
    title: string;
    description?: string;
    status?: MilestoneStatus;
    note?: string;
  },
) =>
  apiClient.post<{ milestone: Milestone }>(
    `/progress/users/${userId}/milestones`,
    payload,
  );

/** PATCH /api/v1/progress/milestones/:milestoneId — update milestone (admin/owner). */
export const updateMilestone = (
  milestoneId: string,
  payload: {
    title?: string;
    description?: string;
    status?: MilestoneStatus;
    position?: number;
    note?: string;
  },
) =>
  apiClient.patch<{ milestone: Milestone }>(
    `/progress/milestones/${milestoneId}`,
    payload,
  );

/** DELETE /api/v1/progress/milestones/:milestoneId — remove milestone (admin/owner). */
export const deleteMilestone = (milestoneId: string) =>
  apiClient.delete<{ message: string }>(`/progress/milestones/${milestoneId}`);

/** PATCH /api/v1/progress/changeUserProgress/:userId */
export const changeUserProgress = (
  userId: string,
  payload: Record<string, unknown>,
) => apiClient.patch(`/progress/changeUserProgress/${userId}`, payload);

/** GET /api/v1/progress/allUsersProgress */
export const getAllUsersProgress = () =>
  apiClient.get('/progress/allUsersProgress');

/** GET /api/v1/progress/terminatedStatistics */
export const getTerminatedStatistics = () =>
  apiClient.get('/progress/terminatedStatistics');
