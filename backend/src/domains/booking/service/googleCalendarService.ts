// ---------------------------------------------------------------------------
// Google Calendar Service — service-account based Meet + Calendar integration
// ---------------------------------------------------------------------------

import { google, calendar_v3 } from 'googleapis';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../../../config/env.js';
import { createLogger } from '../../../utils/logger.js';

const logger = createLogger('booking', 'service');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/**
 * All ANL team members who should be invited to every booking meeting.
 * Comma-separated in the ANL_TEAM_EMAILS env var.
 */
const ANL_TEAM_MEMBERS: string[] = (env.ANL_TEAM_EMAILS || '')
  .split(',')
  .map((e) => e.trim())
  .filter(Boolean);

/**
 * The Google Workspace user whose calendar the event is created on.
 * The service account impersonates this user via domain-wide delegation.
 */
const CALENDAR_OWNER = env.ANL_CALENDAR_OWNER || '';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

// ---------------------------------------------------------------------------
// Auth helper
// ---------------------------------------------------------------------------

function getAuthClient() {
  let credentials: Record<string, unknown> | undefined;

  if (env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    try {
      credentials = JSON.parse(env.GOOGLE_SERVICE_ACCOUNT_KEY);
    } catch (err) {
      throw new Error('Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY JSON');
    }
  } else if (env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE) {
    // Dynamic import of the JSON file
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    credentials = require(env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE);
  }

  if (!credentials) {
    throw new Error(
      'Missing Google service-account credentials. ' +
        'Set GOOGLE_SERVICE_ACCOUNT_KEY (JSON string) or GOOGLE_SERVICE_ACCOUNT_KEY_FILE (path).',
    );
  }

  if (!CALENDAR_OWNER) {
    throw new Error(
      'ANL_CALENDAR_OWNER env var is required (e.g. meetings@adsandleads.com).',
    );
  }

  const auth = new google.auth.JWT({
    email: credentials.client_email as string,
    key: credentials.private_key as string,
    scopes: SCOPES,
    subject: CALENDAR_OWNER, // impersonate via domain-wide delegation
  });

  return auth;
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
 * The event is created on CALENDAR_OWNER's calendar.
 * All ANL_TEAM_MEMBERS are added as attendees (pre-accepted).
 * The external booker is also invited.
 *
 * Google sends calendar invites to all attendees automatically.
 */
async function createMeetingEvent(
  input: CalendarEventInput,
): Promise<CalendarEventResult> {
  const auth = getAuthClient();
  const calendar = google.calendar({ version: 'v3', auth });

  // Build attendees: team members + external booker
  const attendees: calendar_v3.Schema$EventAttendee[] = [
    // ANL team members — auto-accepted so it shows on their calendars
    ...ANL_TEAM_MEMBERS.map((email) => ({
      email,
      responseStatus: 'accepted' as const,
    })),
    // External booker
    ...input.attendeeEmails
      .filter((e) => !ANL_TEAM_MEMBERS.includes(e))
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
      teamMembers: ANL_TEAM_MEMBERS.length,
    },
    'Creating Google Calendar event with Meet',
  );

  const response = await calendar.events.insert({
    calendarId: CALENDAR_OWNER,
    requestBody: event,
    conferenceDataVersion: 1,
    sendUpdates: 'all', // sends calendar invite emails to everyone
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

/**
 * Converts a date string (YYYY-MM-DD) + time in minutes-past-midnight
 * to a pair of ISO-like timestamps for a meeting of `durationMinutes`.
 */
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
// Capability check
// ---------------------------------------------------------------------------

/**
 * Returns true if Google Calendar integration is configured.
 * If false, callers should skip calendar creation gracefully.
 */
function isConfigured(): boolean {
  return !!(
    (env.GOOGLE_SERVICE_ACCOUNT_KEY || env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE) &&
    CALENDAR_OWNER
  );
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export const googleCalendarService = {
  createMeetingEvent,
  bookingToISO,
  isConfigured,
  ANL_TEAM_MEMBERS,
};
