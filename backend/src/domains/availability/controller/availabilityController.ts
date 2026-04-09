// ---------------------------------------------------------------------------
// Availability Controller
// ---------------------------------------------------------------------------

import { Request, Response } from 'express';
import { getRedisClient } from '../../../config/database.js';
import {
  timeToMinutes,
  getAvailableTimes,
  getUnavailableTimes,
  getDayNameFromDateString,
} from '../../../utils/timeHelpers.js';
import { checkCustomAvailability } from '../../../utils/availabilityHelpers.js';
import { bookingRepository } from '../../booking/repository/bookingRepository.js';
import { createLogger, logError } from '../../../utils/logger.js';

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
    const r = getRedisClient();
    await Promise.all(
      availableTimes.map(
        (entry: {
          day: string;
          openingTime: string;
          closingTime: string;
          isDayOff: string;
        }) =>
          r.hSet(`StandardAvailability:${entry.day}`, {
            Day: entry.day,
            OpeningTime: entry.openingTime,
            ClosingTime: entry.closingTime,
            IsDayOff: entry.isDayOff,
          }),
      ),
    );

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
  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday',
    'Friday', 'Saturday', 'Sunday',
  ];

  try {
    const r = getRedisClient();
    const standardAvailability = await Promise.all(
      daysOfWeek.map(async (day) => {
        const a = await r.hGetAll(`StandardAvailability:${day}`);
        return {
          day,
          openingTime: a.OpeningTime || '09:00',
          closingTime: a.ClosingTime || '17:00',
          isDayOff: a.IsDayOff || 'false',
        };
      }),
    );

    res.status(200).json(standardAvailability);
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
    const r = getRedisClient();

    // All 24h slots (every hour) are potentially addable as custom times,
    // regardless of whether the day is a day-off or not.
    const allTimes = getAvailableTimes(0, 1440, 60, 0);

    // Remove times that have already been custom-added for this date
    const alreadyAdded = (await r.zRange(`AddedTimes:${rawDate}`, 0, -1)).map(Number);
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
    const r = getRedisClient();
    const dayName = getDayNameFromDateString(rawDate);

    // 1. Fetch standard availability for this weekday
    const availability = await r.hGetAll(`StandardAvailability:${dayName}`);
    let standardTimes: number[] = [];

    if (availability && availability.IsDayOff !== 'true') {
      const [openH, openM] = (availability.OpeningTime || '09:00').split(':').map(Number);
      const [closeH, closeM] = (availability.ClosingTime || '17:00').split(':').map(Number);
      const openingMinutes = openH * 60 + openM;
      const closingMinutes = closeH * 60 + closeM;

      for (let i = openingMinutes; i < closingMinutes; i += 60) {
        standardTimes.push(i);
      }
    }

    // 2. Apply custom modifications (added + deleted)
    const customTimes = await checkCustomAvailability(rawDate, standardTimes, 'both');
    const timesAfterCustom = customTimes.length > 0 ? customTimes : standardTimes;

    // 3. Exclude times that already have a confirmed booking
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
    const r = getRedisClient();
    const timeEntries = times.map((t: number) => ({
      score: t,
      value: String(t),
    }));
    await r.zAdd(`AddedTimes:${date}`, timeEntries);

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
    const r = getRedisClient();
    const timeEntries = times.map((t: number) => ({
      score: t,
      value: String(t),
    }));
    await r.zAdd(`DeletedTimes:${date}`, timeEntries);

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
    const r = getRedisClient();
    const dayName = getDayNameFromDateString(rawDate);

    const availability = await r.hGetAll(`StandardAvailability:${dayName}`);

    let standardTimes: number[] = [];

    if (!availability || availability.IsDayOff === 'true') {
      // Day off — no standard times, but custom-added times may still exist
    } else {
      const [openH, openM] = (availability.OpeningTime || '09:00').split(':').map(Number);
      const [closeH, closeM] = (availability.ClosingTime || '17:00').split(':').map(Number);
      const openingMinutes = openH * 60 + openM;
      const closingMinutes = closeH * 60 + closeM;

      for (let i = openingMinutes; i < closingMinutes; i += 60) {
        standardTimes.push(i);
      }
    }

    const customTimes = await checkCustomAvailability(
      rawDate,
      standardTimes,
      'both',
    );
    const timesAfterCustom =
      customTimes.length > 0 ? customTimes : standardTimes;

    // Exclude times that already have a confirmed booking
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
    const r = getRedisClient();
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).json({ error: 'Invalid date range' });
      return;
    }

    // Fetch all confirmed bookings in the range at once
    const allBookings = await bookingRepository.findByDateRange(startDate, endDate);

    const results: Array<Record<string, unknown>> = [];

    for (
      const d = new Date(start);
      d <= end;
      d.setDate(d.getDate() + 1)
    ) {
      const dateStr = d.toISOString().split('T')[0];
      const dayName = getDayNameFromDateString(dateStr);
      const avail = await r.hGetAll(`StandardAvailability:${dayName}`);
      const isDayOff =
        !avail || avail.IsDayOff === 'true' || avail.IsDayOff?.toLowerCase() === 'true';

      // Standard times
      let standardTimes: number[] = [];
      if (!isDayOff) {
        const [openH, openM] = (avail.OpeningTime || '09:00').split(':').map(Number);
        const [closeH, closeM] = (avail.ClosingTime || '17:00').split(':').map(Number);
        const openMin = openH * 60 + openM;
        const closeMin = closeH * 60 + closeM;
        for (let i = openMin; i < closeMin; i += 60) standardTimes.push(i);
      }

      // Custom modifications
      const addedTimes = (await r.zRange(`AddedTimes:${dateStr}`, 0, -1)).map(Number);
      const deletedTimes = (await r.zRange(`DeletedTimes:${dateStr}`, 0, -1)).map(Number);

      // Bookings for this day
      const dayBookings = allBookings
        .filter((b) => {
          // b.date can be a Date object or string — normalise to YYYY-MM-DD
          const bDate = typeof b.date === 'string'
            ? b.date.split('T')[0]
            : new Date(b.date).toISOString().split('T')[0];
          return bDate === dateStr;
        })
        .map((b) => ({
          id: b.id,
          time: b.time,
          fullName: b.full_name,
          company: b.company,
          email: b.email,
          referralSource: b.referral_source,
          referralSourceOther: b.referral_source_other ?? null,
          timezone: b.timezone,
          meetLink: b.meet_link ?? null,
          status: b.status,
          notes: b.notes ?? null,
          createdAt: b.created_at,
        }));
      const bookedTimes = dayBookings.map((b) => b.time);

      // Effective = (standard + added) – deleted – booked
      const allSet = new Set([...standardTimes, ...addedTimes]);
      const effectiveTimes = [...allSet]
        .filter((t) => !deletedTimes.includes(t) && !bookedTimes.includes(t))
        .sort((a, b) => a - b);

      results.push({
        date: dateStr,
        dayName,
        isDayOff,
        standardTimes,
        addedTimes,
        deletedTimes,
        bookedMeetings: dayBookings,
        effectiveTimes,
        totalHours: effectiveTimes.length,
      });
    }

    res.status(200).json(results);
  } catch (error) {
    logError(error, { context: 'adminDayOverview' });
    res.status(500).json({ error: 'Internal server error' });
  }
}

