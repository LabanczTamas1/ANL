// ---------------------------------------------------------------------------
// Booking Service — business logic
// ---------------------------------------------------------------------------

import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import { bookingRepository, BookingRow } from '../repository/bookingRepository.js';
import { getRedisClient } from '../../../config/database.js';
import { env } from '../../../config/env.js';
import { convertMinutesToTime } from '../../../utils/timeHelpers.js';
import { checkCustomAvailability } from '../../../utils/availabilityHelpers.js';
import { googleCalendarService } from './googleCalendarService.js';
import {
  createLogger,
  logError,
  logBusinessEvent,
} from '../../../utils/logger.js';

const logger = createLogger('booking', 'service');

const REFERRAL_SOURCES = [
  'Google Search',
  'Social Media (LinkedIn, Facebook, etc.)',
  'Friend or Colleague Referral',
  'Conference or Event',
  'Advertisement',
  'Blog or Article',
  'Other',
];

class BookingService {
  referralSources = REFERRAL_SOURCES;

  validateBookingData(data: Record<string, any>): string[] {
    const errors: string[] = [];

    if (!data.fullName || !data.fullName.trim())
      errors.push('Full name is required.');
    if (!data.email || !data.email.trim()) errors.push('Email is required.');
    if (!data.company || !data.company.trim())
      errors.push('Company name is required.');
    if (!data.referralSource || !data.referralSource.trim())
      errors.push('"Where did you hear about us?" is required.');
    if (
      data.referralSource === 'Other' &&
      (!data.referralSourceOther || !data.referralSourceOther.trim())
    )
      errors.push('Please specify where you heard about us.');
    if (!data.date) errors.push('Date is required.');
    if (data.time === undefined || data.time === null || data.time === '')
      errors.push('Time is required.');

    return errors;
  }

  async getAvailableTimesForDate(date: string): Promise<number[]> {
    const redisClient = getRedisClient();

    const weekdays = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];

    const dateObj = new Date(date);
    const dayNumber = dateObj.getDay() === 0 ? 6 : dateObj.getDay() - 1;
    const dayName = weekdays[dayNumber] || 'Monday';

    const standardAvailability = await redisClient.hGetAll(
      `StandardAvailability:${dayName}`,
    );

    let availableTimes: number[] = [];
    if (standardAvailability && standardAvailability.IsDayOff !== 'true') {
      const openingTimeStr = standardAvailability.OpeningTime || '09:00';
      const closingTimeStr = standardAvailability.ClosingTime || '17:00';
      const [openH, openM] = openingTimeStr.split(':').map(Number);
      const [closeH, closeM] = closingTimeStr.split(':').map(Number);
      const openingMinutes = openH * 60 + openM;
      const closingMinutes = closeH * 60 + closeM;

      for (let i = openingMinutes; i < closingMinutes; i += 60) {
        availableTimes.push(i);
      }
    }

    const customAvailability = await checkCustomAvailability(
      date,
      availableTimes,
      'both',
    );

