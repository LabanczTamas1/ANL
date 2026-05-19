const { v4: uuidv4 } = require("uuid");
const { getRedisClient } = require("../config/database");

const SYSTEM_SENDER = {
  fromId: "system",
  fromName: "ANL System",
  fromEmail: "system@anl.internal",
};

/**
 * Deliver a system notification directly to a user's inbox.
 * Nothing is sent to any real email address.
 *
 * @param {string} userId  - The Redis user ID (the UUID stored under user:{id})
 * @param {string} subject
 * @param {string} body
 */
async function sendSystemNotification(userId, subject, body) {
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
      isRead: "false",
    });

    // 90-day TTL — system notifications don't need to live forever
    await redisClient.expire(mailDetailsKey, 90 * 24 * 60 * 60);

    await redisClient.zAdd(`inbox:${userId}`, {
      score: timestamp,
      value: mailId,
    });
  } catch (err) {
    // Never let a notification failure break the parent request
    console.error("[SystemNotification] Failed to deliver notification:", err);
  }
}

// ── Pre-built notification templates ──────────────────────────────────────────

async function notifyWelcome(userId, firstName) {
  await sendSystemNotification(
    userId,
    "Welcome to ANL!",
    `Hi ${firstName},\n\nYour account has been verified and is ready to use. We're glad to have you on board!\n\nIf you have any questions, feel free to reach out.\n\n— The ANL Team`
  );
}

async function notifyProgressUpdated(userId, firstName, progressionStatus, progressionCategory) {
  const lines = [`Hi ${firstName},\n\nYour progress has been updated:`];
  if (progressionStatus) lines.push(`  • Status: ${progressionStatus}`);
  if (progressionCategory) lines.push(`  • Category: ${progressionCategory}`);
  lines.push("\nKeep up the great work!\n\n— The ANL Team");

  await sendSystemNotification(
    userId,
    "Your progress has been updated",
    lines.join("\n")
  );
}

async function notifyProfileUpdated(userId, firstName, changedFields) {
  const fieldList = changedFields.length > 0
    ? changedFields.map((f) => `  • ${f}`).join("\n")
    : "  • (various fields)";

  await sendSystemNotification(
    userId,
    "Your profile was updated",
    `Hi ${firstName},\n\nThe following profile information was recently changed:\n\n${fieldList}\n\nIf you did not make these changes, please contact support immediately.\n\n— The ANL Team`
  );
}

async function notifyRoleChanged(userId, firstName, newRole) {
  await sendSystemNotification(
    userId,
    "Your account role has changed",
    `Hi ${firstName},\n\nYour account role has been updated to: ${newRole}.\n\nIf you have questions about what this means, feel free to get in touch.\n\n— The ANL Team`
  );
}

module.exports = {
  sendSystemNotification,
  notifyWelcome,
  notifyProgressUpdated,
  notifyProfileUpdated,
  notifyRoleChanged,
};
