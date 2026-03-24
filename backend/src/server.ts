// ---------------------------------------------------------------------------
// Server bootstrap — DB, Redis, listen, graceful shutdown
// ---------------------------------------------------------------------------

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
import { bookingRepository } from './domains/booking/repository/bookingRepository.js';
import { ensureAdminAccount } from './utils/ensureAdminAccount.js';
import { logger, logError } from './utils/logger.js';

async function bootstrap(): Promise<void> {
  try {
    // 1. Redis
    await initializeRedisClient();
    logger.info('Redis client initialized successfully');

    // 2. PostgreSQL
    await initializePostgresPool();
    logger.info('PostgreSQL pool initialized successfully');

    // 3. Ensure tables
    await bookingRepository.createTable();
    logger.info('Booking table ensured');

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
