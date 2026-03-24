// ---------------------------------------------------------------------------
// Booking API — /api/v1/booking/*
// ---------------------------------------------------------------------------

import apiClient from './client';

/** POST /api/v1/booking/ — create a booking (public) */
export const createBooking = (payload: Record<string, unknown>) =>
  apiClient.post('/booking', payload);

/** GET /api/v1/booking/ — get current user's bookings */
export const getUserBookings = () => apiClient.get('/booking');

/** GET /api/v1/booking/latest — get latest bookings */
export const getLatestBookings = () => apiClient.get('/booking/latest');

/** GET /api/v1/booking/:bookingId */
export const getBookingById = (bookingId: string) =>
  apiClient.get(`/booking/${bookingId}`);

/** DELETE /api/v1/booking/:bookingId */
export const deleteBooking = (bookingId: string) =>
  apiClient.delete(`/booking/${bookingId}`);

/** GET /api/v1/booking/referral-sources (public) */
export const getReferralSources = () =>
  apiClient.get('/booking/referral-sources');

/** GET /api/v1/booking/availability/:date (public) */
export const getBookingAvailability = (date: string) =>
  apiClient.get(`/booking/availability/${date}`);
