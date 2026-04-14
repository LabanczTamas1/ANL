// ---------------------------------------------------------------------------
// Server bootstrap — DB, Redis, listen, graceful shutdown
// ---------------------------------------------------------------------------

import path from 'path';
import { fileURLToPath } from 'url';
import { runner } from 'node-pg-migrate';
import app from './app.js';
import { env } from './config/env.js';
import {
  initializeRedisClient,
  closeRedisClient,
} from './config/database.js';
import {
  initializePostgresPool,
  closePostgresPool,
} from './config/postgresql.js';
import { ensureAdminAccount } from './utils/ensureAdminAccount.js';
import { logger, logError } from './utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Works in both dev (src/) and prod (dist/) — migrations/ sits one level up from both
const migrationsDir = path.join(__dirname, '..', 'migrations');

async function bootstrap(): Promise<void> {
  try {
    // 1. Redis
    await initializeRedisClient();
    logger.info('Redis client initialized successfully');

    // 2. PostgreSQL
    await initializePostgresPool();
    logger.info('PostgreSQL pool initialized successfully');

    // 3. Run pending migrations (tracked in pgmigrations table)
    await runner({
      databaseUrl: env.DATABASE_URL,
      dir: migrationsDir,
      direction: 'up',
      migrationsTable: 'pgmigrations',
      log: (msg: string) => logger.info({ domain: 'migrations' }, msg),
    });
    logger.info('Database migrations applied successfully');

    // 4. Seed admin
    await ensureAdminAccount();
    logger.info('Admin account check completed');

    // 5. Start HTTP server
    const server = app.listen(env.PORT, () => {
      logger.info({ port: env.PORT }, `Server running at http://localhost:${env.PORT}`);
    });

    // ------------------------------------------------------------------
    // Graceful shutdown
    // ------------------------------------------------------------------
    const shutdown = async (signal: string) => {
      logger.info({ signal }, 'Shutdown signal received');

      server.close(async () => {
        logger.info('HTTP server closed');

        await closePostgresPool();
        await closeRedisClient();

        logger.info('All connections closed — exiting');
        process.exit(0);
      });

      // Force exit after 10s
      setTimeout(() => {
        logger.warn('Forced shutdown after timeout');
        process.exit(1);
      }, 10_000);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    logError(err, { phase: 'server_initialization' });
    process.exit(1);
  }
}

bootstrap();
