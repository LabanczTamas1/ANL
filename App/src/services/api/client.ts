// ---------------------------------------------------------------------------
// Axios client — single configured instance for the entire app
// ---------------------------------------------------------------------------

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 30_000,
});

// ── Request interceptor: attach JWT token ────────────────────────────────────

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: normalise errors ───────────────────────────────────

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string; message?: string }>) => {
    // If the server returned 401 the token is likely expired / invalid
    if (error.response?.status === 401) {
      // You can hook into a global event or redirect to login here
      console.warn('[api] Received 401 — token may be expired');
    }

    return Promise.reject(error);
  },
);

export default apiClient;
