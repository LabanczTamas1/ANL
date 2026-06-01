// ---------------------------------------------------------------------------
// Finance Controller — multi-currency transaction ledger (PostgreSQL)
// ---------------------------------------------------------------------------

import { Request, Response } from 'express';
import { createLogger, logError } from '../../../utils/logger.js';
import { query, queryOne, execute } from '../../../utils/db.js';
import * as userRepo from '../../user/repository/userRepository.js';
import {
  getExchangeRates,
  convertCurrency,
  isSupportedCurrency,
} from '../service/currencyService.js';
import {
  logPendingEvent,
  sendDuePaymentEmail,
} from '../service/pendingPaymentService.js';
import crypto from 'crypto';

const logger = createLogger('finance', 'controller');

// ─── GET /balance/:userId ────────────────────────────────────────────────────

export async function getBalance(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = req.params;

    const user = await userRepo.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const row = await queryOne<{ balance: string }>(
      `SELECT COALESCE(balance, 0) as balance FROM user_balances WHERE user_id = $1`,
      [userId],
    );

    res.status(200).json({ userId, balance: parseFloat(row?.balance || '0') });
  } catch (error) {
    logError(error, { context: 'getBalance' });
    res.status(500).json({ error: 'Internal server error' });
  }
}

// ─── GET /balances ───────────────────────────────────────────────────────────

export async function getAllBalances(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const rows = await query<{ user_id: string; balance: string }>(
      `SELECT user_id, balance FROM user_balances`,
    );

    const balances: Record<string, number> = {};
    for (const row of rows) {
      balances[row.user_id] = parseFloat(row.balance);
    }

    res.status(200).json({ balances });
  } catch (error) {
    logError(error, { context: 'getAllBalances' });
    res.status(500).json({ error: 'Internal server error' });
  }
}

// ─── POST /transaction ──────────────────────────────────────────────────────

