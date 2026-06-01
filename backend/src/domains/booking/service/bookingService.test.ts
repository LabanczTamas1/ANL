// ---------------------------------------------------------------------------
// Booking Service — Unit Tests (validation logic)
// ---------------------------------------------------------------------------

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock all external dependencies
vi.mock('../../../config/database.js', () => ({
  getRedisClient: () => ({
    get: vi.fn(),
    set: vi.fn(),
    hGetAll: vi.fn(() => ({})),
  }),
}));

vi.mock('../repository/bookingRepository.js', () => ({
  bookingRepository: {
    create: vi.fn(),
    findById: vi.fn(),
    findAll: vi.fn(),
  },
}));

vi.mock('../../../config/env.js', () => ({
  env: {
    SMTP_HOST: 'localhost',
    SMTP_USER: 'test',
    SMTP_PASS: 'test',
    FRONTEND_URL: 'http://localhost:3000',
  },
}));

vi.mock('../../../utils/timeHelpers.js', () => ({
  convertMinutesToTime: vi.fn((m: number) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`),
  getDayNameFromDateString: vi.fn(() => 'Monday'),
}));

vi.mock('../../../utils/availabilityHelpers.js', () => ({
  checkCustomAvailability: vi.fn(() => null),
}));

vi.mock('./googleCalendarService.js', () => ({
  googleCalendarService: {
    getAvailableSlots: vi.fn(() => []),
  },
}));

import { bookingService } from './bookingService.js';

describe('BookingService.validateBookingData', () => {
  const validate = (data: Record<string, any>) =>
    bookingService.validateBookingData(data);

  it('returns no errors for valid data', () => {
    const errors = validate({
      fullName: 'John Doe',
      email: 'john@example.com',
      company: 'Acme',
      referralSource: 'Google Search',
      date: '2025-07-01',
      time: 540,
    });

    expect(errors).toHaveLength(0);
  });

  it('requires fullName', () => {
    const errors = validate({
      email: 'john@example.com',
      company: 'Acme',
      referralSource: 'Google Search',
      date: '2025-07-01',
      time: 540,
    });

    expect(errors.some((e: string) => e.includes('Full name'))).toBe(true);
  });

  it('requires email', () => {
    const errors = validate({
      fullName: 'John',
      company: 'Acme',
      referralSource: 'Google Search',
      date: '2025-07-01',
      time: 540,
    });

    expect(errors.some((e: string) => e.includes('Email'))).toBe(true);
  });

  it('requires company', () => {
    const errors = validate({
      fullName: 'John',
      email: 'john@example.com',
      referralSource: 'Google Search',
      date: '2025-07-01',
      time: 540,
    });

    expect(errors.some((e: string) => e.includes('Company'))).toBe(true);
  });

  it('requires referralSource', () => {
    const errors = validate({
      fullName: 'John',
      email: 'john@example.com',
      company: 'Acme',
      date: '2025-07-01',
      time: 540,
    });

    expect(errors.some((e: string) => e.includes('hear about us'))).toBe(true);
  });

  it('requires date', () => {
    const errors = validate({
      fullName: 'John',
      email: 'john@example.com',
      company: 'Acme',
      referralSource: 'Google Search',
      time: 540,
    });

    expect(errors.some((e: string) => e.includes('Date'))).toBe(true);
  });

  it('requires time', () => {
    const errors = validate({
      fullName: 'John',
      email: 'john@example.com',
      company: 'Acme',
      referralSource: 'Google Search',
      date: '2025-07-01',
    });

    expect(errors.some((e: string) => e.includes('Time'))).toBe(true);
  });

  it('requires Other specification when referral is Other', () => {
    const errors = validate({
      fullName: 'John',
      email: 'john@example.com',
      company: 'Acme',
      referralSource: 'Other',
      date: '2025-07-01',
      time: 540,
    });

    expect(errors.some((e: string) => e.includes('specify'))).toBe(true);
  });

  it('passes when Other has specification', () => {
    const errors = validate({
      fullName: 'John',
      email: 'john@example.com',
      company: 'Acme',
      referralSource: 'Other',
      referralSourceOther: 'YouTube channel',
      date: '2025-07-01',
      time: 540,
    });

    expect(errors).toHaveLength(0);
  });

  it('rejects whitespace-only fields', () => {
    const errors = validate({
      fullName: '   ',
      email: '  ',
      company: '  ',
      referralSource: '  ',
      date: '2025-07-01',
      time: 540,
    });

    expect(errors.length).toBeGreaterThanOrEqual(4);
  });

  it('returns multiple errors at once', () => {
    const errors = validate({});

    expect(errors.length).toBeGreaterThanOrEqual(5);
  });
});
