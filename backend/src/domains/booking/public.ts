// ---------------------------------------------------------------------------
// Booking Domain — Public API
// ---------------------------------------------------------------------------
// Cross-domain consumers should import from this barrel instead of reaching
// into the repository internals directly.
// ---------------------------------------------------------------------------

import { bookingRepository, BookingRow } from './repository/bookingRepository.js';

// ─── Minimal DTOs ────────────────────────────────────────────────────────

/** Lightweight slot used by availability to filter out booked times. */
export interface BookedSlot {
  time: number;
}

/** Curated booking details exposed to admin-level views. */
export interface BookingDetail {
  id: string;
  time: number;
  fullName: string;
  company: string;
  email: string;
  referralSource: string;
  referralSourceOther: string | null;
  timezone: string;
  meetLink: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────

function toBookingDetail(row: BookingRow): BookingDetail {
  return {
    id: row.id,
    time: row.time,
    fullName: row.full_name,
    company: row.company,
    email: row.email,
    referralSource: row.referral_source,
    referralSourceOther: row.referral_source_other ?? null,
    timezone: row.timezone,
    meetLink: row.meet_link ?? null,
    status: row.status,
    notes: row.notes ?? null,
    createdAt: row.created_at,
  };
}

// ─── Public query functions ──────────────────────────────────────────────

/** Confirmed booked slots for a single date (minimal). */
export async function getBookedSlotsForDate(date: string): Promise<BookedSlot[]> {
  const rows = await bookingRepository.findByDate(date);
  return rows.map((r) => ({ time: r.time }));
}

/** Confirmed booked slots for a date range, grouped by date (minimal). */
export async function getBookedSlotsForDateRange(
  startDate: string,
  endDate: string,
): Promise<Map<string, BookedSlot[]>> {
  const rows = await bookingRepository.findByDateRange(startDate, endDate);
  const map = new Map<string, BookedSlot[]>();
  for (const r of rows) {
    const dateStr = typeof r.date === 'string' ? r.date.split('T')[0] : new Date(r.date).toISOString().split('T')[0];
    const slots = map.get(dateStr) ?? [];
    slots.push({ time: r.time });
    map.set(dateStr, slots);
  }
  return map;
}

/** Full booking details for a date range (for admin-level views). */
export async function getBookingDetailsForDateRange(
  startDate: string,
  endDate: string,
): Promise<Map<string, BookingDetail[]>> {
  const rows = await bookingRepository.findByDateRange(startDate, endDate);
  const map = new Map<string, BookingDetail[]>();
  for (const r of rows) {
    const dateStr = typeof r.date === 'string' ? r.date.split('T')[0] : new Date(r.date).toISOString().split('T')[0];
    const details = map.get(dateStr) ?? [];
    details.push(toBookingDetail(r));
    map.set(dateStr, details);
  }
  return map;
}
