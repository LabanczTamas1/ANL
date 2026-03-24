// ---------------------------------------------------------------------------
// Review API — /api/v1/reviews/*
// ---------------------------------------------------------------------------

import apiClient from './client';

/** POST /api/v1/reviews/ */
export const addReview = (payload: Record<string, unknown>) =>
  apiClient.post('/reviews', payload);

/** GET /api/v1/reviews/ */
export const getReviews = () => apiClient.get('/reviews');
