// ---------------------------------------------------------------------------
// Finance Controller — multi-currency transaction ledger
// ---------------------------------------------------------------------------

import { Request, Response } from 'express';
import { getRedisClient } from '../../../config/database.js';
import { createLogger, logError } from '../../../utils/logger.js';
import {
  getExchangeRates,
  convertCurrency,
  isSupportedCurrency,
} from '../service/currencyService.js';
import crypto from 'crypto';

const logger = createLogger('finance', 'controller');

// ─── Key helpers ─────────────────────────────────────────────────────────────

const balanceKey = (userId: string) => `finance:balance:${userId}`;
const txKey = (txId: string) => `finance:tx:${txId}`;
const userTxsKey = (userId: string) => `finance:user:${userId}:txs`;

// ─── GET /balance/:userId ────────────────────────────────────────────────────

export async function getBalance(req: Request, res: Response): Promise<void> {
  try {
    const r = getRedisClient();
    const { userId } = req.params;

    const userExists = await r.exists(`user:${userId}`);
    if (!userExists) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const balance = await r.get(balanceKey(userId));
    res.status(200).json({ userId, balance: parseFloat(balance || '0') });
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
    const r = getRedisClient();
    const balances: Record<string, number> = {};

    let cursor = 0;
    do {
      const result = await r.scan(cursor, {
        MATCH: 'finance:balance:*',
        COUNT: 200,
      });
      cursor = result.cursor;

      for (const key of result.keys) {
        const userId = key.replace('finance:balance:', '');
        const val = await r.get(key);
        balances[userId] = parseFloat(val || '0');
      }
    } while (cursor !== 0);

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
    const r = getRedisClient();
    const { userId, amount, type, description, currency: inputCurrency } = req.body;

    // Validation
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

    // Currency validation (default RON)
    const originalCurrency = (inputCurrency || 'RON').toUpperCase();
    if (!isSupportedCurrency(originalCurrency)) {
      res.status(400).json({ error: `Unsupported currency: ${originalCurrency}` });
      return;
    }

    // Check target user exists
    const userExists = await r.exists(`user:${userId}`);
    if (!userExists) {
      res.status(404).json({ error: 'Target user not found' });
      return;
    }

    // Convert to RON if needed (balance is always stored in RON)
    let amountInRON = numericAmount;
    let exchangeRate = 1;
    if (originalCurrency !== 'RON') {
      const conversion = await convertCurrency(numericAmount, originalCurrency, 'RON');
      amountInRON = parseFloat(conversion.converted.toFixed(2));
      exchangeRate = conversion.rate;
    }

    // Get current balance (RON)
    const currentBalance = parseFloat(
      (await r.get(balanceKey(userId))) || '0',
    );

    // Calculate new balance
    const delta = type === 'credit' ? amountInRON : -amountInRON;
    const newBalance = parseFloat((currentBalance + delta).toFixed(2));

    // Get performer info
    const performer = req.user!;
    const performerName =
      [performer.firstName, performer.lastName].filter(Boolean).join(' ') ||
      performer.username ||
      performer.email;

    // Get target user info
    const targetUser = await r.hGetAll(`user:${userId}`);
    const targetName =
      [targetUser.firstName, targetUser.lastName].filter(Boolean).join(' ') ||
      targetUser.username ||
      targetUser.email;

    // Create transaction record
    const txId = crypto.randomUUID();
    const now = new Date().toISOString();

    const transaction = {
      id: txId,
      userId,
      userName: targetName,
      originalAmount: numericAmount.toFixed(2),
      originalCurrency,
      exchangeRate: exchangeRate.toFixed(6),
      amount: amountInRON.toFixed(2),
      currency: 'RON',
      type,
      description: description || '',
      performedBy: performer.id,
      performedByName: performerName,
      balanceBefore: currentBalance.toFixed(2),
      balanceAfter: newBalance.toFixed(2),
      createdAt: now,
    };

    // Atomic write
    const multi = r.multi();
    multi.set(balanceKey(userId), newBalance.toFixed(2));
    multi.hSet(txKey(txId), transaction);
    multi.zAdd(userTxsKey(userId), { score: Date.now(), value: txId });
    await multi.exec();

    logger.info(
      {
        txId, userId, type,
        originalAmount: numericAmount, originalCurrency,
        amountRON: amountInRON, exchangeRate,
        performedBy: performer.id,
      },
      'Transaction created',
    );

    res.status(201).json({
      message: 'Transaction recorded successfully',
      transaction: {
        ...transaction,
        originalAmount: numericAmount,
        amount: amountInRON,
        exchangeRate,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
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
    const r = getRedisClient();
    const { userId } = req.params;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));

    const userExists = await r.exists(`user:${userId}`);
    if (!userExists) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const total = await r.zCard(userTxsKey(userId));
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    // Get transaction IDs in reverse chronological order
    const txIds = await r.zRange(userTxsKey(userId), start, end, { REV: true });

    const transactions = [];
    for (const id of txIds) {
      const tx = await r.hGetAll(txKey(id));
      if (tx && tx.id) {
        transactions.push({
          ...tx,
          originalAmount: parseFloat(tx.originalAmount || tx.amount),
          originalCurrency: tx.originalCurrency || 'RON',
          exchangeRate: parseFloat(tx.exchangeRate || '1'),
          amount: parseFloat(tx.amount),
          balanceBefore: parseFloat(tx.balanceBefore),
          balanceAfter: parseFloat(tx.balanceAfter),
        });
      }
    }

    res.status(200).json({
      userId,
      page,
      limit,
      total,
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
