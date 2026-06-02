// ---------------------------------------------------------------------------
// Axios client — single configured instance for the entire app
// ---------------------------------------------------------------------------

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { performLogout } from '../../utils/auth';

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

// ── Response interceptor: auto-logout on expired token ───────────────────────

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string; message?: string }>) => {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      // Token expired or invalid — clear auth state and redirect to login
      performLogout();
    }

    return Promise.reject(error);
  },
);

export default apiClient;
