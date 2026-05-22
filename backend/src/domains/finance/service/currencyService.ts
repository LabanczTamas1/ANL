// ---------------------------------------------------------------------------
// Currency Exchange Service — live rates with Redis caching
// ---------------------------------------------------------------------------

import { getRedisClient } from '../../../config/database.js';
import { createLogger, logError } from '../../../utils/logger.js';

const logger = createLogger('finance', 'service');

const SUPPORTED_CURRENCIES = ['RON', 'EUR', 'USD', 'GBP', 'HUF', 'CHF', 'PLN', 'CZK', 'SEK', 'NOK', 'DKK', 'BGN', 'HRK', 'TRY', 'JPY', 'CNY', 'AUD', 'CAD'] as const;
export type Currency = typeof SUPPORTED_CURRENCIES[number];

const CACHE_KEY = 'finance:exchange_rates';
const CACHE_TTL = 600; // 10 minutes

interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  fetchedAt: string;
}

/**
 * Fetch live exchange rates from exchangerate-api.com (base RON).
 * Results are cached in Redis for 10 minutes.
 */
export async function getExchangeRates(): Promise<ExchangeRates> {
  const r = getRedisClient();

  // Check cache first
  const cached = await r.get(CACHE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // corrupted cache, proceed to fetch
    }
  }

  // Fetch live rates
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/RON');
    if (!response.ok) throw new Error(`Exchange API returned ${response.status}`);

    const data = await response.json();

    const rates: ExchangeRates = {
      base: 'RON',
      rates: { RON: 1, ...data.rates },
      fetchedAt: new Date().toISOString(),
    };

    // Cache in Redis
    await r.set(CACHE_KEY, JSON.stringify(rates), { EX: CACHE_TTL });

    logger.info(
      { currencies: Object.keys(rates.rates).length },
      'Exchange rates fetched and cached',
    );

    return rates;
  } catch (error) {
    logError(error, { context: 'getExchangeRates' });

    // Return fallback with just RON if API is down
    return {
      base: 'RON',
      rates: { RON: 1 },
      fetchedAt: new Date().toISOString(),
    };
  }
}

/**
 * Convert an amount from one currency to another using live rates.
 */
export async function convertCurrency(
  amount: number,
  from: string,
  to: string,
): Promise<{ converted: number; rate: number }> {
  if (from.toUpperCase() === to.toUpperCase()) {
    return { converted: amount, rate: 1 };
  }

  const { rates } = await getExchangeRates();
  const fromUpper = from.toUpperCase();
  const toUpper = to.toUpperCase();

  // Convert: from -> RON -> to
  const fromRate = rates[fromUpper];
  const toRate = rates[toUpper];

  if (!fromRate || !toRate) {
    throw new Error(`Unsupported currency: ${!fromRate ? fromUpper : toUpper}`);
  }

  // amount in "from" currency -> RON -> "to" currency
  const amountInRON = amount / fromRate;
  const converted = amountInRON * toRate;
  const rate = toRate / fromRate;

  return {
    converted: parseFloat(converted.toFixed(4)),
    rate: parseFloat(rate.toFixed(6)),
  };
}

export function isSupportedCurrency(currency: string): boolean {
  return SUPPORTED_CURRENCIES.includes(currency.toUpperCase() as Currency);
}

export { SUPPORTED_CURRENCIES };
