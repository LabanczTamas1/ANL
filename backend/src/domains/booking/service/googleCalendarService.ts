// ---------------------------------------------------------------------------
// Google Calendar Service — OAuth-based Meet + Calendar integration
// ---------------------------------------------------------------------------
// Uses the admin's personal Google account (OAuth2 refresh token stored in
// Redis) to create Calendar events with automatic Google Meet links.
// No service account or Google Workspace required.
// ---------------------------------------------------------------------------

import { google, calendar_v3 } from 'googleapis';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../../../config/env.js';
import { getRedisClient } from '../../../config/database.js';
import { createLogger, logError } from '../../../utils/logger.js';

const logger = createLogger('booking', 'service');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MEETING_HOSTS_KEY = 'settings:meeting_hosts';
const CALENDAR_TOKENS_KEY = 'settings:google_calendar_tokens';

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/userinfo.email',
];



// ---------------------------------------------------------------------------
// OAuth2 helper
// ---------------------------------------------------------------------------

function createOAuth2Client() {
  const frontendUrl = env.ALLOWED_ORIGINS.split(',')[0].trim() || 'http://localhost:5173';
  return new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    `${frontendUrl}/admin/calendar-callback`,
  );
}

/**
 * Generate the URL the admin clicks to authorize calendar access.
 */
function getAuthUrl(): string {
  const oauth2Client = createOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // force consent to always get refresh_token
    scope: SCOPES,
    state: 'calendar_connect',
  });
}

/**
 * Exchange an authorization code for tokens and persist to Redis.
 */
async function handleAuthCallback(code: string): Promise<{ email: string }> {
  const oauth2Client = createOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.refresh_token) {
    throw new Error(
      'No refresh token received. Revoke app access at https://myaccount.google.com/permissions and try again.',
    );
  }

  oauth2Client.setCredentials(tokens);

  // Get the authorized user's email
  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  const { data } = await oauth2.userinfo.get();
  const email = data.email || 'unknown';

  // Store in Redis (persistent)
  const r = getRedisClient();
  await r.hSet(CALENDAR_TOKENS_KEY, {
    access_token: tokens.access_token || '',
    refresh_token: tokens.refresh_token,
    expiry_date: String(tokens.expiry_date || ''),
    email,
    connected_at: new Date().toISOString(),
  });

  logger.info({ email }, 'Google Calendar connected via OAuth');
  return { email };
}

/**
 * Get the stored OAuth2 client with valid tokens, or null if not connected.
 */
async function getAuthenticatedClient(): Promise<InstanceType<typeof google.auth.OAuth2> | null> {
  try {
    const r = getRedisClient();
    const data = await r.hGetAll(CALENDAR_TOKENS_KEY);

    if (!data.refresh_token) {
      logger.debug('No calendar tokens found in Redis');
      return null;
    }

    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials({
      access_token: data.access_token || undefined,
      refresh_token: data.refresh_token,
      expiry_date: data.expiry_date ? parseInt(data.expiry_date, 10) : undefined,
    });

    // If the token is expired or about to expire, refresh it
    const tokenInfo = oauth2Client.credentials;
    if (tokenInfo.expiry_date && Date.now() >= tokenInfo.expiry_date - 60_000) {
      const { credentials } = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(credentials);

      // Persist updated tokens
      await r.hSet(CALENDAR_TOKENS_KEY, {
        access_token: credentials.access_token || '',
        expiry_date: String(credentials.expiry_date || ''),
      });

      logger.debug('Refreshed Google Calendar access token');
    }

    return oauth2Client;
  } catch (err) {
    logError(err, { context: 'getAuthenticatedClient' });
    return null;
  }
}

/**
 * Check the connection status.
 */
async function getConnectionStatus(): Promise<{
  connected: boolean;
  email: string | null;
  connectedAt: string | null;
}> {
  try {
    const r = getRedisClient();
    const data = await r.hGetAll(CALENDAR_TOKENS_KEY);

    if (!data.refresh_token) {
      return { connected: false, email: null, connectedAt: null };
    }

    return {
      connected: true,
      email: data.email || null,
      connectedAt: data.connected_at || null,
    };
  } catch {
    return { connected: false, email: null, connectedAt: null };
  }
}

/**
 * Disconnect — remove stored tokens.
 */
async function disconnect(): Promise<void> {
  const r = getRedisClient();
  await r.del(CALENDAR_TOKENS_KEY);
  logger.info('Google Calendar disconnected');
}

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
// Capability check
// ---------------------------------------------------------------------------

/**
 * Returns true if Google Calendar OAuth credentials are available.
 * Callers should use this before attempting event creation.
 */
async function isConfigured(): Promise<boolean> {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) return false;
  const status = await getConnectionStatus();
  return status.connected;
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export const googleCalendarService = {
  // OAuth flow
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