export async function createTransaction(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { userId, amount, type, description, currency: inputCurrency } = req.body;

    if (!userId || amount === undefined || !type) {
      res.status(400).json({
        error: 'Missing required fields: userId, amount, type',
      });
      return;
    }

    if (!['credit', 'debit'].includes(type)) {
      res.status(400).json({ error: 'type must be "credit" or "debit"' });
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      res.status(400).json({ error: 'amount must be a positive number' });
      return;
    }

    const originalCurrency = (inputCurrency || 'RON').toUpperCase();
    if (!isSupportedCurrency(originalCurrency)) {
      res.status(400).json({ error: `Unsupported currency: ${originalCurrency}` });
      return;
    }

    const targetUser = await userRepo.findById(userId);
    if (!targetUser) {
      res.status(404).json({ error: 'Target user not found' });
      return;
    }

    // Convert to RON
    let amountInRON = numericAmount;
    let exchangeRate = 1;
    if (originalCurrency !== 'RON') {
      const conversion = await convertCurrency(numericAmount, originalCurrency, 'RON');
      amountInRON = parseFloat(conversion.converted.toFixed(2));
      exchangeRate = conversion.rate;
    }

    // Get current balance
    const balanceRow = await queryOne<{ balance: string }>(
      `SELECT COALESCE(balance, 0) as balance FROM user_balances WHERE user_id = $1`,
      [userId],
    );
    const currentBalance = parseFloat(balanceRow?.balance || '0');

    const delta = type === 'credit' ? amountInRON : -amountInRON;
    const newBalance = parseFloat((currentBalance + delta).toFixed(2));

    const performer = req.user!;
    const performerName =
      [performer.firstName, performer.lastName].filter(Boolean).join(' ') ||
      performer.username || performer.email;

    const targetName =
      `${targetUser.first_name} ${targetUser.last_name}`.trim() ||
      targetUser.username || targetUser.email;

    const txId = crypto.randomUUID();

    // Upsert balance + insert transaction
    await query(
      `INSERT INTO user_balances (user_id, balance) VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET balance = $2, updated_at = now()`,
      [userId, newBalance.toFixed(2)],
    );

    await query(
      `INSERT INTO finance_transactions (id, user_id, user_name, original_amount, original_currency, exchange_rate, amount, type, description, performed_by, performed_by_name, balance_before, balance_after)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        txId, userId, targetName,
        numericAmount.toFixed(2), originalCurrency, exchangeRate.toFixed(6),
        amountInRON.toFixed(2), type, description || '',
        performer.id, performerName,
        currentBalance.toFixed(2), newBalance.toFixed(2),
      ],
    );

    logger.info(
      { txId, userId, type, originalAmount: numericAmount, originalCurrency, amountRON: amountInRON, performedBy: performer.id },
      'Transaction created',
    );

    res.status(201).json({
      message: 'Transaction recorded successfully',
      transaction: {
        id: txId, userId, userName: targetName,
        originalAmount: numericAmount, originalCurrency, exchangeRate,
        amount: amountInRON, currency: 'RON', type,
        description: description || '',
        performedBy: performer.id, performedByName: performerName,
        balanceBefore: currentBalance, balanceAfter: newBalance,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logError(error, { context: 'createTransaction' });
    res.status(500).json({ error: 'Internal server error' });
  }
}

// ─── GET /history/:userId ───────────────────────────────────────────────────

export async function getTransactionHistory(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { userId } = req.params;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));

    const user = await userRepo.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const countRow = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM finance_transactions WHERE user_id = $1`,
      [userId],
    );
    const total = parseInt(countRow?.count || '0', 10);

    const offset = (page - 1) * limit;
    const rows = await query(
      `SELECT id, user_id as "userId", user_name as "userName",
              original_amount as "originalAmount", original_currency as "originalCurrency",
              exchange_rate as "exchangeRate", amount, type, description, event_type as "eventType",
              performed_by as "performedBy", performed_by_name as "performedByName",
              balance_before as "balanceBefore", balance_after as "balanceAfter",
              pending_id as "pendingId", created_at as "createdAt"
       FROM finance_transactions WHERE user_id = $1
       ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    );

    const transactions = rows.map((tx: any) => ({
      ...tx,
      originalAmount: parseFloat(tx.originalAmount),
      originalCurrency: tx.originalCurrency || 'RON',
      exchangeRate: parseFloat(tx.exchangeRate || '1'),
      amount: parseFloat(tx.amount),
      balanceBefore: parseFloat(tx.balanceBefore),
      balanceAfter: parseFloat(tx.balanceAfter),
    }));

    res.status(200).json({
      userId, page, limit, total,
      totalPages: Math.ceil(total / limit),
      transactions,
    });
  } catch (error) {
    logError(error, { context: 'getTransactionHistory' });
    res.status(500).json({ error: 'Internal server error' });
  }
}

// ─── GET /rates ─────────────────────────────────────────────────────────────

export async function getRates(_req: Request, res: Response): Promise<void> {
  try {
    const rates = await getExchangeRates();
    res.status(200).json(rates);
  } catch (error) {
    logError(error, { context: 'getRates' });
    res.status(500).json({ error: 'Internal server error' });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PENDING (EXPECTED) PAYMENTS
// ═══════════════════════════════════════════════════════════════════════════

// ─── POST /pending ──────────────────────────────────────────────────────────

export async function createPendingPayment(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { userId, amount, currency: inputCurrency, description, dueDate } = req.body;

    if (!userId || amount === undefined || !dueDate) {
      res.status(400).json({
        error: 'Missing required fields: userId, amount, dueDate',
      });
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      res.status(400).json({ error: 'amount must be a positive number' });
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      res.status(400).json({ error: 'dueDate must be in YYYY-MM-DD format' });
      return;
    }

    const originalCurrency = (inputCurrency || 'RON').toUpperCase();
    if (!isSupportedCurrency(originalCurrency)) {
      res.status(400).json({ error: `Unsupported currency: ${originalCurrency}` });
      return;
    }

    const targetUser = await userRepo.findById(userId);
    if (!targetUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    let amountInRON = numericAmount;
    let exchangeRate = 1;
    if (originalCurrency !== 'RON') {
      const conversion = await convertCurrency(numericAmount, originalCurrency, 'RON');
      amountInRON = parseFloat(conversion.converted.toFixed(2));
      exchangeRate = conversion.rate;
    }

    const targetName =
      `${targetUser.first_name} ${targetUser.last_name}`.trim() ||
      targetUser.username || targetUser.email;

    const performer = req.user!;
    const performerName =
      [performer.firstName, performer.lastName].filter(Boolean).join(' ') ||
      performer.username || performer.email;

    const pendingId = crypto.randomUUID();

    await query(
      `INSERT INTO pending_payments (id, user_id, user_name, original_amount, original_currency, exchange_rate, amount_in_ron, description, due_date, created_by, created_by_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        pendingId, userId, targetName,
        numericAmount.toFixed(2), originalCurrency, exchangeRate.toFixed(6),
        amountInRON.toFixed(2), description || '', dueDate,
        performer.id, performerName,
      ],
    );

    await logPendingEvent(userId, pendingId, 'expected_payment_created',
      `Expected payment of ${numericAmount.toFixed(2)} ${originalCurrency} created, due ${dueDate}. ${description || ''}`);

    logger.info({ pendingId, userId, amount: numericAmount, currency: originalCurrency, dueDate },
      'Pending payment created');

    res.status(201).json({
      message: 'Expected payment created',
      pendingPayment: {
        id: pendingId, userId, userName: targetName,
        originalAmount: numericAmount, originalCurrency, exchangeRate,
        amountRON: amountInRON, description: description || '',
        dueDate, status: 'pending',
        createdBy: performer.id, createdByName: performerName,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logError(error, { context: 'createPendingPayment' });
    res.status(500).json({ error: 'Internal server error' });
  }
}

// ─── GET /pending/:userId ───────────────────────────────────────────────────

export async function getUserPendingPayments(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { userId } = req.params;

    const rows = await query(
      `SELECT id, user_id as "userId", user_name as "userName",
              original_amount as "originalAmount", original_currency as "originalCurrency",
              exchange_rate as "exchangeRate", amount_in_ron as "amountRON",
              description, due_date as "dueDate", status, notified,
              created_by as "createdBy", created_by_name as "createdByName",
              created_at as "createdAt", resolved_at as "resolvedAt",
              resolved_by as "resolvedBy", resolved_by_name as "resolvedByName"
       FROM pending_payments WHERE user_id = $1 ORDER BY due_date ASC`,
      [userId],
    );

    const payments = rows.map((p: any) => ({
      ...p,
      originalAmount: parseFloat(p.originalAmount),
      amountRON: parseFloat(p.amountRON),
      exchangeRate: parseFloat(p.exchangeRate),
    }));

    res.status(200).json({ userId, payments });
  } catch (error) {
    logError(error, { context: 'getUserPendingPayments' });
    res.status(500).json({ error: 'Internal server error' });
  }
}

// ─── GET /pending ───────────────────────────────────────────────────────────

export async function getAllPendingPayments(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const rows = await query(
      `SELECT id, user_id as "userId", user_name as "userName",
              original_amount as "originalAmount", original_currency as "originalCurrency",
              exchange_rate as "exchangeRate", amount_in_ron as "amountRON",
              description, due_date as "dueDate", status, notified,
              created_by as "createdBy", created_by_name as "createdByName",
              created_at as "createdAt"
       FROM pending_payments ORDER BY due_date ASC`,
    );

    const payments = rows.map((p: any) => ({
      ...p,
      originalAmount: parseFloat(p.originalAmount),
      amountRON: parseFloat(p.amountRON),
      exchangeRate: parseFloat(p.exchangeRate),
    }));

    res.status(200).json({ payments });
  } catch (error) {
    logError(error, { context: 'getAllPendingPayments' });
    res.status(500).json({ error: 'Internal server error' });
  }
}

