import { getRedisClient } from '../config/database.js';
import { createLogger } from './logger.js';

const logger = createLogger('admin', 'service');

export async function listAllUsers(): Promise<Record<string, unknown>[]> {
  try {
    const redisClient = getRedisClient();
    const userKeys = await redisClient.keys('user:*');

    const actualUserKeys = userKeys.filter(
      (key) =>
        !key.startsWith('user:email:') && !key.startsWith('user:username:'),
    );

    const users: Record<string, unknown>[] = [];

    for (const userKey of actualUserKeys) {
      const type = await redisClient.type(userKey);

      if (type === 'hash') {
        const userData = await redisClient.hGetAll(userKey);

        if (userData && Object.keys(userData).length > 0) {
          const { password, hashedPassword, ...safeUserData } = userData;
          users.push(safeUserData);
        }
      }
    }

    logger.info(`Listed ${users.length} users`);
    return users;
  } catch (error) {
    logger.error({ err: error }, 'Error listing all users');
    return [];
  }
}
