// ---------------------------------------------------------------------------
// User API — /api/v1/user/*
// ---------------------------------------------------------------------------

import apiClient from './client';

/** GET /api/v1/user/me */
export const getMe = () => apiClient.get('/user/me');

/** GET /api/v1/user/profile */
export const getProfile = () => apiClient.get('/user/profile');

/** PUT /api/v1/user/profile */
export const updateProfile = (payload: Record<string, unknown>) =>
  apiClient.put('/user/profile', payload);

/** GET /api/v1/user/listAllUsers */
export const listAllUsers = () => apiClient.get('/user/listAllUsers');

/** POST /api/v1/user/add-user */
export const addUser = (payload: Record<string, unknown>) =>
  apiClient.post('/user/add-user', payload);

/** PATCH /api/v1/user/updateUserRole/:userId */
export const updateUserRole = (userId: string, payload: { role: string }) =>
  apiClient.patch(`/user/updateUserRole/${userId}`, payload);

/** PATCH /api/v1/user/modifyUserData */
export const modifyUserData = (payload: Record<string, unknown>) =>
  apiClient.patch('/user/modifyUserData', payload);

/** GET /api/v1/user/:userId */
export const getUserById = (userId: string) =>
  apiClient.get(`/user/${userId}`);

/** GET /api/v1/user/:username (public) */
export const getUserByUsername = (username: string) =>
  apiClient.get(`/user/${username}`);