// ─── POST /pending/:pendingId/confirm ───────────────────────────────────────

export async function confirmPendingPayment(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { pendingId } = req.params;

    const pending = await queryOne<any>(
      `SELECT * FROM pending_payments WHERE id = $1`,
      [pendingId],
    );
    if (!pending) {
      res.status(404).json({ error: 'Pending payment not found' });
      return;
    }

    if (pending.status !== 'pending') {
      res.status(400).json({ error: `Payment already ${pending.status}` });
      return;
    }

    const performer = req.user!;
    const performerName =
      [performer.firstName, performer.lastName].filter(Boolean).join(' ') ||
      performer.username || performer.email;

    const originalAmount = parseFloat(pending.original_amount);
    const originalCurrency = pending.original_currency;
    let amountInRON = originalAmount;
    let currentExchangeRate = 1;

    if (originalCurrency !== 'RON') {
      const conversion = await convertCurrency(originalAmount, originalCurrency, 'RON');
      amountInRON = parseFloat(conversion.converted.toFixed(2));
      currentExchangeRate = conversion.rate;
    }

    // Get current balance
    const balanceRow = await queryOne<{ balance: string }>(
      `SELECT COALESCE(balance, 0) as balance FROM user_balances WHERE user_id = $1`,
      [pending.user_id],
    );
    const currentBalance = parseFloat(balanceRow?.balance || '0');
    const newBalance = parseFloat((currentBalance + amountInRON).toFixed(2));

    const targetUser = await userRepo.findById(pending.user_id);
    const targetName =
      targetUser
        ? (`${targetUser.first_name} ${targetUser.last_name}`.trim() || targetUser.username || targetUser.email)
        : pending.user_name;

    const txId = crypto.randomUUID();
    const now = new Date().toISOString();

    // Upsert balance
    await query(
      `INSERT INTO user_balances (user_id, balance) VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET balance = $2, updated_at = now()`,
      [pending.user_id, newBalance.toFixed(2)],
    );

    // Insert transaction
    await query(
      `INSERT INTO finance_transactions (id, user_id, user_name, original_amount, original_currency, exchange_rate, amount, type, description, performed_by, performed_by_name, balance_before, balance_after, pending_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'credit', $8, $9, $10, $11, $12, $13)`,
      [
        txId, pending.user_id, targetName,
        originalAmount.toFixed(2), originalCurrency, currentExchangeRate.toFixed(6),
        amountInRON.toFixed(2),
        `[Expected Payment Confirmed] ${pending.description || ''}`.trim(),
        performer.id, performerName,
        currentBalance.toFixed(2), newBalance.toFixed(2), pendingId,
      ],
    );

    // Update pending status
    await execute(
      `UPDATE pending_payments SET status = 'confirmed', resolved_at = now(), resolved_by = $1, resolved_by_name = $2 WHERE id = $3`,
      [performer.id, performerName, pendingId],
    );

    await logPendingEvent(pending.user_id, pendingId, 'payment_confirmed',
      `Expected payment of ${originalAmount.toFixed(2)} ${originalCurrency} confirmed by ${performerName}. ${amountInRON.toFixed(2)} RON credited.`);

    logger.info({ pendingId, userId: pending.user_id, amountRON: amountInRON, confirmedBy: performer.id },
      'Pending payment confirmed and credited');

    res.status(200).json({
      message: 'Payment confirmed and credited',
      transaction: {
        id: txId, userId: pending.user_id, userName: targetName,
        originalAmount, originalCurrency, exchangeRate: currentExchangeRate,
        amount: amountInRON, currency: 'RON', type: 'credit',
        description: `[Expected Payment Confirmed] ${pending.description || ''}`.trim(),
        performedBy: performer.id, performedByName: performerName,
        balanceBefore: currentBalance, balanceAfter: newBalance,
        pendingId, createdAt: now,
      },
    });
  } catch (error) {
    logError(error, { context: 'confirmPendingPayment' });
    res.status(500).json({ error: 'Internal server error' });
  }
}

