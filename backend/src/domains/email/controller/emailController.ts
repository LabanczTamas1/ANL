// ---------------------------------------------------------------------------
// Email Controller — internal messaging + SMTP
// ---------------------------------------------------------------------------

import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import { env } from '../../../config/env.js';
import { JwtService } from '../../../utils/jwt.js';
import { createLogger, logError } from '../../../utils/logger.js';
import { query, queryOne, execute } from '../../../utils/db.js';
import * as userRepo from '../../user/public.js';

const logger = createLogger('email', 'controller');

// ---------------------------------------------------------------------------
// SSE — push unread-count updates to connected clients
// ---------------------------------------------------------------------------

const sseClients = new Map<string, Response[]>();

async function emitUnreadCount(userId: string): Promise<void> {
  const clients = sseClients.get(userId);
  if (!clients || clients.length === 0) return;

  const row = await queryOne<{ count: string }>(
    `SELECT COUNT(*) as count FROM messages WHERE recipient_id = $1 AND is_read = false`,
    [userId],
  );
  const count = parseInt(row?.count || '0', 10);

  const payload = `data: ${JSON.stringify({ count })}\n\n`;
  for (const res of [...clients]) {
    try { res.write(payload); } catch (_) { /* ignore closed */ }
  }
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: env.SMTP_USER || 'deid.unideb@gmail.com',
    pass: env.SMTP_PASS || '',
  },
});

export async function saveEmail(req: Request, res: Response): Promise<void> {
  const { subject, recipient, body, name } = req.body;

  if (!subject || !recipient || !body) {
    res.status(400).json({ error: 'All fields (subject, recipient, body) are required' });
    return;
  }

  try {
    const recipientString = typeof recipient === 'string' ? recipient : JSON.stringify(recipient);
    const bodyString = typeof body === 'string' ? body : JSON.stringify(body);

    const user = await userRepo.findByUsername(name);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const mailId = uuidv4();

    // Save to messages table (inbox)
    await query(
      `INSERT INTO messages (id, from_id, from_name, from_email, recipient_id, subject, body)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [mailId, user.id, name, user.email, user.id, subject, bodyString],
    );

    // Save to sent_messages table
    await query(
      `INSERT INTO sent_messages (id, from_id, from_name, from_email, recipient_email, subject, body)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [uuidv4(), user.id, name, user.email, recipientString, subject, bodyString],
    );

    try { await emitUnreadCount(user.id); } catch (_) {}

    await transporter.sendMail({
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
      to: recipientString,
      subject,
      text: `Email from ANL Website:\n${bodyString}\n`,
    });

    res.status(200).json({ message: 'Email saved successfully', id: mailId });
  } catch (error) {
    logError(error, { context: 'saveEmail' });
    res.status(500).json({ error: 'Failed to save email' });
  }
}

export async function getInbox(req: Request, res: Response): Promise<void> {
  const { username } = req.params;
  try {
    const user = await userRepo.findByUsername(username);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const rows = await query(
      `SELECT id, from_id as "fromId", from_name as "fromName", from_email as "fromEmail",
              subject, body, is_read as "isRead", is_system as "isSystem", created_at as "timeSended"
       FROM messages WHERE recipient_id = $1 ORDER BY created_at DESC`,
      [user.id],
    );

    res.json(rows);
  } catch (error) {
    logError(error, { context: 'getInbox' });
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getSentMails(req: Request, res: Response): Promise<void> {
  const { username } = req.params;
  try {
    const user = await userRepo.findByUsername(username);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const rows = await query(
      `SELECT id, from_id as "fromId", from_name as "fromName", from_email as "fromEmail",
              recipient_email as "recipient", subject, body, created_at as "timeSended"
       FROM sent_messages WHERE from_id = $1 ORDER BY created_at DESC`,
      [user.id],
    );

    res.json(rows);
  } catch (error) {
    logError(error, { context: 'getSentMails' });
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function markAsRead(req: Request, res: Response): Promise<void> {
  const { emailIds, username } = req.body;

  if (!emailIds || !Array.isArray(emailIds)) {
    res.status(400).json({ error: 'Valid emailIds array is required' });
    return;
  }

  try {
    const name = username || req.body.name;
    const user = await userRepo.findByUsername(name);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (emailIds.length > 0) {
      const placeholders = emailIds.map((_: string, i: number) => `$${i + 1}`).join(', ');
      await execute(
        `UPDATE messages SET is_read = true WHERE id IN (${placeholders})`,
        emailIds,
      );
    }

    try { await emitUnreadCount(user.id); } catch (_) {}

    res.status(200).json({ message: 'Emails marked as read successfully' });
  } catch (error) {
    logError(error, { context: 'markAsRead' });
    res.status(500).json({ error: 'Failed to mark emails as read' });
  }
}

export async function getUnreadCount(req: Request, res: Response): Promise<void> {
  const { username } = req.query;

  try {
    const user = await userRepo.findByUsername(username as string);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const row = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM messages WHERE recipient_id = $1 AND is_read = false`,
      [user.id],
    );

    res.json({ count: parseInt(row?.count || '0', 10) });
  } catch (error) {
    logError(error, { context: 'getUnreadCount' });
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteEmails(req: Request, res: Response): Promise<void> {
  const { emailIds, username } = req.body;

  if (!emailIds || !Array.isArray(emailIds) || emailIds.length === 0) {
    res.status(400).json({ error: 'Email IDs array is required' });
    return;
  }
  if (!username) {
    res.status(400).json({ error: 'Username is required' });
    return;
  }

  try {
    const user = await userRepo.findByUsername(username);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const placeholders = emailIds.map((_: string, i: number) => `$${i + 1}`).join(', ');
    await execute(
      `DELETE FROM messages WHERE id IN (${placeholders})`,
      emailIds,
    );

    try { await emitUnreadCount(user.id); } catch (_) {}

    res.status(200).json({
      message: `Successfully deleted ${emailIds.length} email(s)`,
      deletedIds: emailIds,
    });
  } catch (error) {
    logError(error, { context: 'deleteEmails' });
    res.status(500).json({ error: 'Failed to delete emails' });
  }
}

export async function streamUpdates(req: Request, res: Response): Promise<void> {
  const token = req.query.token as string | undefined;
  if (!token) {
    res.status(401).json({ error: 'Token required' });
    return;
  }

  let userId: string;
  try {
    const decoded = JwtService.verifyAccessToken(token);
    userId = decoded.sub as string;
  } catch (_) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  if (!sseClients.has(userId)) sseClients.set(userId, []);
  sseClients.get(userId)!.push(res);

  try { await emitUnreadCount(userId); } catch (_) {}

  req.on('close', () => {
    const clients = sseClients.get(userId);
    if (clients) {
      const idx = clients.indexOf(res);
      if (idx !== -1) clients.splice(idx, 1);
      if (clients.length === 0) sseClients.delete(userId);
    }
  });
}
