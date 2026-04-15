// ---------------------------------------------------------------------------
// Kanban API — /api/v1/kanban/*
// ---------------------------------------------------------------------------

import apiClient from './client';

// ── Columns ──────────────────────────────────────────────────────────────────

/** POST /api/v1/kanban/columns */
export const createColumn = (payload: Record<string, unknown>) =>
  apiClient.post('/kanban/columns', payload);

/** GET /api/v1/kanban/columns */
export const getColumns = () => apiClient.get('/kanban/columns');

/** PUT /api/v1/kanban/columns/priority */
export const updateColumnPriority = (payload: Record<string, unknown>) =>
  apiClient.put('/kanban/columns/priority', payload);

/** DELETE /api/v1/kanban/columns/:id */
export const deleteColumn = (id: string) =>
  apiClient.delete(`/kanban/columns/${id}`);

// ── Cards ────────────────────────────────────────────────────────────────────

/** POST /api/v1/kanban/cards */
export const createCard = (payload: Record<string, unknown>) =>
  apiClient.post('/kanban/cards', payload);

/** PUT /api/v1/kanban/cards/:cardId */
export const updateCard = (cardId: string, payload: Record<string, unknown>) =>
  apiClient.put(`/kanban/cards/${cardId}`, payload);

/** DELETE /api/v1/kanban/cards/:cardId */
export const deleteCard = (cardId: string, columnId: string) =>
  apiClient.delete(`/kanban/cards/${cardId}`, { data: { columnId } });

/** GET /api/v1/kanban/cards/:columnId */
export const getCards = (columnId: string) =>
  apiClient.get(`/kanban/cards/${columnId}`);

/** PUT /api/v1/kanban/cards/change/priority */
export const moveCard = (payload: Record<string, unknown>) =>
  apiClient.put('/kanban/cards/change/priority', payload);

// ── Comments ─────────────────────────────────────────────────────────────────

/** POST /api/v1/kanban/cards/comments/:cardId */
export const createComment = (
  cardId: string,
  payload: Record<string, unknown>,
) => apiClient.post(`/kanban/cards/comments/${cardId}`, payload);

/** GET /api/v1/kanban/cards/comments/:cardId */
export const getComments = (cardId: string) =>
  apiClient.get(`/kanban/cards/comments/${cardId}`);

/** PUT /api/v1/kanban/cards/comments/:commentId */
export const updateComment = (
  commentId: string,
  payload: Record<string, unknown>,
) => apiClient.put(`/kanban/cards/comments/${commentId}`, payload);

/** DELETE /api/v1/kanban/cards/comments/:commentId */
export const deleteComment = (commentId: string) =>
  apiClient.delete(`/kanban/cards/comments/${commentId}`);

// ── Templates ────────────────────────────────────────────────────────────────

/** POST /api/v1/kanban/templates */
export const createTemplate = (payload: Record<string, unknown>) =>
  apiClient.post('/kanban/templates', payload);

/** GET /api/v1/kanban/templates */
export const getTemplates = () => apiClient.get('/kanban/templates');

/** DELETE /api/v1/kanban/templates/:id */
export const deleteTemplate = (id: string) =>
  apiClient.delete(`/kanban/templates/${id}`);

// ── Card Activity ────────────────────────────────────────────────────────────

/** GET /api/v1/kanban/cards/:cardId/activity */
export const getCardActivity = (cardId: string) =>
  apiClient.get(`/kanban/cards/${cardId}/activity`);
