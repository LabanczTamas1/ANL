// ---------------------------------------------------------------------------
// Currency Service — Unit Tests
// ---------------------------------------------------------------------------

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Redis client
const mockRedis = {
  get: vi.fn(),
  set: vi.fn(),
};
vi.mock('../../../config/database.js', () => ({
  getRedisClient: () => mockRedis,
}));

// Mock fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

import {
  getExchangeRates,
  convertCurrency,
  isSupportedCurrency,
  SUPPORTED_CURRENCIES,
} from './currencyService.js';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('isSupportedCurrency', () => {
  it('returns true for RON', () => {
    expect(isSupportedCurrency('RON')).toBe(true);
  });

  it('returns true for EUR (case insensitive)', () => {
    expect(isSupportedCurrency('eur')).toBe(true);
  });

  it('returns false for unsupported currency', () => {
    expect(isSupportedCurrency('DOGE')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isSupportedCurrency('')).toBe(false);
  });

  it('supports all declared currencies', () => {
    for (const currency of SUPPORTED_CURRENCIES) {
      expect(isSupportedCurrency(currency)).toBe(true);
    }
  });
});

describe('getExchangeRates', () => {
  it('returns cached rates when available', async () => {
    const cached = JSON.stringify({
      base: 'RON',
      rates: { RON: 1, EUR: 0.2 },
      fetchedAt: '2025-06-01T00:00:00Z',
    });
    mockRedis.get.mockResolvedValue(cached);

    const rates = await getExchangeRates();

    expect(rates.base).toBe('RON');
    expect(rates.rates.EUR).toBe(0.2);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('fetches from API when cache is empty', async () => {
    mockRedis.get.mockResolvedValue(null);
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          base: 'RON',
          rates: { EUR: 0.2, USD: 0.22 },
        }),
    });

    const rates = await getExchangeRates();

    expect(mockFetch).toHaveBeenCalledOnce();
    expect(rates.base).toBe('RON');
    expect(rates.rates.EUR).toBe(0.2);
    expect(mockRedis.set).toHaveBeenCalled();
  });

  it('returns fallback when API fails', async () => {
    mockRedis.get.mockResolvedValue(null);
    mockFetch.mockRejectedValue(new Error('Network error'));

    const rates = await getExchangeRates();

    expect(rates.base).toBe('RON');
    expect(rates.rates.RON).toBe(1);
    expect(Object.keys(rates.rates)).toHaveLength(1);
  });

  it('returns fallback when API returns non-ok status', async () => {
    mockRedis.get.mockResolvedValue(null);
    mockFetch.mockResolvedValue({
      ok: false,
      status: 429,
    });

    const rates = await getExchangeRates();

    expect(rates.rates.RON).toBe(1);
  });

  it('handles corrupted cache gracefully', async () => {
    mockRedis.get.mockResolvedValue('not-valid-json{{{');
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ rates: { EUR: 0.2 } }),
    });

    const rates = await getExchangeRates();

    // Should have fetched from API after corrupted cache
    expect(mockFetch).toHaveBeenCalled();
  });
});

describe('convertCurrency', () => {
  beforeEach(() => {
    // Set up cached rates for conversion tests
    mockRedis.get.mockResolvedValue(
      JSON.stringify({
        base: 'RON',
        rates: { RON: 1, EUR: 0.2, USD: 0.22, GBP: 0.17 },
        fetchedAt: '2025-06-01T00:00:00Z',
      }),
    );
  });

  it('returns same amount when from === to', async () => {
    const result = await convertCurrency(100, 'RON', 'RON');

    expect(result.converted).toBe(100);
    expect(result.rate).toBe(1);
  });

  it('converts RON to EUR', async () => {
    const result = await convertCurrency(100, 'RON', 'EUR');

    // 100 RON / 1 (RON rate) * 0.2 (EUR rate) = 20
    expect(result.converted).toBe(20);
    expect(result.rate).toBe(0.2);
  });

  it('converts EUR to RON', async () => {
    const result = await convertCurrency(100, 'EUR', 'RON');

    // 100 / 0.2 * 1 = 500
    expect(result.converted).toBe(500);
    expect(result.rate).toBe(5);
  });

  it('converts EUR to USD (cross-rate)', async () => {
    const result = await convertCurrency(100, 'EUR', 'USD');

    // 100 / 0.2 (to RON) * 0.22 (to USD) = 110
    expect(result.converted).toBe(110);
  });

  it('is case insensitive', async () => {
    const result = await convertCurrency(100, 'eur', 'ron');

    expect(result.converted).toBe(500);
  });

  it('throws for unsupported source currency', async () => {
    await expect(convertCurrency(100, 'DOGE', 'RON')).rejects.toThrow(
      /Unsupported currency/,
    );
  });

  it('throws for unsupported target currency', async () => {
    await expect(convertCurrency(100, 'RON', 'BTC')).rejects.toThrow(
      /Unsupported currency/,
    );
  });
});
