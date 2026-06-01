import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from './logger.js';
import * as userRepo from '../domains/user/repository/userRepository.js';

const logger = createLogger('admin', 'infra');

export async function ensureAdminAccount(): Promise<void> {
  try {
    const adminEmail = 'admin@example.com';

    const existing = await userRepo.findByEmail(adminEmail);
    if (existing) {
      logger.info('Admin account already exists');
      return;
    }

    const adminPassword = 'Admin123!';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await userRepo.createUser({
      id: uuidv4(),
      email: adminEmail,
      username: 'admin',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      verified: true,
    });

    logger.info(
      { username: 'admin' },
      'Admin account created successfully',
    );
  } catch (error) {
    logger.error({ err: error }, 'Error ensuring admin account exists');
  }
}
