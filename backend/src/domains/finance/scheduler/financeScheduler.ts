// ---------------------------------------------------------------------------
// Finance Scheduler — periodic checks for due pending payments
// ---------------------------------------------------------------------------

import cron from 'node-cron';
import { checkDuePayments } from '../service/pendingPaymentService.js';
import { createLogger } from '../../../utils/logger.js';

const logger = createLogger('finance', 'infra');

let task: cron.ScheduledTask | null = null;

/**
 * Start the finance scheduler.
 * Runs every day at 08:00 to check for due pending payments and send emails.
 */
export function startFinanceScheduler(): void {
  if (task) return; // already started

  // Run daily at 08:00
  task = cron.schedule('0 8 * * *', async () => {
    logger.info('Running daily due-payment check…');
    await checkDuePayments();
    logger.info('Due-payment check complete');
  });

  logger.info('Finance scheduler started (daily at 08:00)');
}

/**
 * Stop the finance scheduler (for graceful shutdown).
 */
export function stopFinanceScheduler(): void {
  if (task) {
    task.stop();
    task = null;
    logger.info('Finance scheduler stopped');
  }
}
