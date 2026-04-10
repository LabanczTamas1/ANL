import pg from 'pg';
import { env } from './env.js';
import { createLogger } from '../utils/logger.js';

const { Pool } = pg;
const logger = createLogger('config', 'infra');

let pool: pg.Pool | null = null;

export async function initializePostgresPool(): Promise<pg.Pool> {
  pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30_000,       // close idle connections after 30s
    connectionTimeoutMillis: 5_000,  // fail fast if can't connect in 5s
    allowExitOnIdle: false,
  });

  pool.on('error', (err) => {
    logger.error({ err }, 'Unexpected PostgreSQL pool error');
  });

  try {
    const client = await pool.connect();
    logger.info('Connected to PostgreSQL successfully');
    client.release();
  } catch (err) {
    logger.error({ err }, 'Error during PostgreSQL initialization');
    throw err;
  }

  return pool;
}

export function getPool(): pg.Pool {
  if (!pool) {
    throw new Error(
      'PostgreSQL pool not initialized. Call initializePostgresPool first.',
    );
  }
  return pool;
}

export async function closePostgresPool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('PostgreSQL pool closed');
  }
}
