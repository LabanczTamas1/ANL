// ---------------------------------------------------------------------------
// Email / Inbox API — /api/v1/email/*
// ---------------------------------------------------------------------------

import apiClient from './client';

/** POST /api/v1/email/save-email */
export const saveEmail = (payload: Record<string, unknown>) =>
  apiClient.post('/email/save-email', payload);

/** GET /api/v1/email/:username  (inbox) */
export const getInbox = (username: string) =>
  apiClient.get(`/email/${username}`);

/** GET /api/v1/email/sentmails/:username */
export const getSentMails = (username: string) =>
  apiClient.get(`/email/sentmails/${username}`);

/** PUT /api/v1/email/mark-as-read */
export const markAsRead = (payload: { emailIds: string[]; username: string }) =>
  apiClient.put('/email/mark-as-read', payload);

/** GET /api/v1/email/unread-count/:username */
export const getUnreadCount = (username: string) =>
  apiClient.get(`/email/unread-count/${username}`);

/** DELETE /api/v1/email/delete-emails */
export const deleteEmails = (payload: {
  emailIds: string[];
  username: string;
}) => apiClient.delete('/email/delete-emails', { data: payload });
