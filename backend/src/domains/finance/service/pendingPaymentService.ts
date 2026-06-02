// ---------------------------------------------------------------------------
// Pending Payment Service — expected payments with due-date email reminders
// ---------------------------------------------------------------------------

import nodemailer from 'nodemailer';
import { env } from '../../../config/env.js';
import { createLogger, logError } from '../../../utils/logger.js';
import { query, queryOne, execute } from '../../../utils/db.js';
import * as userRepo from '../../user/public.js';
import crypto from 'crypto';

const logger = createLogger('finance', 'service');

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
          This is an automated notification from ANL Finance.
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
      text: `Hi ${ownerName},\n\nAn expected payment of ${amount.toFixed(2)} ${currency} from ${clientName} is now due (${dueDate}).\nDescription: ${description || 'N/A'}\n\nPlease log in to confirm or reject: ${confirmUrl}`,
    });

    logger.info({ pendingId, ownerEmail }, 'Due payment notification email sent');
  } catch (err) {
    logError(err, { context: 'sendDuePaymentEmail', pendingId });
    throw err;
  }
}

// ─── Check for due payments and send notifications ───────────────────────────

export async function checkDuePayments(): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  try {
    const duePendings = await query<any>(
      `SELECT * FROM pending_payments WHERE status = 'pending' AND notified = false AND due_date <= $1`,
      [today],
    );

    for (const pending of duePendings) {
      const owners = await userRepo.findByRole('admin');
      const ownerUsers = [
        ...owners,
        ...(await userRepo.findByRole('owner')),
      ];

      for (const owner of ownerUsers) {
        const ownerName =
          `${owner.first_name} ${owner.last_name}`.trim() || owner.username || owner.email;

        await sendDuePaymentEmail({
          ownerEmail: owner.email,
          ownerName,
          clientName: pending.user_name,
          amount: parseFloat(pending.original_amount),
          currency: pending.original_currency,
          description: pending.description,
          dueDate: pending.due_date instanceof Date
            ? pending.due_date.toISOString().split('T')[0]
            : String(pending.due_date),
          pendingId: pending.id,
        });
      }

      // Mark as notified
      await execute(
        `UPDATE pending_payments SET notified = true, notified_at = now() WHERE id = $1`,
        [pending.id],
      );

      await logPendingEvent(pending.user_id, pending.id, 'due_notification_sent',
        `Expected payment of ${pending.original_amount} ${pending.original_currency} is now due. Owners notified.`);

      logger.info({ pendingId: pending.id, dueDate: pending.due_date, userId: pending.user_id },
        'Due payment notification processed');
    }
  } catch (err) {
    logError(err, { context: 'checkDuePayments' });
  }
}

// ─── Log pending payment event to the user's transaction history ─────────────

export async function logPendingEvent(
  userId: string,
  pendingId: string,
  eventType: string,
  description: string,
): Promise<void> {
  const txId = crypto.randomUUID();

  const balanceRow = await queryOne<{ balance: string }>(
    `SELECT COALESCE(balance, 0) as balance FROM user_balances WHERE user_id = $1`,
    [userId],
  );
  const currentBalance = balanceRow?.balance || '0';

  await query(
    `INSERT INTO finance_transactions (id, user_id, type, event_type, amount, description, performed_by, performed_by_name, balance_before, balance_after, pending_id)
     VALUES ($1, $2, 'log', $3, 0, $4, 'system', 'System', $5, $5, $6)`,
    [txId, userId, eventType, description, currentBalance, pendingId],
  );
}
