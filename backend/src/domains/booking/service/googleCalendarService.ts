// ---------------------------------------------------------------------------
// Google Calendar Service — Meet + Calendar event creation
// ---------------------------------------------------------------------------
// Creates Calendar events with automatic Google Meet links using the OAuth
// credentials managed by the calendar domain's auth service.
// ---------------------------------------------------------------------------

import { google, calendar_v3 } from 'googleapis';
import { v4 as uuidv4 } from 'uuid';
import { getRedisClient } from '../../../config/database.js';
import { createLogger, logError } from '../../../utils/logger.js';
import {
  getAuthUrl,
  handleAuthCallback,
  getAuthenticatedClient,
  getConnectionStatus,
  disconnect,
  isConfigured,
} from '../../calendar/service/calendarAuthService.js';

const logger = createLogger('booking', 'service');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MEETING_HOSTS_KEY = 'settings:meeting_hosts';

// ---------------------------------------------------------------------------
// Meeting hosts
// ---------------------------------------------------------------------------

async function getMeetingHosts(): Promise<string[]> {
  try {
    const r = getRedisClient();
    return await r.sMembers(MEETING_HOSTS_KEY);
  } catch {
    logger.warn('Failed to read meeting hosts from Redis');
    return [];
  }
}

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface CalendarEventInput {
  summary: string;
  description: string;
  startDateTime: string; // ISO-like: YYYY-MM-DDTHH:mm:ss
  endDateTime: string;   // ISO-like: YYYY-MM-DDTHH:mm:ss
  timezone: string;
  /** External attendee emails (the person who booked) */
  attendeeEmails: string[];
}

export interface CalendarEventResult {
  eventId: string;
  meetLink: string;
  htmlLink: string;
}

// ---------------------------------------------------------------------------
// Core — create a calendar event with Google Meet
// ---------------------------------------------------------------------------

/**
 * Creates a Google Calendar event with an auto-generated Google Meet link.
 * The event is created on the connected admin's primary calendar.
 * All meeting hosts are added as attendees.
 * The external booker is also invited.
 *
 * Google sends calendar invites to all attendees automatically.
 */
async function createMeetingEvent(
  input: CalendarEventInput,
): Promise<CalendarEventResult> {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    throw new Error('Google Calendar not connected. An admin must connect their Google account first.');
  }

  const calendar = google.calendar({ version: 'v3', auth });

  // Fetch meeting hosts from Redis (falls back to env var)
  const teamMembers = await getMeetingHosts();

  // Build attendees: team members + external booker
  const attendees: calendar_v3.Schema$EventAttendee[] = [
    // Meeting hosts
    ...teamMembers.map((email) => ({
      email,
      responseStatus: 'accepted' as const,
    })),
    // External booker
    ...input.attendeeEmails
      .filter((e) => !teamMembers.includes(e))
      .map((email) => ({ email })),
  ];

  const event: calendar_v3.Schema$Event = {
    summary: input.summary,
    description: input.description,
    start: {
      dateTime: input.startDateTime,
      timeZone: input.timezone,
    },
    end: {
      dateTime: input.endDateTime,
      timeZone: input.timezone,
    },
    attendees,
    conferenceData: {
      createRequest: {
        requestId: `anl-${uuidv4()}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 60 },
        { method: 'popup', minutes: 15 },
      ],
    },
    guestsCanModify: false,
    guestsCanInviteOthers: false,
    guestsCanSeeOtherGuests: true,
    status: 'confirmed',
  };

  logger.info(
    {
      summary: input.summary,
      start: input.startDateTime,
      attendeeCount: attendees.length,
      teamMembers: teamMembers.length,
    },
    'Creating Google Calendar event with Meet',
  );

  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
    conferenceDataVersion: 1,
    sendUpdates: 'all',
  });

  const meetLink =
    response.data.conferenceData?.entryPoints?.find(
      (ep) => ep.entryPointType === 'video',
    )?.uri ||
    response.data.hangoutLink ||
    '';

  const result: CalendarEventResult = {
    eventId: response.data.id || '',
    meetLink,
    htmlLink: response.data.htmlLink || '',
  };

  logger.info(
    { eventId: result.eventId, meetLink: result.meetLink },
    'Google Calendar event created successfully',
  );

  return result;
}

// ---------------------------------------------------------------------------
// Helper — convert booking date + minutes to ISO timestamps
// ---------------------------------------------------------------------------

function bookingToISO(
  dateStr: string,
  timeMinutes: number,
  _timezone: string,
  durationMinutes = 60,
): { startDateTime: string; endDateTime: string } {
  const startH = Math.floor(timeMinutes / 60);
  const startM = timeMinutes % 60;
  const startDateTime = `${dateStr}T${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}:00`;

  const endTotal = timeMinutes + durationMinutes;
  const endH = Math.floor(endTotal / 60);
  const endM = endTotal % 60;
  const endDateTime = `${dateStr}T${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00`;

  return { startDateTime, endDateTime };
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export const googleCalendarService = {
  // OAuth flow (re-exported from calendar domain)
  getAuthUrl,
  handleAuthCallback,
  getConnectionStatus,
  disconnect,

  // Calendar operations
  createMeetingEvent,
  bookingToISO,
  isConfigured,
  getMeetingHosts,
};
