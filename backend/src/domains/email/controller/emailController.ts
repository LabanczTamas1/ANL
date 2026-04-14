// ---------------------------------------------------------------------------
// Email Controller — internal messaging + SMTP
// ---------------------------------------------------------------------------

import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import { getRedisClient } from '../../../config/database.js';
import { env } from '../../../config/env.js';
import { createLogger, logError } from '../../../utils/logger.js';

const logger = createLogger('email', 'controller');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // STARTTLS on port 587
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
    const r = getRedisClient();
    const recipientString = typeof recipient === 'string' ? recipient : JSON.stringify(recipient);
    const bodyString = typeof body === 'string' ? body : JSON.stringify(body);

    const userName = `username:${name}`;
    const userId = (await r.get(`user:${userName}`)) || (await r.get(userName));

    if (!userId) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const userData = await r.hGetAll(`user:${userId}`);
    const fromEmail = userData.email;

    const mailId = uuidv4();
    const timestamp = Date.now();

    await r.hSet(`MailDetails:${mailId}`, {
      fromId: userId,
      fromName: name,
      fromEmail: fromEmail,
      subject,
      recipient: recipientString,
      body: bodyString,
      timeSended: String(timestamp),
      isRead: 'false',
    });

    await r.zAdd(`inbox:${userId}`, { score: timestamp, value: mailId });
    await r.zAdd(`SentMail:${userId}`, { score: timestamp, value: mailId });
    await r.expire(`MailDetails:${mailId}`, 30 * 24 * 60 * 60);

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
    const r = getRedisClient();
    const userId = await r.get(`username:${username}`);
    const mails = await r.zRange(`inbox:${userId}`, 0, -1);

    const mailDetails = await Promise.all(
      mails.map((mailId) => r.hGetAll(`MailDetails:${mailId}`)),
    );

    res.json(mailDetails);
  } catch (error) {
    logError(error, { context: 'getInbox' });
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getSentMails(req: Request, res: Response): Promise<void> {
  const { username } = req.params;
  try {
    const r = getRedisClient();
    const userId = await r.get(`username:${username}`);
    const mails = await r.zRange(`SentMail:${userId}`, 0, -1);

    const mailDetails = await Promise.all(
      mails.map((mailId) => r.hGetAll(`MailDetails:${mailId}`)),
    );

    res.json(mailDetails);
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
    const r = getRedisClient();
    const name = username || req.body.name;
    const userId = await r.get(`username:${name}`);

    if (!userId) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    for (const emailId of emailIds) {
      await r.hSet(`MailDetails:${emailId}`, { isRead: 'true' });
    }

    res.status(200).json({ message: 'Emails marked as read successfully' });
  } catch (error) {
    logError(error, { context: 'markAsRead' });
    res.status(500).json({ error: 'Failed to mark emails as read' });
  }
}

export async function getUnreadCount(req: Request, res: Response): Promise<void> {
  const { username } = req.query;

  try {
    const r = getRedisClient();
    const userId =
      (await r.get(`user:username:${username}`)) ||
      (await r.get(`username:${username}`));

    if (!userId) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const mails = await r.zRange(`inbox:${userId}`, 0, -1);
    let unreadCount = 0;

    for (const mailId of mails) {
      const isRead = await r.hGet(`MailDetails:${mailId}`, 'isRead');
      if (isRead === 'false' || !isRead) unreadCount++;
    }

    res.json({ count: unreadCount });
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
    const r = getRedisClient();
    const userId = await r.get(`username:${username}`);

    if (!userId) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    for (const emailId of emailIds) {
      await r.del(`MailDetails:${emailId}`);
      await r.zRem(`inbox:${userId}`, emailId);
    }

    res.status(200).json({
      message: `Successfully deleted ${emailIds.length} email(s)`,
      deletedIds: emailIds,
    });
  } catch (error) {
    logError(error, { context: 'deleteEmails' });
    res.status(500).json({ error: 'Failed to delete emails' });
  }
}
