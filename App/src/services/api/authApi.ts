// ---------------------------------------------------------------------------
// Auth API — /api/v1/user/auth/*
// ---------------------------------------------------------------------------

import apiClient from './client';

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  username: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyEmailPayload {
  email: string;
  code: string;
}

/** POST /api/v1/user/auth/register */
export const register = (payload: RegisterPayload) =>
  apiClient.post('/user/auth/register', payload);

/** POST /api/v1/user/auth/login */
export const login = (payload: LoginPayload) =>
  apiClient.post('/user/auth/login', payload);

/** POST /api/v1/user/auth/verify-email */
export const verifyEmail = (payload: VerifyEmailPayload) =>
  apiClient.post('/user/auth/verify-email', payload);

/** POST /api/v1/user/auth/resend-verification */
export const resendVerification = (payload: { email: string }) =>
  apiClient.post('/user/auth/resend-verification', payload);

/** POST /api/v1/user/auth/refresh */
export const refreshToken = (payload?: { refreshToken?: string }) =>
  apiClient.post('/user/auth/refresh', payload);

/** POST /api/v1/user/auth/logout */
export const logout = () => apiClient.post('/user/auth/logout');

/** GET /api/v1/user/auth/check */
export const authCheck = () => apiClient.get('/user/auth/check');

/**
 * OAuth redirect URLs (not Axios calls — browser redirect).
 * Use `window.location.href = authApi.googleOAuthUrl()` to initiate.
 */
export const googleOAuthUrl = () =>
  `${apiClient.defaults.baseURL}/user/auth/google`;

export const facebookOAuthUrl = () =>
  `${apiClient.defaults.baseURL}/user/auth/facebook`;
