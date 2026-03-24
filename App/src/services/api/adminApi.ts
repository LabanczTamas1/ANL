// ---------------------------------------------------------------------------
// Admin API — /api/v1/admin/*
// ---------------------------------------------------------------------------

import apiClient from './client';

/** GET /api/v1/admin/stats */
export const getStats = () => apiClient.get('/admin/stats');

/** POST /api/v1/admin/stats/reset */
export const resetStats = () => apiClient.post('/admin/stats/reset');

/** POST /api/v1/admin/ban-ip */
export const banIp = (ip: string) =>
  apiClient.post('/admin/ban-ip', { ip });

/** POST /api/v1/admin/unban-ip */
export const unbanIp = (ip: string) =>
  apiClient.post('/admin/unban-ip', { ip });

/** GET /api/v1/admin/banned-ips */
export const getBannedIps = () => apiClient.get('/admin/banned-ips');

/** GET /api/v1/admin/emails */
export const getEmails = () => apiClient.get('/admin/emails');