// ---------------------------------------------------------------------------
// Admin — remove a custom-added time (undo an add)
// ---------------------------------------------------------------------------

/**
 * DELETE /remove-added-time
 * Body: { date: string, times: number[] }
 */
export async function removeAddedTime(
  req: Request,
  res: Response,
): Promise<void> {
  const { date, times } = req.body;

  if (!date || !Array.isArray(times) || times.length === 0) {
    res.status(400).json({ error: 'date and times array are required' });
    return;
  }

  try {
    const r = getRedisClient();
    const members = times.map(String);
    await r.zRem(`AddedTimes:${date}`, members);
    res.status(200).json({ message: 'Added time(s) removed successfully' });
  } catch (err) {
    logError(err, { context: 'removeAddedTime' });
    res.status(500).json({ error: 'Internal server error' });
  }
}

// ---------------------------------------------------------------------------
// Admin — remove a custom-deleted time (undo a delete / restore)
// ---------------------------------------------------------------------------

/**
 * DELETE /remove-deleted-time
 * Body: { date: string, times: number[] }
 */
export async function removeDeletedTime(
  req: Request,
  res: Response,
): Promise<void> {
  const { date, times } = req.body;

  if (!date || !Array.isArray(times) || times.length === 0) {
    res.status(400).json({ error: 'date and times array are required' });
    return;
  }

  try {
    const r = getRedisClient();
    const members = times.map(String);
    await r.zRem(`DeletedTimes:${date}`, members);
    res.status(200).json({ message: 'Deleted time(s) restored successfully' });
  } catch (err) {
    logError(err, { context: 'removeDeletedTime' });
    res.status(500).json({ error: 'Internal server error' });
  }
}
