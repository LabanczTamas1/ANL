// ---------------------------------------------------------------------------
// Availability Controller
// ---------------------------------------------------------------------------

import { Request, Response } from 'express';
import {
  timeToMinutes,
  getAvailableTimes,
  getUnavailableTimes,
  getDayNameFromDateString,
} from '../../../utils/timeHelpers.js';
import { checkCustomAvailability } from '../../../utils/availabilityHelpers.js';
import { bookingRepository } from '../../booking/repository/bookingRepository.js';
import { createLogger, logError } from '../../../utils/logger.js';
import { query, queryOne, execute } from '../../../utils/db.js';

const logger = createLogger('availability', 'controller');

export async function updateStandardAvailability(
  req: Request,
  res: Response,
): Promise<void> {
  const { availableTimes } = req.body;

  if (!Array.isArray(availableTimes)) {
    res.status(400).json({ error: 'Invalid input: availableTimes must be an array' });
    return;
  }

  try {
    for (const entry of availableTimes as { day: string; openingTime: string; closingTime: string; isDayOff: string }[]) {
      await execute(
        `UPDATE standard_availability
         SET opening_time = $1, closing_time = $2, is_day_off = $3, updated_at = now()
         WHERE day_name = $4`,
        [entry.openingTime, entry.closingTime, entry.isDayOff === 'true', entry.day],
      );
    }

    res.status(200).json({ message: 'Availability updated successfully' });
  } catch (error) {
    logError(error, { context: 'updateStandardAvailability' });
    res.status(500).json({ error: `Failed to update availability` });
  }
}

