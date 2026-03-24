// ---------------------------------------------------------------------------
// Progress API — /api/v1/progress/*
// ---------------------------------------------------------------------------

import apiClient from './client';

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