    return customAvailability.length > 0 ? customAvailability : availableTimes;
  }

  async createGoogleMeetEvent(
    date: string,
    time: string,
    email: string,
    oauth2Client: any,
    timezone = 'America/New_York',
  ) {
    try {
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      const eventDateTime = new Date(`${date}T${time}:00`);

      const meetRequestBody = {
        summary: `Meeting with ${email}`,
        description: 'Meeting scheduled via ANL Website',
        start: {
          dateTime: eventDateTime.toISOString(),
          timeZone: timezone,
        },
        end: {
          dateTime: new Date(
            eventDateTime.getTime() + 60 * 60 * 1000,
          ).toISOString(),
          timeZone: timezone,
        },
        conferenceData: {
          createRequest: {
            requestId: uuidv4(),
            conferenceSolution: { key: { conferenceType: 'hangoutsMeet' } },
          },
        },
        attendees: [{ email }],
      };

      const event: any = await calendar.events.insert({
        calendarId: 'primary',
        resource: meetRequestBody,
        conferenceDataVersion: 1,
      } as any);

      return {
        success: true,
        eventId: event.data.id,
        meetLink:
          event.data.conferenceData?.entryPoints?.[0]?.uri || null,
        calendarLink: event.data.htmlLink,
      };
    } catch (error) {
      logError(error, { context: 'createGoogleMeetEvent', email, date, time });
      return null;
    }
  }

  async createBooking(bookingData: Record<string, any>) {
    const errors = this.validateBookingData(bookingData);
    if (errors.length > 0) throw { status: 400, errors };

    const availableTimes = await this.getAvailableTimesForDate(
      bookingData.date,
    );
    const timeInMinutes = parseInt(bookingData.time, 10);

    if (!availableTimes.includes(timeInMinutes)) {
      throw {
        status: 400,
        error: 'Selected time is not available.',
        availableTimes,
      };
    }

    let meetLink: string | null = null;
    let calendarEventId: string | null = null;
    const redisClient = getRedisClient();

    // ── Create Google Calendar event with Meet link (service account) ─────
    if (googleCalendarService.isConfigured()) {
      try {
        const { startDateTime, endDateTime } = googleCalendarService.bookingToISO(
          bookingData.date,
          timeInMinutes,
          bookingData.timezone || 'America/New_York',
        );

        const calResult = await googleCalendarService.createMeetingEvent({
          summary: `ANL Meeting — ${bookingData.fullName.trim()} (${bookingData.company.trim()})`,
          description: [
            `📅 Kick Off Meeting with ${bookingData.fullName.trim()}`,
            `🏢 Company: ${bookingData.company.trim()}`,
            `📧 Email: ${bookingData.email.trim()}`,
            `📣 Referral: ${bookingData.referralSource}${bookingData.referralSourceOther ? ` — ${bookingData.referralSourceOther}` : ''}`,
            bookingData.notes ? `📝 Notes: ${bookingData.notes}` : '',
            '',
            'Scheduled via adsandleads.com',
          ]
            .filter(Boolean)
            .join('\n'),
          startDateTime,
          endDateTime,
          timezone: bookingData.timezone || 'America/New_York',
          attendeeEmails: [bookingData.email.trim()],
        });

        meetLink = calResult.meetLink || null;
        calendarEventId = calResult.eventId || null;

        logger.info(
          { meetLink, calendarEventId, email: bookingData.email },
          'Google Calendar event + Meet link created for booking',
        );
      } catch (calendarError) {
        logError(calendarError, {
          context: 'createBooking_googleCalendar',
          email: bookingData.email,
          date: bookingData.date,
        });
      }
    } else {
      // Fallback: try per-user OAuth tokens from Redis (legacy flow)
      const calendarData = await redisClient.get(
        `calendar:${bookingData.email}`,
      );

      if (calendarData) {
        try {
          const bookingCalData = JSON.parse(calendarData);
          const oauth2Client = new google.auth.OAuth2(
            env.GOOGLE_CLIENT_ID,
            env.GOOGLE_CLIENT_SECRET,
            'http://localhost:5173/oauth-callback',
          );
          oauth2Client.setCredentials({
            access_token: bookingCalData.googleAccessToken,
            refresh_token: bookingCalData.googleRefreshToken,
          });

          const result = await this.createGoogleMeetEvent(
            bookingData.date,
            convertMinutesToTime(timeInMinutes),
            bookingData.email,
            oauth2Client,
            bookingData.timezone || 'America/New_York',
          );

          if (result) meetLink = result.meetLink;
        } catch (meetError) {
          logError(meetError, {
            context: 'createBooking_meetLink_legacy',
            email: bookingData.email,
            date: bookingData.date,
          });
        }
      }
    }

    const bookingId = uuidv4();
    const accessToken = crypto.randomBytes(32).toString('hex');

    const newBooking = await bookingRepository.insert({
      id: bookingId,
      fullName: bookingData.fullName.trim(),
      email: bookingData.email.trim(),
      company: bookingData.company.trim(),
      referralSource: bookingData.referralSource.trim(),
      referralSourceOther:
        bookingData.referralSource === 'Other'
          ? (bookingData.referralSourceOther || '').trim()
          : null,
      date: bookingData.date,
      time: timeInMinutes,
      timezone: bookingData.timezone || 'America/New_York',
      meetLink,
      status: 'confirmed',
      notes: bookingData.notes || null,
      accessToken,
    });

    try {
      await redisClient.setEx(
        `booking:${bookingId}`,
        86400,
        JSON.stringify(newBooking),
      );
    } catch (cacheErr) {
      logger.warn({ err: cacheErr, bookingId }, 'Redis cache write failed');
    }

    logBusinessEvent('booking_created', {
      bookingId,
      email: bookingData.email,
      company: bookingData.company,
      date: bookingData.date,
      hasMeetLink: !!meetLink,
    });

    // ── Send confirmation email ───────────────────────────────────────────
    const formattedTime = convertMinutesToTime(timeInMinutes);
    const frontendUrl = env.ALLOWED_ORIGINS.split(',')[0].trim() || 'http://localhost:5173';
    const bookingDetailsUrl = `${frontendUrl}/booking/confirmation/${accessToken}`;

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });

      const emailHtml = `
        <div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #65558F 0%, #7AA49F 100%); padding: 32px 24px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 24px;">Booking Confirmed!</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Your meeting has been scheduled successfully.</p>
          </div>
          <div style="padding: 24px;">
            <h2 style="font-size: 16px; color: #374151; margin: 0 0 16px;">Meeting Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Date</td>
                <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${bookingData.date}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Time</td>
                <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${formattedTime}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Name</td>
                <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${bookingData.fullName.trim()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Company</td>
                <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${bookingData.company.trim()}</td>
              </tr>
            </table>
            ${meetLink ? `
            <div style="margin: 24px 0 16px; text-align: center;">
              <a href="${meetLink}" style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #3b82f6, #06b6d4); color: #fff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 14px;">Join Google Meet</a>
            </div>` : ''}
            <div style="margin: 16px 0; text-align: center;">
              <a href="${bookingDetailsUrl}" style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #65558F, #7AA49F); color: #fff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 14px;">View Booking Details</a>
            </div>
            <p style="margin: 24px 0 0; color: #9ca3af; font-size: 12px; text-align: center;">
              This is an automated email. Please do not reply directly.
            </p>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
        to: bookingData.email.trim(),
        subject: `Booking Confirmed — ${bookingData.date} at ${formattedTime}`,
        html: emailHtml,
        headers: {
          'X-Auto-Response-Suppress': 'All',
          'Precedence': 'bulk',
        },
      });

      logger.info({ bookingId, email: bookingData.email }, 'Booking confirmation email sent');
    } catch (emailError) {
      // Email failure should not break the booking flow
      logError(emailError, { context: 'sendBookingConfirmationEmail', bookingId });
    }

    return {
      id: bookingId,
      accessToken,
      fullName: newBooking.full_name,
      email: newBooking.email,
      company: newBooking.company,
      referralSource: newBooking.referral_source,
      date: newBooking.date,
      time: formattedTime,
      timezone: newBooking.timezone,
      meetLink: meetLink || '',
    };
  }

  async getBookingById(bookingId: string): Promise<BookingRow | null> {
    const redisClient = getRedisClient();

    const cached = await redisClient.get(`booking:${bookingId}`);
    if (cached) return JSON.parse(cached);

    const booking = await bookingRepository.findById(bookingId);
    if (!booking) return null;

    try {
      await redisClient.setEx(
        `booking:${bookingId}`,
        86400,
        JSON.stringify(booking),
      );
    } catch {
      /* cache error ignored */
    }

    return booking;
  }

  /**
   * Public access — find a booking by its unique access token.
   * Returns only safe, non-sensitive fields.
   */
  async getBookingByAccessToken(accessToken: string): Promise<Record<string, any> | null> {
    if (!accessToken || accessToken.length < 16) return null;

    const redisClient = getRedisClient();

    // Try cache first
    const cached = await redisClient.get(`booking_token:${accessToken}`);
    if (cached) return JSON.parse(cached);

    const booking = await bookingRepository.findByAccessToken(accessToken);
    if (!booking) return null;

    // Return only safe fields — no internal ID, no notes
    const safe = {
      fullName: booking.full_name,
      email: booking.email,
      company: booking.company,
      date: booking.date,
      time: booking.time,
      timezone: booking.timezone,
      meetLink: booking.meet_link || '',
      status: booking.status,
      createdAt: booking.created_at,
    };

    try {
      await redisClient.setEx(
        `booking_token:${accessToken}`,
        86400,
        JSON.stringify(safe),
      );
    } catch {
      /* cache error ignored */
    }

    return safe;
  }

  async getBookingsByEmail(email: string) {
    return bookingRepository.findByEmail(email);
  }

  async getLatestBookingsByEmail(email: string, limit = 5) {
    return bookingRepository.findLatestByEmail(email, limit);
  }

  async getAllBookings(limit = 100, offset = 0) {
    return bookingRepository.findAll(limit, offset);
  }

  async deleteBooking(bookingId: string, userEmail: string) {
    const booking = await bookingRepository.findById(bookingId);

    if (!booking) throw { status: 404, error: 'Booking not found' };
    if (booking.email !== userEmail)
      throw { status: 403, error: 'Unauthorized' };

    await bookingRepository.delete(bookingId);

    try {
      const redisClient = getRedisClient();
      await redisClient.del(`booking:${bookingId}`);
    } catch {
      /* cache error ignored */
    }

    return { message: 'Booking deleted successfully' };
  }

  async getAvailabilityForDate(date: string) {
    const availableTimes = await this.getAvailableTimesForDate(date);

    const convertedTimes = availableTimes.map((minutes) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHour = hours % 12 === 0 ? 12 : hours % 12;
      return `${displayHour}:${mins.toString().padStart(2, '0')} ${ampm}`;
    });

    return { date, availableTimes: convertedTimes, rawMinutes: availableTimes };
  }
}

export const bookingService = new BookingService();