export async function getStandardAvailability(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const rows = await query(
      `SELECT day_name as day, opening_time as "openingTime", closing_time as "closingTime",
              is_day_off as "isDayOff"
       FROM standard_availability ORDER BY CASE day_name
         WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 WHEN 'Wednesday' THEN 3
         WHEN 'Thursday' THEN 4 WHEN 'Friday' THEN 5 WHEN 'Saturday' THEN 6
         WHEN 'Sunday' THEN 7 END`,
    );

    const result = rows.map((r: any) => ({
      ...r,
      isDayOff: String(r.isDayOff),
    }));

    res.status(200).json(result);
  } catch (error) {
    logError(error, { context: 'getStandardAvailability' });
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getAddAvailability(
  req: Request,
  res: Response,
): Promise<void> {
  const { rawDate } = req.params;

  try {
    const allTimes = getAvailableTimes(0, 1440, 60, 0);

    const addedRows = await query<{ time_minutes: number }>(
      `SELECT time_minutes FROM custom_availability WHERE date = $1 AND type = 'added'`,
      [rawDate],
    );
    const alreadyAdded = addedRows.map(r => r.time_minutes);
    const addableTimes = allTimes.filter((t) => !alreadyAdded.includes(t));

    res.status(200).json({ unavailableTimes: addableTimes });
  } catch (error) {
    logError(error, { context: 'getAddAvailability' });
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getDeleteAvailability(
  req: Request,
  res: Response,
): Promise<void> {
  const { rawDate } = req.params;

  try {
    const dayName = getDayNameFromDateString(rawDate);

    const avail = await queryOne<{ opening_time: string; closing_time: string; is_day_off: boolean }>(
      `SELECT opening_time, closing_time, is_day_off FROM standard_availability WHERE day_name = $1`,
      [dayName],
    );

    let standardTimes: number[] = [];
    if (avail && !avail.is_day_off) {
      const [openH, openM] = avail.opening_time.split(':').map(Number);
      const [closeH, closeM] = avail.closing_time.split(':').map(Number);
      for (let i = openH * 60 + openM; i < closeH * 60 + closeM; i += 60) {
        standardTimes.push(i);
      }
    }

    const customTimes = await checkCustomAvailability(rawDate, standardTimes, 'both');
    const timesAfterCustom = customTimes.length > 0 ? customTimes : standardTimes;

    const existingBookings = await bookingRepository.findByDate(rawDate);
    const bookedMinutes = new Set(existingBookings.map((b) => b.time));
    const availableTimes = timesAfterCustom
      .filter((t) => !bookedMinutes.has(t))
      .sort((a, b) => a - b);

    res.status(200).json({ availableTimes });
  } catch (error) {
    logError(error, { context: 'getDeleteAvailability' });
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function addAvailabilityToDb(
  req: Request,
  res: Response,
): Promise<void> {
  const { date, times } = req.body;

  if (!date || !Array.isArray(times) || times.length === 0) {
    res.status(400).json({ error: 'date and times array are required' });
    return;
  }

  try {
    for (const t of times as number[]) {
      await execute(
        `INSERT INTO custom_availability (date, time_minutes, type)
         VALUES ($1, $2, 'added') ON CONFLICT (date, time_minutes, type) DO NOTHING`,
        [date, t],
      );
    }

    res.status(200).json({ message: 'Availability added successfully' });
  } catch (err) {
    logError(err, { context: 'addAvailabilityToDb' });
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteAvailabilityFromDb(
  req: Request,
  res: Response,
): Promise<void> {
  const { date, times } = req.body;

  if (!date || !Array.isArray(times) || times.length === 0) {
    res.status(400).json({ error: 'date and times array are required' });
    return;
  }

  try {
    for (const t of times as number[]) {
      await execute(
        `INSERT INTO custom_availability (date, time_minutes, type)
         VALUES ($1, $2, 'deleted') ON CONFLICT (date, time_minutes, type) DO NOTHING`,
        [date, t],
      );
    }

    res.status(200).json({ message: 'Availability deleted successfully' });
  } catch (err) {
    logError(err, { context: 'deleteAvailabilityFromDb' });
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function showAvailableTimes(
  req: Request,
  res: Response,
): Promise<void> {
  const { rawDate } = req.params;

  try {
    const dayName = getDayNameFromDateString(rawDate);

    const avail = await queryOne<{ opening_time: string; closing_time: string; is_day_off: boolean }>(
      `SELECT opening_time, closing_time, is_day_off FROM standard_availability WHERE day_name = $1`,
      [dayName],
    );

    let standardTimes: number[] = [];

    if (avail && !avail.is_day_off) {
      const [openH, openM] = avail.opening_time.split(':').map(Number);
      const [closeH, closeM] = avail.closing_time.split(':').map(Number);
      for (let i = openH * 60 + openM; i < closeH * 60 + closeM; i += 60) {
        standardTimes.push(i);
      }
    }

    const customTimes = await checkCustomAvailability(rawDate, standardTimes, 'both');
    const timesAfterCustom = customTimes.length > 0 ? customTimes : standardTimes;

    const existingBookings = await bookingRepository.findByDate(rawDate);
    const bookedMinutes = new Set(existingBookings.map((b) => b.time));
    const finalAvailableTimes = timesAfterCustom.filter((t) => !bookedMinutes.has(t));

    const convertedTimes = finalAvailableTimes.map((minutes) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHour = hours % 12 === 0 ? 12 : hours % 12;
      return `${displayHour}:${mins.toString().padStart(2, '0')} ${ampm}`;
    });

    res.status(200).json({
      date: rawDate,
      availableTimes: convertedTimes,
      rawMinutes: finalAvailableTimes,
    });
  } catch (error) {
    logError(error, { context: 'showAvailableTimes' });
    res.status(500).json({ error: 'Internal server error' });
  }
}

// ---------------------------------------------------------------------------
// Admin — daily availability overview for a date range
// ---------------------------------------------------------------------------

/**
 * GET /admin-day-overview/:startDate/:endDate
 *
 * Returns, for every day in the range, the breakdown of:
 *  - standard availability hours
 *  - custom-added times
 *  - custom-deleted times
 *  - final effective hours
 *  - isDayOff flag
 */
export async function adminDayOverview(
  req: Request,
  res: Response,
): Promise<void> {
  const { startDate, endDate } = req.params;

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).json({ error: 'Invalid date range' });
      return;
    }

    const allBookings = await bookingRepository.findByDateRange(startDate, endDate);

    // Fetch all standard availability at once
    const stdRows = await query<{ day_name: string; opening_time: string; closing_time: string; is_day_off: boolean }>(
      `SELECT day_name, opening_time, closing_time, is_day_off FROM standard_availability`,
    );
    const stdMap = new Map(stdRows.map(r => [r.day_name, r]));

    // Fetch all custom availability in date range
    const customRows = await query<{ date: string; time_minutes: number; type: string }>(
      `SELECT date::text, time_minutes, type FROM custom_availability WHERE date >= $1 AND date <= $2`,
      [startDate, endDate],
    );

    const results: Array<Record<string, unknown>> = [];

    for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayName = getDayNameFromDateString(dateStr);
      const avail = stdMap.get(dayName);
      const isDayOff = !avail || avail.is_day_off;

      let standardTimes: number[] = [];
      if (!isDayOff && avail) {
        const [openH, openM] = avail.opening_time.split(':').map(Number);
        const [closeH, closeM] = avail.closing_time.split(':').map(Number);
        for (let i = openH * 60 + openM; i < closeH * 60 + closeM; i += 60) standardTimes.push(i);
      }

      const addedTimes = customRows.filter(r => r.date === dateStr && r.type === 'added').map(r => r.time_minutes);
      const deletedTimes = customRows.filter(r => r.date === dateStr && r.type === 'deleted').map(r => r.time_minutes);

      const dayBookings = allBookings
        .filter((b) => {
          const bDate = typeof b.date === 'string' ? b.date.split('T')[0] : new Date(b.date).toISOString().split('T')[0];
          return bDate === dateStr;
        })
        .map((b) => ({
          id: b.id, time: b.time, fullName: b.full_name, company: b.company,
          email: b.email, referralSource: b.referral_source,
          referralSourceOther: b.referral_source_other ?? null, timezone: b.timezone,
          meetLink: b.meet_link ?? null, status: b.status, notes: b.notes ?? null,
          createdAt: b.created_at,
        }));
      const bookedTimes = dayBookings.map((b) => b.time);

      const allSet = new Set([...standardTimes, ...addedTimes]);
      const effectiveTimes = [...allSet]
        .filter((t) => !deletedTimes.includes(t) && !bookedTimes.includes(t))
        .sort((a, b) => a - b);

      results.push({
        date: dateStr, dayName, isDayOff, standardTimes, addedTimes, deletedTimes,
        bookedMeetings: dayBookings, effectiveTimes, totalHours: effectiveTimes.length,
      });
    }

    res.status(200).json(results);
  } catch (error) {
    logError(error, { context: 'adminDayOverview' });
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function removeAddedTime(req: Request, res: Response): Promise<void> {
  const { date, times } = req.body;
  if (!date || !Array.isArray(times) || times.length === 0) {
    res.status(400).json({ error: 'date and times array are required' });
    return;
  }
  try {
    for (const t of times as number[]) {
      await execute(
        `DELETE FROM custom_availability WHERE date = $1 AND time_minutes = $2 AND type = 'added'`,
        [date, t],
      );
    }
    res.status(200).json({ message: 'Added time(s) removed successfully' });
  } catch (err) {
    logError(err, { context: 'removeAddedTime' });
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function removeDeletedTime(req: Request, res: Response): Promise<void> {
  const { date, times } = req.body;
  if (!date || !Array.isArray(times) || times.length === 0) {
    res.status(400).json({ error: 'date and times array are required' });
    return;
  }
  try {
    for (const t of times as number[]) {
      await execute(
        `DELETE FROM custom_availability WHERE date = $1 AND time_minutes = $2 AND type = 'deleted'`,
        [date, t],
      );
    }
    res.status(200).json({ message: 'Deleted time(s) restored successfully' });
  } catch (err) {
    logError(err, { context: 'removeDeletedTime' });
    res.status(500).json({ error: 'Internal server error' });
  }
}
