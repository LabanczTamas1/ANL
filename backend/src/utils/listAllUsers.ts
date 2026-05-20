import { getRedisClient } from '../config/database.js';
import { createLogger } from './logger.js';

const logger = createLogger('admin', 'service');

export async function listAllUsers(): Promise<Record<string, unknown>[]> {
  try {
    const redisClient = getRedisClient();
    const users: Record<string, unknown>[] = [];
    let cursor = 0;

    do {
      const result = await redisClient.scan(cursor, {
        MATCH: 'user:*',
        COUNT: 100,
      });
      cursor = result.cursor;

      for (const key of result.keys) {
        // Skip index keys — only process hash user records
        if (
          key.startsWith('user:email:') ||
          key.startsWith('user:username:')
        )
          continue;

        const type = await redisClient.type(key);
        if (type !== 'hash') continue;

        const userData = await redisClient.hGetAll(key);
        if (!userData || !userData.email) continue;

        const { password, hashedPassword, ...safeUserData } = userData;
        users.push({
          id: safeUserData.id || key.replace('user:', ''),
          firstName: safeUserData.firstName || '',
          lastName: safeUserData.lastName || '',
          username: safeUserData.username || '',
          email: safeUserData.email,
          role: safeUserData.role || 'user',
          createdAt: safeUserData.createdAt || '',
          company: safeUserData.company || '',
        });
      }
    } while (cursor !== 0);

    logger.info(`Listed ${users.length} users`);
    return users;
  } catch (error) {
    logger.error({ err: error }, 'Error listing all users');
    return [];
  }
}
