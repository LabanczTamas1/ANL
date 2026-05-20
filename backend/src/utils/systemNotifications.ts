// ---------------------------------------------------------------------------
// System Notifications — internal inbox messages, no real email sent
// ---------------------------------------------------------------------------

import { v4 as uuidv4 } from 'uuid';
import { getRedisClient } from '../config/database.js';
import { createLogger } from './logger.js';

const logger = createLogger('system', 'notifications');

const SYSTEM_SENDER = {
  fromId: 'system',
  fromName: 'ANL System',
  fromEmail: 'system@anl.internal',
};

/** TTL for system notifications in Redis (90 days) */
const NOTIFICATION_TTL_SECONDS = 90 * 24 * 60 * 60;

/**
 * Deliver a system notification directly into a user's inbox.
 * Nothing is sent to any real email address.
 */
export async function sendSystemNotification(
  userId: string,
  subject: string,
  body: string,
): Promise<void> {
  try {
    const redisClient = getRedisClient();
    const mailId = uuidv4();
    const timestamp = Date.now();
    const mailDetailsKey = `MailDetails:${mailId}`;

    await redisClient.hSet(mailDetailsKey, {
      fromId: SYSTEM_SENDER.fromId,
      fromName: SYSTEM_SENDER.fromName,
      fromEmail: SYSTEM_SENDER.fromEmail,
      subject,
      recipient: userId,
      body,
      timeSended: String(timestamp),
      isRead: 'false',
    });

    await redisClient.expire(mailDetailsKey, NOTIFICATION_TTL_SECONDS);

    await redisClient.zAdd(`inbox:${userId}`, {
      score: timestamp,
      value: mailId,
    });
  } catch (err) {
    // Never let a notification failure break the parent request
    logger.error({ err, userId }, 'Failed to deliver system notification');
  }
}

// ── Pre-built templates ───────────────────────────────────────────────────────

export async function notifyWelcome(
  userId: string,
  firstName: string,
): Promise<void> {
  await sendSystemNotification(
    userId,
    'Welcome to ANL!',
    `Hi ${firstName},\n\nYour account has been verified and is ready to use. We're glad to have you on board!\n\nIf you have any questions, feel free to reach out.\n\n— The ANL Team`,
  );
}

export async function notifyProgressUpdated(
  userId: string,
  firstName: string,
  progressionStatus?: string,
  progressionCategory?: string,
): Promise<void> {
  const lines = [`Hi ${firstName},\n\nYour progress has been updated:`];
  if (progressionStatus) lines.push(`  • Status: ${progressionStatus}`);
  if (progressionCategory) lines.push(`  • Category: ${progressionCategory}`);
  lines.push('\nKeep up the great work!\n\n— The ANL Team');

  await sendSystemNotification(
    userId,
    'Your progress has been updated',
    lines.join('\n'),
  );
}

export async function notifyProfileUpdated(
  userId: string,
  firstName: string,
  changedFields: string[],
): Promise<void> {
  const fieldList =
    changedFields.length > 0
      ? changedFields.map((f) => `  • ${f}`).join('\n')
      : '  • (various fields)';

  await sendSystemNotification(
    userId,
    'Your profile was updated',
    `Hi ${firstName},\n\nThe following profile information was recently changed:\n\n${fieldList}\n\nIf you did not make these changes, please contact support immediately.\n\n— The ANL Team`,
  );
}

export async function notifyRoleChanged(
  userId: string,
  firstName: string,
  newRole: string,
): Promise<void> {
  await sendSystemNotification(
    userId,
    'Your account role has changed',
    `Hi ${firstName},\n\nYour account role has been updated to: ${newRole}.\n\nIf you have questions about what this means, feel free to get in touch.\n\n— The ANL Team`,
  );
}
