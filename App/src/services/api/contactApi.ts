// ---------------------------------------------------------------------------
// Contact API — /api/v1/contact/*
// ---------------------------------------------------------------------------

import apiClient from './client';

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
  [key: string]: unknown;
}

/** POST /api/v1/contact/contact */
export const submitContact = (payload: ContactPayload) =>
  apiClient.post('/contact/contact', payload);
