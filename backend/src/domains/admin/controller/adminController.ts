// ---------------------------------------------------------------------------
// Admin Controller — stats, IP banning, user email listing, meeting hosts,
//                    Google Calendar connection
// ---------------------------------------------------------------------------

import { Request, Response } from 'express';
import {
  getRequestStats,
  resetRequestStats,
} from '../../../utils/admin/trackRequest.js';
import { calendarAuthService } from '../../calendar/service/calendarAuthService.js';
import { createLogger, logError } from '../../../utils/logger.js';
import { query, queryOne, execute } from '../../../utils/db.js';
import * as userRepo from '../../user/public.js';

const logger = createLogger('admin', 'controller');

export async function getStats(_req: Request, res: Response): Promise<void> {
  try {
    const stats = await getRequestStats();
    res.json(stats);
  } catch (error) {
    logError(error, { context: 'getStats' });
    res.status(500).json({ error: 'Failed to retrieve request statistics' });
  }
}

export async function resetStats(_req: Request, res: Response): Promise<void> {
  try {
    const result = await resetRequestStats();
    res.json(result);
  } catch (error) {
    logError(error, { context: 'resetStats' });
    res.status(500).json({ error: 'Failed to reset request statistics' });
  }
}

export async function banIp(req: Request, res: Response): Promise<void> {
  try {
    const { ip } = req.body;
    if (!ip) {
      res.status(400).json({ error: 'IP address is required' });
      return;
    }
    // banned_ips stored in app_settings as jsonb array
    await execute(
      `INSERT INTO app_settings (key, value) VALUES ('banned_ips', '[]'::jsonb)
       ON CONFLICT (key) DO NOTHING`,
    );
    await execute(
      `UPDATE app_settings SET value = value || $1::jsonb, updated_at = now()
       WHERE key = 'banned_ips' AND NOT value @> $1::jsonb`,
      [JSON.stringify([ip])],
    );
    res.json({ message: `IP ${ip} has been banned.` });
  } catch (err) {
    logError(err, { context: 'banIp' });
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function unbanIp(req: Request, res: Response): Promise<void> {
  try {
    const { ip } = req.body;
    if (!ip) {
      res.status(400).json({ error: 'IP address is required' });
      return;
    }
    const row = await queryOne<{ value: string[] }>(`SELECT value FROM app_settings WHERE key = 'banned_ips'`);
    if (row) {
      const ips = (Array.isArray(row.value) ? row.value : []).filter((i: string) => i !== ip);
      await execute(`UPDATE app_settings SET value = $1::jsonb, updated_at = now() WHERE key = 'banned_ips'`, [JSON.stringify(ips)]);
    }
    res.json({ message: `IP ${ip} has been unbanned.` });
  } catch (err) {
    logError(err, { context: 'unbanIp' });
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getBannedIps(_req: Request, res: Response): Promise<void> {
  try {
    const row = await queryOne<{ value: string[] }>(`SELECT value FROM app_settings WHERE key = 'banned_ips'`);
    const ips = row ? (Array.isArray(row.value) ? row.value : []) : [];
    res.json({ banned: ips });
  } catch (err) {
    logError(err, { context: 'getBannedIps' });
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getEmails(_req: Request, res: Response): Promise<void> {
  try {
    const users = await userRepo.findAll();
    const userDetails = users.map((u: any) => ({
      userId: u.id,
      email: u.email,
      firstName: u.first_name || '',
      lastName: u.last_name || '',
      username: u.username || '',
      createdAt: u.created_at || '',
    }));

    res.status(200).json({
      success: true,
      count: userDetails.length,
      emails: userDetails,
    });
  } catch (err) {
    logError(err, { context: 'getEmails' });
    res.status(500).json({ success: false, error: 'Server error while fetching emails' });
  }
}

// Meeting hosts — stored in app_settings as jsonb array

export async function getMeetingHosts(_req: Request, res: Response): Promise<void> {
  try {
    const row = await queryOne<{ value: string[] }>(`SELECT value FROM app_settings WHERE key = 'meeting_hosts'`);
    const hosts = row ? (Array.isArray(row.value) ? row.value : []) : [];
    res.json({ hosts: hosts.sort() });
  } catch (err) {
    logError(err, { context: 'getMeetingHosts' });
    res.status(500).json({ error: 'Failed to retrieve meeting hosts' });
  }
}

export async function addMeetingHost(req: Request, res: Response): Promise<void> {
  try {
    const { emails } = req.body;
    const emailList: string[] = (Array.isArray(emails) ? emails : [emails])
      .map((e: string) => e?.trim()?.toLowerCase())
      .filter(Boolean);

    if (emailList.length === 0) {
      res.status(400).json({ error: 'At least one email is required' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalid = emailList.filter((e) => !emailRegex.test(e));
    if (invalid.length > 0) {
      res.status(400).json({ error: `Invalid email(s): ${invalid.join(', ')}` });
      return;
    }

    await execute(
      `INSERT INTO app_settings (key, value) VALUES ('meeting_hosts', '[]'::jsonb)
       ON CONFLICT (key) DO NOTHING`,
    );

    // Get current, merge, update
    const row = await queryOne<{ value: string[] }>(`SELECT value FROM app_settings WHERE key = 'meeting_hosts'`);
    const current = row ? (Array.isArray(row.value) ? row.value : []) : [];
    const merged = [...new Set([...current, ...emailList])];
    await execute(`UPDATE app_settings SET value = $1::jsonb, updated_at = now() WHERE key = 'meeting_hosts'`, [JSON.stringify(merged)]);

    logger.info({ added: emailList, by: req.user?.email }, 'Meeting hosts added');
    res.json({ message: `Added ${emailList.length} host(s)`, hosts: merged.sort() });
  } catch (err) {
    logError(err, { context: 'addMeetingHost' });
    res.status(500).json({ error: 'Failed to add meeting host' });
  }
}

export async function removeMeetingHost(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;
    if (!email?.trim()) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const normalised = email.trim().toLowerCase();
    const row = await queryOne<{ value: string[] }>(`SELECT value FROM app_settings WHERE key = 'meeting_hosts'`);
    const current = row ? (Array.isArray(row.value) ? row.value : []) : [];

    if (!current.includes(normalised)) {
      res.status(404).json({ error: 'Email not found in meeting hosts', hosts: current.sort() });
      return;
    }

    const updated = current.filter((e: string) => e !== normalised);
    await execute(`UPDATE app_settings SET value = $1::jsonb, updated_at = now() WHERE key = 'meeting_hosts'`, [JSON.stringify(updated)]);

    logger.info({ removed: email, by: req.user?.email }, 'Meeting host removed');
    res.json({ message: `Removed ${email}`, hosts: updated.sort() });
  } catch (err) {
    logError(err, { context: 'removeMeetingHost' });
    res.status(500).json({ error: 'Failed to remove meeting host' });
  }
}

// ---------------------------------------------------------------------------
// Google Calendar — OAuth connection management
// ---------------------------------------------------------------------------

/**
 * GET /admin/calendar/status
 * Check if Google Calendar is connected.
 */
export async function getCalendarStatus(_req: Request, res: Response): Promise<void> {
  try {
    const status = await calendarAuthService.getConnectionStatus();
    res.json(status);
  } catch (err) {
    logError(err, { context: 'getCalendarStatus' });
    res.status(500).json({ error: 'Failed to check calendar status' });
  }
}

/**
 * GET /admin/calendar/auth-url
 * Get the Google OAuth URL for the admin to authorize calendar access.
 */
export async function getCalendarAuthUrl(_req: Request, res: Response): Promise<void> {
  try {
    const url = calendarAuthService.getAuthUrl();
    res.json({ url });
  } catch (err) {
    logError(err, { context: 'getCalendarAuthUrl' });
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
}

/**
 * POST /admin/calendar/callback
 * Exchange the OAuth code for tokens and store them.
 * Body: { code: string }
 */
export async function handleCalendarCallback(req: Request, res: Response): Promise<void> {
  try {
    const { code } = req.body;
    if (!code) {
      res.status(400).json({ error: 'Authorization code is required' });
      return;
    }

    const result = await calendarAuthService.handleAuthCallback(code);
    logger.info({ email: result.email, by: req.user?.email }, 'Google Calendar connected');
    res.json({ message: 'Google Calendar connected successfully', email: result.email });
  } catch (err: any) {
    logError(err, { context: 'handleCalendarCallback' });
    res.status(400).json({ error: err.message || 'Failed to connect Google Calendar' });
  }
}

/**
 * POST /admin/calendar/disconnect
 * Remove stored calendar tokens.
 */
export async function disconnectCalendar(req: Request, res: Response): Promise<void> {
  try {
    await calendarAuthService.disconnect();
    logger.info({ by: req.user?.email }, 'Google Calendar disconnected');
    res.json({ message: 'Google Calendar disconnected' });
  } catch (err) {
    logError(err, { context: 'disconnectCalendar' });
    res.status(500).json({ error: 'Failed to disconnect calendar' });
  }
}
