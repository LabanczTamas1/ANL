// ---------------------------------------------------------------------------
// System Notifications — internal inbox messages, no real email sent
// ---------------------------------------------------------------------------

import { v4 as uuidv4 } from 'uuid';
import { createLogger } from './logger.js';
import { query } from './db.js';

const logger = createLogger('system', 'infra');

const SYSTEM_SENDER = {
  fromId: 'system',
  fromName: 'ANL System',
  fromEmail: 'system@anl.internal',
};

/**
 * Deliver a system notification directly into a user's inbox (messages table).
 * Nothing is sent to any real email address.
 */
export async function sendSystemNotification(
  userId: string,
  subject: string,
  body: string,
): Promise<void> {
  try {
    await query(
      `INSERT INTO messages (id, from_id, from_name, from_email, recipient_id, subject, body, is_system)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true)`,
      [
        uuidv4(),
        SYSTEM_SENDER.fromId,
        SYSTEM_SENDER.fromName,
        SYSTEM_SENDER.fromEmail,
        userId,
        subject,
        body,
      ],
    );
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
