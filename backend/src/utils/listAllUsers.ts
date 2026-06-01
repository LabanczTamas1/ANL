import { createLogger } from './logger.js';
import * as userRepo from '../domains/user/repository/userRepository.js';

const logger = createLogger('admin', 'service');

export async function listAllUsers(): Promise<Record<string, unknown>[]> {
  try {
    const rows = await userRepo.findAll();
    const users = rows.map(userRepo.toApiUser);
    logger.info(`Listed ${users.length} users`);
    return users;
  } catch (error) {
    logger.error({ err: error }, 'Error listing all users');
    return [];
  }
}