// ─── POST /pending/:pendingId/reject ────────────────────────────────────────

export async function rejectPendingPayment(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { pendingId } = req.params;
    const { reason } = req.body;

    const pending = await queryOne<any>(
      `SELECT * FROM pending_payments WHERE id = $1`,
      [pendingId],
    );
    if (!pending) {
      res.status(404).json({ error: 'Pending payment not found' });
      return;
    }

    if (pending.status !== 'pending') {
      res.status(400).json({ error: `Payment already ${pending.status}` });
      return;
    }

    const performer = req.user!;
    const performerName =
      [performer.firstName, performer.lastName].filter(Boolean).join(' ') ||
      performer.username || performer.email;

    await execute(
      `UPDATE pending_payments SET status = 'rejected', resolved_at = now(), resolved_by = $1, resolved_by_name = $2 WHERE id = $3`,
      [performer.id, performerName, pendingId],
    );

    await logPendingEvent(pending.user_id, pendingId, 'payment_rejected',
      `Expected payment of ${pending.original_amount} ${pending.original_currency} rejected by ${performerName}. ${reason ? `Reason: ${reason}` : 'No reason provided.'}`);

    logger.info({ pendingId, userId: pending.user_id, rejectedBy: performer.id },
      'Pending payment rejected');

    res.status(200).json({ message: 'Payment rejected', pendingId });
  } catch (error) {
    logError(error, { context: 'rejectPendingPayment' });
    res.status(500).json({ error: 'Internal server error' });
  }
}
