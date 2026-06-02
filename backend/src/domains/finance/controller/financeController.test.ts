// ---------------------------------------------------------------------------
// Finance Controller — Unit Tests
// ---------------------------------------------------------------------------

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  mockRequest,
  mockResponse,
  testUserRow,
} from '../../../__tests__/helpers.js';
// path: src/domains/finance/controller/ → ../../../ = src/

// Mock db module
vi.mock('../../../utils/db.js', () => ({
  query: vi.fn(),
  queryOne: vi.fn(),
  execute: vi.fn(),
}));

// Mock user repository
vi.mock('../../user/repository/userRepository.js', () => ({
  findById: vi.fn(),
}));

// Mock currency service
vi.mock('../service/currencyService.js', () => ({
  getExchangeRates: vi.fn(),
  convertCurrency: vi.fn(),
  isSupportedCurrency: vi.fn(),
}));

// Mock pending payment service
vi.mock('../service/pendingPaymentService.js', () => ({
  logPendingEvent: vi.fn(),
  sendDuePaymentEmail: vi.fn(),
}));

import {
  getBalance,
  getAllBalances,
  createTransaction,
  getTransactionHistory,
  getRates,
  createPendingPayment,
  getUserPendingPayments,
  getAllPendingPayments,
  confirmPendingPayment,
  rejectPendingPayment,
} from './financeController.js';

import { query, queryOne, execute } from '../../../utils/db.js';
import * as userRepo from '../../user/public.js';
import {
  getExchangeRates,
  convertCurrency,
  isSupportedCurrency,
} from '../service/currencyService.js';
import { logPendingEvent } from '../service/pendingPaymentService.js';

const mockQuery = vi.mocked(query);
const mockQueryOne = vi.mocked(queryOne);
const mockExecute = vi.mocked(execute);
const mockFindById = vi.mocked(userRepo.findById);
const mockIsSupportedCurrency = vi.mocked(isSupportedCurrency);
const mockConvertCurrency = vi.mocked(convertCurrency);
const mockGetExchangeRates = vi.mocked(getExchangeRates);
const mockLogPendingEvent = vi.mocked(logPendingEvent);

beforeEach(() => {
  vi.clearAllMocks();
});

// ═══════════════════════════════════════════════════════════════════════════
// GET /balance/:userId
// ═══════════════════════════════════════════════════════════════════════════

