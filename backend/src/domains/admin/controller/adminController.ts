// ---------------------------------------------------------------------------
// Admin Controller — stats, IP banning, user email listing, meeting hosts,
//                    Google Calendar connection
// ---------------------------------------------------------------------------

import { Request, Response } from 'express';
import { getRedisClient } from '../../../config/database.js';
import {
  getRequestStats,
  resetRequestStats,
} from '../../../utils/admin/trackRequest.js';
import { googleCalendarService } from '../../booking/service/googleCalendarService.js';
import { createLogger, logError } from '../../../utils/logger.js';

const logger = createLogger('admin', 'controller');

const MEETING_HOSTS_KEY = 'settings:meeting_hosts';

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
    const r = getRedisClient();
    const { ip } = req.body;
    if (!ip) {
      res.status(400).json({ error: 'IP address is required' });
      return;
    }
    await r.sAdd('banned_ips', ip);
    res.json({ message: `IP ${ip} has been banned.` });
  } catch (err) {
    logError(err, { context: 'banIp' });
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function unbanIp(req: Request, res: Response): Promise<void> {
  try {
    const r = getRedisClient();
    const { ip } = req.body;
    if (!ip) {
      res.status(400).json({ error: 'IP address is required' });
      return;
    }
    await r.sRem('banned_ips', ip);
    res.json({ message: `IP ${ip} has been unbanned.` });
  } catch (err) {
    logError(err, { context: 'unbanIp' });
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getBannedIps(_req: Request, res: Response): Promise<void> {
  try {
    const r = getRedisClient();
    const ips = await r.sMembers('banned_ips');
    res.json({ banned: ips });
  } catch (err) {
    logError(err, { context: 'getBannedIps' });
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getEmails(_req: Request, res: Response): Promise<void> {
  try {
    const r = getRedisClient();
    const pattern = 'user:email:*';
    const userDetails: Record<string, string>[] = [];
    const emails: string[] = [];

    let cursor = 0;
    do {
      const result = await r.scan(cursor, { MATCH: pattern, COUNT: 100 });
      cursor = result.cursor;
      for (const key of result.keys) {
        const email = key.replace('user:email:', '');
        emails.push(email);
        const userId = await r.get(key);
        const userInfo = await r.hGetAll(`user:${userId}`);
        userDetails.push({
          userId: userId || '',
          email,
          firstName: userInfo.firstName || '',
          lastName: userInfo.lastName || '',
          username: userInfo.username || '',
          createdAt: userInfo.createdAt || '',
        });
      }
    } while (cursor !== 0);

    res.status(200).json({
      success: true,
      count: emails.length,
      emails: userDetails,
    });
  } catch (err) {
    logError(err, { context: 'getEmails' });
    res.status(500).json({
      success: false,
      error: 'Server error while fetching emails',
    });
  }
}

// ---------------------------------------------------------------------------
// Meeting Hosts — manage who gets invited to booking meetings
// ---------------------------------------------------------------------------

/**
 * GET /admin/meeting-hosts
 * Returns the list of emails that are invited to every booking meeting.
 */
export async function getMeetingHosts(_req: Request, res: Response): Promise<void> {
  try {
    const r = getRedisClient();
    const hosts = await r.sMembers(MEETING_HOSTS_KEY);
    res.json({ hosts: hosts.sort() });
  } catch (err) {
    logError(err, { context: 'getMeetingHosts' });
    res.status(500).json({ error: 'Failed to retrieve meeting hosts' });
  }
}

/**
 * POST /admin/meeting-hosts
 * Add one or more emails to the meeting hosts list.
 * Body: { emails: string | string[] }
 */
export async function addMeetingHost(req: Request, res: Response): Promise<void> {
  try {
    const r = getRedisClient();
    const { emails } = req.body;

    const emailList: string[] = (Array.isArray(emails) ? emails : [emails])
      .map((e: string) => e?.trim()?.toLowerCase())
      .filter(Boolean);

    if (emailList.length === 0) {
      res.status(400).json({ error: 'At least one email is required' });
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalid = emailList.filter((e) => !emailRegex.test(e));
    if (invalid.length > 0) {
      res.status(400).json({ error: `Invalid email(s): ${invalid.join(', ')}` });
      return;
    }

    await r.sAdd(MEETING_HOSTS_KEY, emailList);
    const hosts = await r.sMembers(MEETING_HOSTS_KEY);

    logger.info({ added: emailList, by: req.user?.email }, 'Meeting hosts added');
    res.json({ message: `Added ${emailList.length} host(s)`, hosts: hosts.sort() });
  } catch (err) {
    logError(err, { context: 'addMeetingHost' });
    res.status(500).json({ error: 'Failed to add meeting host' });
  }
}

/**
 * DELETE /admin/meeting-hosts
 * Remove an email from the meeting hosts list.
 * Body: { email: string }
 */
export async function removeMeetingHost(req: Request, res: Response): Promise<void> {
  try {
    const r = getRedisClient();
    const { email } = req.body;

    if (!email?.trim()) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const removed = await r.sRem(MEETING_HOSTS_KEY, email.trim().toLowerCase());
    const hosts = await r.sMembers(MEETING_HOSTS_KEY);

    if (!removed) {
      res.status(404).json({ error: 'Email not found in meeting hosts', hosts: hosts.sort() });
      return;
    }

    logger.info({ removed: email, by: req.user?.email }, 'Meeting host removed');
    res.json({ message: `Removed ${email}`, hosts: hosts.sort() });
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
    const status = await googleCalendarService.getConnectionStatus();
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
    const url = googleCalendarService.getAuthUrl();
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

    const result = await googleCalendarService.handleAuthCallback(code);
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
    await googleCalendarService.disconnect();
    logger.info({ by: req.user?.email }, 'Google Calendar disconnected');
    res.json({ message: 'Google Calendar disconnected' });
  } catch (err) {
    logError(err, { context: 'disconnectCalendar' });
    res.status(500).json({ error: 'Failed to disconnect calendar' });
  }
}
