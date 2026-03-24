import { createClient, RedisClientType } from 'redis';
import { env } from './env.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('config', 'infra');

let redisClient: RedisClientType | null = null;

export async function initializeRedisClient(): Promise<RedisClientType> {
  redisClient = createClient({ url: env.REDIS_URL }) as RedisClientType;

  redisClient.on('error', (err) => {
    logger.error({ err }, 'Redis Client Error');
  });

  redisClient.on('connect', () => {
    logger.info('Connected to Redis successfully');
  });

  try {
    await redisClient.connect();
    logger.info('Redis client initialized');
  } catch (err) {
    logger.error({ err }, 'Error during Redis initialization');
    throw err;
  }

  return redisClient;
}

export function getRedisClient(): RedisClientType {
  if (!redisClient) {
    throw new Error(
      'Redis client not initialized. Call initializeRedisClient first.',
    );
  }
  return redisClient;
}

export async function closeRedisClient(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis client closed');
  }
}