describe('getBalance', () => {
  it('returns 404 when user not found', async () => {
    mockFindById.mockResolvedValue(null);
    const req = mockRequest({ params: { userId: 'no-one' } });
    const res = mockResponse();

    await getBalance(req, res);

    expect(res._status).toBe(404);
    expect(res._json).toEqual({ error: 'User not found' });
  });

  it('returns balance for existing user', async () => {
    mockFindById.mockResolvedValue(testUserRow as any);
    mockQueryOne.mockResolvedValue({ balance: '150.50' } as any);
    const req = mockRequest({ params: { userId: 'user-123' } });
    const res = mockResponse();

    await getBalance(req, res);

    expect(res._status).toBe(200);
    expect(res._json).toEqual({ userId: 'user-123', balance: 150.5 });
  });

  it('returns 0 when no balance row exists', async () => {
    mockFindById.mockResolvedValue(testUserRow as any);
    mockQueryOne.mockResolvedValue(null);
    const req = mockRequest({ params: { userId: 'user-123' } });
    const res = mockResponse();

    await getBalance(req, res);

    expect(res._status).toBe(200);
    expect(res._json).toEqual({ userId: 'user-123', balance: 0 });
  });

  it('returns 500 on database error', async () => {
    mockFindById.mockRejectedValue(new Error('DB down'));
    const req = mockRequest({ params: { userId: 'user-123' } });
    const res = mockResponse();

    await getBalance(req, res);

    expect(res._status).toBe(500);
    expect(res._json).toEqual({ error: 'Internal server error' });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// GET /balances
// ═══════════════════════════════════════════════════════════════════════════

describe('getAllBalances', () => {
  it('returns all user balances', async () => {
    mockQuery.mockResolvedValue([
      { user_id: 'u1', balance: '100.00' },
      { user_id: 'u2', balance: '250.75' },
    ] as any);

    const req = mockRequest();
    const res = mockResponse();

    await getAllBalances(req, res);

    expect(res._status).toBe(200);
    expect(res._json).toEqual({
      balances: { u1: 100, u2: 250.75 },
    });
  });

  it('returns empty balances when none exist', async () => {
    mockQuery.mockResolvedValue([]);
    const req = mockRequest();
    const res = mockResponse();

    await getAllBalances(req, res);

    expect(res._status).toBe(200);
    expect(res._json).toEqual({ balances: {} });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// POST /transaction
// ═══════════════════════════════════════════════════════════════════════════

describe('createTransaction', () => {
  const validBody = {
    userId: 'user-123',
    amount: 100,
    type: 'credit',
    description: 'Test payment',
    currency: 'RON',
  };

  it('returns 400 when required fields are missing', async () => {
    const req = mockRequest({ body: { userId: 'user-123' } });
    const res = mockResponse();

    await createTransaction(req, res);

    expect(res._status).toBe(400);
    expect(res._json.error).toMatch(/Missing required fields/);
  });

  it('returns 400 for invalid type', async () => {
    const req = mockRequest({
      body: { ...validBody, type: 'refund' },
    });
    const res = mockResponse();

    await createTransaction(req, res);

    expect(res._status).toBe(400);
    expect(res._json.error).toMatch(/type must be/);
  });

  it('returns 400 for non-positive amount', async () => {
    const req = mockRequest({
      body: { ...validBody, amount: -5 },
    });
    const res = mockResponse();

    await createTransaction(req, res);

    expect(res._status).toBe(400);
    expect(res._json.error).toMatch(/positive number/);
  });

  it('returns 400 for zero amount', async () => {
    const req = mockRequest({
      body: { ...validBody, amount: 0 },
    });
    const res = mockResponse();

    await createTransaction(req, res);

    expect(res._status).toBe(400);
    expect(res._json.error).toMatch(/positive number/);
  });

  it('returns 400 for unsupported currency', async () => {
    mockIsSupportedCurrency.mockReturnValue(false);
    const req = mockRequest({
      body: { ...validBody, currency: 'XYZ' },
    });
    const res = mockResponse();

    await createTransaction(req, res);

    expect(res._status).toBe(400);
    expect(res._json.error).toMatch(/Unsupported currency/);
  });

  it('returns 404 when target user not found', async () => {
    mockIsSupportedCurrency.mockReturnValue(true);
    mockFindById.mockResolvedValue(null);
    const req = mockRequest({ body: validBody });
    const res = mockResponse();

    await createTransaction(req, res);

    expect(res._status).toBe(404);
    expect(res._json.error).toBe('Target user not found');
  });

  it('creates a credit transaction in RON', async () => {
    mockIsSupportedCurrency.mockReturnValue(true);
    mockFindById.mockResolvedValue(testUserRow as any);
    mockQueryOne.mockResolvedValue({ balance: '200.00' } as any);
    mockQuery.mockResolvedValue([]);

    const req = mockRequest({ body: validBody });
    const res = mockResponse();

    await createTransaction(req, res);

    expect(res._status).toBe(201);
    expect(res._json.transaction.amount).toBe(100);
    expect(res._json.transaction.type).toBe('credit');
    expect(res._json.transaction.balanceBefore).toBe(200);
    expect(res._json.transaction.balanceAfter).toBe(300);
    expect(res._json.transaction.currency).toBe('RON');
  });

  it('creates a debit transaction with correct balance', async () => {
    mockIsSupportedCurrency.mockReturnValue(true);
    mockFindById.mockResolvedValue(testUserRow as any);
    mockQueryOne.mockResolvedValue({ balance: '500.00' } as any);
    mockQuery.mockResolvedValue([]);

    const req = mockRequest({
      body: { ...validBody, type: 'debit', amount: 150 },
    });
    const res = mockResponse();

    await createTransaction(req, res);

    expect(res._status).toBe(201);
    expect(res._json.transaction.balanceBefore).toBe(500);
    expect(res._json.transaction.balanceAfter).toBe(350);
    expect(res._json.transaction.type).toBe('debit');
  });

  it('converts foreign currency to RON', async () => {
    mockIsSupportedCurrency.mockReturnValue(true);
    mockFindById.mockResolvedValue(testUserRow as any);
    mockQueryOne.mockResolvedValue({ balance: '0' } as any);
    mockConvertCurrency.mockResolvedValue({ converted: 497.5, rate: 4.975 });
    mockQuery.mockResolvedValue([]);

    const req = mockRequest({
      body: { ...validBody, currency: 'EUR', amount: 100 },
    });
    const res = mockResponse();

    await createTransaction(req, res);

    expect(res._status).toBe(201);
    expect(mockConvertCurrency).toHaveBeenCalledWith(100, 'EUR', 'RON');
    expect(res._json.transaction.originalAmount).toBe(100);
    expect(res._json.transaction.originalCurrency).toBe('EUR');
    expect(res._json.transaction.amount).toBe(497.5);
    expect(res._json.transaction.exchangeRate).toBe(4.975);
  });

  it('defaults to RON when no currency specified', async () => {
    mockIsSupportedCurrency.mockReturnValue(true);
    mockFindById.mockResolvedValue(testUserRow as any);
    mockQueryOne.mockResolvedValue({ balance: '0' } as any);
    mockQuery.mockResolvedValue([]);

    const req = mockRequest({
      body: { userId: 'user-123', amount: 50, type: 'credit' },
    });
    const res = mockResponse();

    await createTransaction(req, res);

    expect(res._status).toBe(201);
    expect(res._json.transaction.originalCurrency).toBe('RON');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// GET /history/:userId
// ═══════════════════════════════════════════════════════════════════════════

describe('getTransactionHistory', () => {
  it('returns 404 when user not found', async () => {
    mockFindById.mockResolvedValue(null);
    const req = mockRequest({ params: { userId: 'none' } });
    const res = mockResponse();

    await getTransactionHistory(req, res);

    expect(res._status).toBe(404);
  });

  it('returns paginated transactions', async () => {
    mockFindById.mockResolvedValue(testUserRow as any);
    mockQueryOne.mockResolvedValue({ count: '2' } as any);
    mockQuery.mockResolvedValue([
      {
        id: 'tx-1',
        userId: 'user-123',
        userName: 'John Doe',
        originalAmount: '100.00',
        originalCurrency: 'RON',
        exchangeRate: '1',
        amount: '100.00',
        type: 'credit',
        description: 'Payment',
        eventType: null,
        performedBy: 'admin-1',
        performedByName: 'Admin',
        balanceBefore: '0.00',
        balanceAfter: '100.00',
        pendingId: null,
        createdAt: '2025-06-01T00:00:00Z',
      },
    ] as any);

    const req = mockRequest({
      params: { userId: 'user-123' },
      query: { page: '1', limit: '10' },
    });
    const res = mockResponse();

    await getTransactionHistory(req, res);

    expect(res._status).toBe(200);
    expect(res._json.total).toBe(2);
    expect(res._json.page).toBe(1);
    expect(res._json.limit).toBe(10);
    expect(res._json.transactions).toHaveLength(1);
    expect(res._json.transactions[0].amount).toBe(100);
  });

  it('clamps page and limit to valid ranges', async () => {
    mockFindById.mockResolvedValue(testUserRow as any);
    mockQueryOne.mockResolvedValue({ count: '0' } as any);
    mockQuery.mockResolvedValue([]);

    const req = mockRequest({
      params: { userId: 'user-123' },
      query: { page: '-5', limit: '999' },
    });
    const res = mockResponse();

    await getTransactionHistory(req, res);

    expect(res._status).toBe(200);
    expect(res._json.page).toBe(1);
    expect(res._json.limit).toBe(100);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// GET /rates
// ═══════════════════════════════════════════════════════════════════════════

describe('getRates', () => {
  it('returns exchange rates', async () => {
    const mockRates = {
      base: 'RON',
      rates: { RON: 1, EUR: 0.2 },
      fetchedAt: '2025-06-01T00:00:00Z',
    };
    mockGetExchangeRates.mockResolvedValue(mockRates);

    const req = mockRequest();
    const res = mockResponse();

    await getRates(req, res);

    expect(res._status).toBe(200);
    expect(res._json).toEqual(mockRates);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// POST /pending
// ═══════════════════════════════════════════════════════════════════════════

describe('createPendingPayment', () => {
  const validPending = {
    userId: 'user-123',
    amount: 200,
    currency: 'RON',
    description: 'Monthly payment',
    dueDate: '2025-07-01',
  };

  it('returns 400 when required fields are missing', async () => {
    const req = mockRequest({ body: { userId: 'user-123' } });
    const res = mockResponse();

    await createPendingPayment(req, res);

    expect(res._status).toBe(400);
  });

  it('returns 400 for non-positive amount', async () => {
    const req = mockRequest({
      body: { ...validPending, amount: -10 },
    });
    const res = mockResponse();

    await createPendingPayment(req, res);

    expect(res._status).toBe(400);
    expect(res._json.error).toMatch(/positive number/);
  });

  it('returns 400 for invalid date format', async () => {
    const req = mockRequest({
      body: { ...validPending, dueDate: '01/07/2025' },
    });
    const res = mockResponse();

    await createPendingPayment(req, res);

    expect(res._status).toBe(400);
    expect(res._json.error).toMatch(/YYYY-MM-DD/);
  });

  it('returns 400 for unsupported currency', async () => {
    mockIsSupportedCurrency.mockReturnValue(false);
    const req = mockRequest({
      body: { ...validPending, currency: 'DOGE' },
    });
    const res = mockResponse();

    await createPendingPayment(req, res);

    expect(res._status).toBe(400);
    expect(res._json.error).toMatch(/Unsupported currency/);
  });

  it('returns 404 when user not found', async () => {
    mockIsSupportedCurrency.mockReturnValue(true);
    mockFindById.mockResolvedValue(null);
    const req = mockRequest({ body: validPending });
    const res = mockResponse();

    await createPendingPayment(req, res);

    expect(res._status).toBe(404);
  });

  it('creates a pending payment in RON', async () => {
    mockIsSupportedCurrency.mockReturnValue(true);
    mockFindById.mockResolvedValue(testUserRow as any);
    mockQuery.mockResolvedValue([]);

    const req = mockRequest({ body: validPending });
    const res = mockResponse();

    await createPendingPayment(req, res);

    expect(res._status).toBe(201);
    expect(res._json.pendingPayment.originalAmount).toBe(200);
    expect(res._json.pendingPayment.dueDate).toBe('2025-07-01');
    expect(res._json.pendingPayment.status).toBe('pending');
    expect(mockLogPendingEvent).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// POST /pending/:pendingId/confirm
// ═══════════════════════════════════════════════════════════════════════════

describe('confirmPendingPayment', () => {
  it('returns 404 when pending payment not found', async () => {
    mockQueryOne.mockResolvedValue(null);
    const req = mockRequest({ params: { pendingId: 'no-id' } });
    const res = mockResponse();

    await confirmPendingPayment(req, res);

    expect(res._status).toBe(404);
  });

  it('returns 400 when payment already resolved', async () => {
    mockQueryOne.mockResolvedValue({ status: 'confirmed' } as any);
    const req = mockRequest({ params: { pendingId: 'pp-1' } });
    const res = mockResponse();

    await confirmPendingPayment(req, res);

    expect(res._status).toBe(400);
    expect(res._json.error).toMatch(/already confirmed/);
  });

  it('confirms payment and credits balance', async () => {
    // First call: get pending payment, second: get balance
    mockQueryOne
      .mockResolvedValueOnce({
        id: 'pp-1',
        user_id: 'user-123',
        user_name: 'John Doe',
        original_amount: '200.00',
        original_currency: 'RON',
        exchange_rate: '1.000000',
        amount_in_ron: '200.00',
        description: 'Monthly',
        status: 'pending',
      } as any)
      .mockResolvedValueOnce({ balance: '100.00' } as any);

    mockFindById.mockResolvedValue(testUserRow as any);
    mockQuery.mockResolvedValue([]);
    mockExecute.mockResolvedValue(1);

    const req = mockRequest({ params: { pendingId: 'pp-1' } });
    const res = mockResponse();

    await confirmPendingPayment(req, res);

    expect(res._status).toBe(200);
    expect(res._json.transaction.type).toBe('credit');
    expect(res._json.transaction.balanceBefore).toBe(100);
    expect(res._json.transaction.balanceAfter).toBe(300);
    expect(mockLogPendingEvent).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// POST /pending/:pendingId/reject
// ═══════════════════════════════════════════════════════════════════════════

describe('rejectPendingPayment', () => {
  it('returns 404 when pending payment not found', async () => {
    mockQueryOne.mockResolvedValue(null);
    const req = mockRequest({ params: { pendingId: 'no-id' } });
    const res = mockResponse();

    await rejectPendingPayment(req, res);

    expect(res._status).toBe(404);
  });

  it('returns 400 when payment already resolved', async () => {
    mockQueryOne.mockResolvedValue({ status: 'rejected' } as any);
    const req = mockRequest({ params: { pendingId: 'pp-1' } });
    const res = mockResponse();

    await rejectPendingPayment(req, res);

    expect(res._status).toBe(400);
  });

  it('rejects payment with reason', async () => {
    mockQueryOne.mockResolvedValue({
      id: 'pp-1',
      user_id: 'user-123',
      original_amount: '100.00',
      original_currency: 'EUR',
      status: 'pending',
    } as any);
    mockExecute.mockResolvedValue(1);

    const req = mockRequest({
      params: { pendingId: 'pp-1' },
      body: { reason: 'Duplicate payment' },
    });
    const res = mockResponse();

    await rejectPendingPayment(req, res);

    expect(res._status).toBe(200);
    expect(res._json.pendingId).toBe('pp-1');
    expect(mockLogPendingEvent).toHaveBeenCalled();
  });
});
