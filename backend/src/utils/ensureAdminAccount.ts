import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { getRedisClient } from '../config/database.js';
import { createLogger } from './logger.js';

const logger = createLogger('admin', 'infra');

export async function ensureAdminAccount(): Promise<void> {
  try {
    const redisClient = getRedisClient();

    const adminUsername = 'admin';
    const adminEmail = 'admin@example.com';

    const adminId = await redisClient.get(`username:${adminUsername}`);
    if (adminId) {
      logger.info('Admin account already exists');
      return;
    }

    const adminIdGenerated = uuidv4();
    const adminPassword = 'Admin123!';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const adminKey = `user:${adminIdGenerated}`;
    await redisClient.sAdd('users', adminIdGenerated);

    await redisClient.hSet(adminKey, {
      firstName: 'Admin',
      lastName: 'User',
      email: adminEmail,
      username: adminUsername,
      hashedPassword,
      role: 'admin',
    });

    await redisClient.set(`username:${adminUsername}`, adminIdGenerated);
    await redisClient.set(`email:${adminEmail}`, adminIdGenerated);

    logger.info(
      { username: adminUsername },
      'Admin account created successfully',
    );
  } catch (error) {
    logger.error({ err: error }, 'Error ensuring admin account exists');
  }
}
