// ---------------------------------------------------------------------------
// Availability API — /api/v1/availability/*
// ---------------------------------------------------------------------------

import apiClient from './client';

/** PATCH /api/v1/availability/standard-availability */
export const updateStandardAvailability = (
  payload: Record<string, unknown>,
) => apiClient.patch('/availability/standard-availability', payload);

/** GET /api/v1/availability/standard-availability */
export const getStandardAvailability = () =>
  apiClient.get('/availability/standard-availability');

/** GET /api/v1/availability/add-availability/:date */
export const getAddAvailability = (date: string) =>
  apiClient.get(`/availability/add-availability/${date}`);

/** POST /api/v1/availability/add-availability-to-the-database */
export const addAvailabilityToDb = (payload: Record<string, unknown>) =>
  apiClient.post('/availability/add-availability-to-the-database', payload);

/** GET /api/v1/availability/delete-availability/:date */
export const getDeleteAvailability = (date: string) =>
  apiClient.get(`/availability/delete-availability/${date}`);

/** DELETE /api/v1/availability/delete-availability-to-the-database */
export const deleteAvailabilityFromDb = (payload: Record<string, unknown>) =>
  apiClient.delete('/availability/delete-availability-to-the-database', {
    data: payload,
  });

/** GET /api/v1/availability/show-available-times/:date */
export const showAvailableTimes = (
  date: string,
  params?: { current_time?: string },
) => apiClient.get(`/availability/show-available-times/${date}`, { params });

// ─── Admin: availability overview ───────────────────────────────────────────

/** GET /api/v1/availability/admin-day-overview/:startDate/:endDate */
export const getAdminDayOverview = (startDate: string, endDate: string) =>
  apiClient.get(`/availability/admin-day-overview/${startDate}/${endDate}`);

/** DELETE /api/v1/availability/remove-added-time */
export const removeAddedTime = (payload: { date: string; times: number[] }) =>
  apiClient.delete('/availability/remove-added-time', { data: payload });

/** DELETE /api/v1/availability/remove-deleted-time */
export const removeDeletedTime = (payload: { date: string; times: number[] }) =>
  apiClient.delete('/availability/remove-deleted-time', { data: payload });
