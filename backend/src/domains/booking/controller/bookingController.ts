// ---------------------------------------------------------------------------
// Booking Controller — HTTP layer
// ---------------------------------------------------------------------------

import { Request, Response } from 'express';
import { bookingService } from '../service/bookingService.js';
import { logError, logBusinessEvent } from '../../../utils/logger.js';

class BookingController {
  async createBooking(req: Request, res: Response): Promise<void> {
    try {
      const bookingDetails = await bookingService.createBooking(req.body);

      res.status(201).json({
        message: 'Booking created successfully',
        meetingId: bookingDetails.id,
        accessToken: bookingDetails.accessToken,
        meetLink: bookingDetails.meetLink,
        bookingDetails,
      });
    } catch (error: any) {
      if (error.status) {
        res.status(error.status).json(error);
        return;
      }
      logError(error, { context: 'createBooking', body: req.body });
      res
        .status(500)
        .json({ error: 'Failed to create booking', message: error.message });
    }
  }

  /**
   * Public endpoint — view booking by access token.
   * No authentication required; the token itself is the credential.
   */
  async getBookingByAccessToken(req: Request, res: Response): Promise<void> {
    try {
      const { accessToken } = req.params;
      const booking = await bookingService.getBookingByAccessToken(accessToken);

      if (!booking) {
        res.status(404).json({ error: 'Booking not found' });
        return;
      }

      res.status(200).json({ booking });
    } catch (error: any) {
      logError(error, {
        context: 'getBookingByAccessToken',
        accessToken: req.params.accessToken,
      });
      res.status(500).json({
        error: 'Failed to fetch booking details',
        message: error.message,
      });
    }
  }

  getReferralSources(_req: Request, res: Response): void {
    res.status(200).json({ sources: bookingService.referralSources });
  }

  async getAllBookings(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;
      const bookings = await bookingService.getAllBookings(limit, offset);
      res
        .status(200)
        .json({ bookings, count: bookings.length, limit, offset });
    } catch (error: any) {
      logError(error, { context: 'getAllBookings' });
      res
        .status(500)
        .json({ error: 'Failed to fetch all bookings', message: error.message });
    }
  }

  async getUserBookings(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const bookings = await bookingService.getBookingsByEmail(userId);
      res.status(200).json({ bookings });
    } catch (error: any) {
      logError(error, { context: 'getUserBookings', userId: req.user?.id });
      res
        .status(500)
        .json({ error: 'Failed to fetch bookings', message: error.message });
    }
  }

  async getLatestBookings(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const bookings = await bookingService.getLatestBookingsByEmail(userId, 5);
      res.status(200).json({ bookings });
    } catch (error: any) {
      logError(error, { context: 'getLatestBookings', userId: req.user?.id });
      res.status(500).json({
        error: 'Failed to fetch latest bookings',
        message: error.message,
      });
    }
  }

  async getBookingById(req: Request, res: Response): Promise<void> {
    try {
      const { bookingId } = req.params;
      const booking = await bookingService.getBookingById(bookingId);

      if (!booking) {
        res.status(404).json({ error: 'Booking not found' });
        return;
      }

      res.status(200).json({ booking });
    } catch (error: any) {
      logError(error, {
        context: 'getBookingById',
        bookingId: req.params.bookingId,
      });
      res.status(500).json({
        error: 'Failed to fetch booking details',
        message: error.message,
      });
    }
  }

  async deleteBooking(req: Request, res: Response): Promise<void> {
    try {
      const { bookingId } = req.params;
      const userId = req.user!.id;
      const result = await bookingService.deleteBooking(bookingId, userId);
      logBusinessEvent('booking_deleted', { bookingId, userId });
      res.status(200).json(result);
    } catch (error: any) {
      if (error.status) {
        res.status(error.status).json({ error: error.error });
        return;
      }
      logError(error, {
        context: 'deleteBooking',
        bookingId: req.params.bookingId,
        userId: req.user?.id,
      });
      res
        .status(500)
        .json({ error: 'Failed to delete booking', message: error.message });
    }
  }

  async getAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { date } = req.params;
      const availability = await bookingService.getAvailabilityForDate(date);

      if (availability.availableTimes.length === 0) {
        res.status(200).json({
          availableTimes: [],
          message: 'No availability on this day',
        });
        return;
      }

      res.status(200).json(availability);
    } catch (error: any) {
      logError(error, { context: 'getAvailability', date: req.params.date });
      res
        .status(500)
        .json({ error: 'Internal server error', message: error.message });
    }
  }
}

export const bookingController = new BookingController();
