// ---------------------------------------------------------------------------
// Calendar Auth Service — Google OAuth credential management
// ---------------------------------------------------------------------------
// Manages the OAuth2 connection lifecycle (authorize, store tokens, refresh,
// disconnect). Separated from booking-specific calendar operations so that
// admin and booking domains can share the auth layer without coupling.
// ---------------------------------------------------------------------------

import { google } from 'googleapis';
import { env } from '../../../config/env.js';
import { getRedisClient } from '../../../config/database.js';
import { createLogger, logError } from '../../../utils/logger.js';

const logger = createLogger('calendar', 'service');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

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
  const frontendUrl = env.FRONTEND_URL || env.ALLOWED_ORIGINS.split(',')[0].trim();
  return new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    `${frontendUrl}/admin/calendar-callback`,
  );
}

/**
 * Generate the URL the admin clicks to authorize calendar access.
 */
export function getAuthUrl(): string {
  const oauth2Client = createOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
    state: 'calendar_connect',
  });
}

/**
 * Exchange an authorization code for tokens and persist to Redis.
 */
export async function handleAuthCallback(code: string): Promise<{ email: string }> {
  const oauth2Client = createOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.refresh_token) {
    throw new Error(
      'No refresh token received. Revoke app access at https://myaccount.google.com/permissions and try again.',
    );
  }

  oauth2Client.setCredentials(tokens);

  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  const { data } = await oauth2.userinfo.get();
  const email = data.email || 'unknown';

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
 * Shared by both the admin auth flow and the booking calendar operations.
 */
export async function getAuthenticatedClient(): Promise<InstanceType<typeof google.auth.OAuth2> | null> {
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

    const tokenInfo = oauth2Client.credentials;
    if (tokenInfo.expiry_date && Date.now() >= tokenInfo.expiry_date - 60_000) {
      const { credentials } = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(credentials);

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
export async function getConnectionStatus(): Promise<{
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
export async function disconnect(): Promise<void> {
  const r = getRedisClient();
  await r.del(CALENDAR_TOKENS_KEY);
  logger.info('Google Calendar disconnected');
}

/**
 * Returns true if Google Calendar OAuth credentials are available.
 */
export async function isConfigured(): Promise<boolean> {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) return false;
  const status = await getConnectionStatus();
  return status.connected;
}

export const calendarAuthService = {
  getAuthUrl,
  handleAuthCallback,
  getAuthenticatedClient,
  getConnectionStatus,
  disconnect,
  isConfigured,
};
