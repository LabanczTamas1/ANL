// ---------------------------------------------------------------------------
// File Management API — /api/v1/file/*
// ---------------------------------------------------------------------------

import apiClient from './client';

/**
 * POST /api/v1/file/upload
 * Sends a file upload as multipart/form-data.
 * Pass a FormData object; the interceptor's Content-Type header
 * will be overridden automatically by Axios for multipart.
 */
export const uploadFile = (formData: FormData) =>
  apiClient.post('/file/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

/** GET /api/v1/file/export */
export const exportData = () => apiClient.get('/file/export');
