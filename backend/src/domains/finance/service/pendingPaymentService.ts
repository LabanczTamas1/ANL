// ---------------------------------------------------------------------------
// Pending Payment Service — expected payments with due-date email reminders
// ---------------------------------------------------------------------------

import nodemailer from 'nodemailer';
import { getRedisClient } from '../../../config/database.js';
import { env } from '../../../config/env.js';
import { createLogger, logError } from '../../../utils/logger.js';

const logger = createLogger('finance', 'service');

// ─── Redis key helpers ───────────────────────────────────────────────────────

const pendingKey = (id: string) => `finance:pending:${id}`;
const userPendingsKey = (userId: string) => `finance:user:${userId}:pendings`;
const allPendingsKey = () => `finance:pending:all`;

export { pendingKey, userPendingsKey, allPendingsKey };

// ─── SMTP transporter ────────────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST || 'smtp.gmail.com',
  port: env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

// ─── Send due-payment notification email ─────────────────────────────────────

export async function sendDuePaymentEmail(params: {
  ownerEmail: string;
  ownerName: string;
  clientName: string;
  amount: number;
  currency: string;
  description: string;
  dueDate: string;
  pendingId: string;
}): Promise<void> {
  const {
    ownerEmail,
    ownerName,
    clientName,
    amount,
    currency,
    description,
    dueDate,
    pendingId,
  } = params;

  const confirmUrl = `${env.FRONTEND_URL}/admin#user-management?action=confirm-payment&id=${pendingId}`;
  const rejectUrl = `${env.FRONTEND_URL}/admin#user-management?action=reject-payment&id=${pendingId}`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #65558F; padding: 20px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 20px;">Expected Payment Due</h1>
      </div>
      <div style="background: #f9f9f9; padding: 24px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="margin-top: 0;">Hi <strong>${ownerName}</strong>,</p>
        <p>An expected payment is now due and requires your confirmation:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr>
            <td style="padding: 8px 0; color: #666; width: 120px;">Client:</td>
            <td style="padding: 8px 0; font-weight: 600;">${clientName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Amount:</td>
            <td style="padding: 8px 0; font-weight: 600;">${amount.toFixed(2)} ${currency}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Due Date:</td>
            <td style="padding: 8px 0; font-weight: 600;">${dueDate}</td>
          </tr>
          ${description ? `
          <tr>
            <td style="padding: 8px 0; color: #666;">Description:</td>
            <td style="padding: 8px 0;">${description}</td>
          </tr>` : ''}
        </table>

        <p>Please log in to confirm or reject this payment:</p>
        
        <div style="text-align: center; margin: 24px 0;">
          <a href="${confirmUrl}" style="display: inline-block; padding: 12px 24px; background: #16a34a; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin-right: 8px;">Confirm Received</a>
          <a href="${rejectUrl}" style="display: inline-block; padding: 12px 24px; background: #dc2626; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Reject / Not Received</a>
        </div>

        <p style="color: #888; font-size: 12px; margin-bottom: 0;">
          This is an automated notification from ANL Finance. The payment will not be credited automatically — 
          it requires your manual confirmation.
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
      to: ownerEmail,
      subject: `Payment Due: ${amount.toFixed(2)} ${currency} from ${clientName}`,
      html,
      text: `Hi ${ownerName},\n\nAn expected payment of ${amount.toFixed(2)} ${currency} from ${clientName} is now due (${dueDate}).\nDescription: ${description || 'N/A'}\n\nPlease log in to confirm or reject: ${confirmUrl}\n\nThis payment will NOT be credited automatically.`,
    });

    logger.info({ pendingId, ownerEmail }, 'Due payment notification email sent');
  } catch (err) {
    logError(err, { context: 'sendDuePaymentEmail', pendingId });
    throw err;
  }
}

// ─── Check for due payments and send notifications ───────────────────────────

export async function checkDuePayments(): Promise<void> {
  const r = getRedisClient();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  try {
    // Get all pending payment IDs
    const pendingIds = await r.sMembers(allPendingsKey());

    for (const id of pendingIds) {
      const pending = await r.hGetAll(pendingKey(id));
      if (!pending || !pending.id) continue;

      // Skip if already notified or resolved
      if (pending.status !== 'pending') continue;
      if (pending.notified === 'true') continue;

      // Check if due date has arrived
      if (pending.dueDate <= today) {
        // Get all owners/admins to notify
        const owners = await getOwnersAndAdmins();

        for (const owner of owners) {
          await sendDuePaymentEmail({
            ownerEmail: owner.email,
            ownerName: owner.name,
            clientName: pending.userName,
            amount: parseFloat(pending.originalAmount),
            currency: pending.originalCurrency,
            description: pending.description,
            dueDate: pending.dueDate,
            pendingId: id,
          });
        }

        // Mark as notified
        await r.hSet(pendingKey(id), 'notified', 'true');
        await r.hSet(pendingKey(id), 'notifiedAt', new Date().toISOString());

        // Log event on the user's account
        await logPendingEvent(pending.userId, id, 'due_notification_sent', 
          `Expected payment of ${pending.originalAmount} ${pending.originalCurrency} is now due. Owners notified.`);

        logger.info({ pendingId: id, dueDate: pending.dueDate, userId: pending.userId }, 
          'Due payment notification processed');
      }
    }
  } catch (err) {
    logError(err, { context: 'checkDuePayments' });
  }
}

// ─── Get all admin/owner users ───────────────────────────────────────────────

async function getOwnersAndAdmins(): Promise<{ id: string; email: string; name: string }[]> {
  const r = getRedisClient();
  const results: { id: string; email: string; name: string }[] = [];

  let cursor = 0;
  do {
    const scan = await r.scan(cursor, { MATCH: 'user:*', COUNT: 200 });
    cursor = scan.cursor;

    for (const key of scan.keys) {
      // Skip non-user-data keys
      if (key.includes(':') && key.split(':').length > 2) continue;

      const userData = await r.hGetAll(key);
      if (userData.role === 'admin' || userData.role === 'owner') {
        const name = [userData.firstName, userData.lastName].filter(Boolean).join(' ')
          || userData.username || userData.email;
        results.push({ id: userData.id || key.replace('user:', ''), email: userData.email, name });
      }
    }
  } while (cursor !== 0);

  return results;
}

// ─── Log pending payment event to the user's transaction history ─────────────

export async function logPendingEvent(
  userId: string,
  pendingId: string,
  eventType: string,
  description: string,
): Promise<void> {
  const r = getRedisClient();
  const crypto = await import('crypto');
  const txId = crypto.randomUUID();
  const now = new Date().toISOString();

  const logEntry = {
    id: txId,
    userId,
    pendingId,
    type: 'log',
    eventType,
    amount: '0.00',
    description,
    performedBy: 'system',
    performedByName: 'System',
    balanceBefore: (await r.get(`finance:balance:${userId}`)) || '0',
    balanceAfter: (await r.get(`finance:balance:${userId}`)) || '0',
    createdAt: now,
  };

  await r.hSet(`finance:tx:${txId}`, logEntry);
  await r.zAdd(`finance:user:${userId}:txs`, { score: Date.now(), value: txId });
}
