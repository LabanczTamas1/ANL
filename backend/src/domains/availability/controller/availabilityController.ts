// ---------------------------------------------------------------------------
// Availability Controller
// ---------------------------------------------------------------------------

import { Request, Response } from 'express';
import { getRedisClient } from '../../../config/database.js';
import {
  timeToMinutes,
  getAvailableTimes,
  getUnavailableTimes,
} from '../../../utils/timeHelpers.js';
import { checkCustomAvailability } from '../../../utils/availabilityHelpers.js';
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
    const date = new Date(rawDate);
    const dayNumber = date.getDay();
    const weekdays = [
      'Monday', 'Tuesday', 'Wednesday', 'Thursday',
      'Friday', 'Saturday', 'Sunday',
    ];
    const dayName = weekdays[dayNumber];
    const availability = await r.hGetAll(`StandardAvailability:${dayName}`);

    if (availability.IsDayOff?.toLowerCase() === 'true') {
      res.status(200).json({ unavailableTimes: [] });
      return;
    }

    const startHour = timeToMinutes(availability.OpeningTime);
    const endHour = timeToMinutes(availability.ClosingTime);
    const allUnavailableTimes = getUnavailableTimes(startHour, endHour);

    res.status(200).json({ unavailableTimes: allUnavailableTimes });
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
    const date = new Date(rawDate);
    const dayNumber = date.getDay();
    const weekdays = [
      'Monday', 'Tuesday', 'Wednesday', 'Thursday',
      'Friday', 'Saturday', 'Sunday',
    ];
    const dayName = weekdays[dayNumber];
    const availability = await r.hGetAll(`StandardAvailability:${dayName}`);

    if (availability.IsDayOff?.toLowerCase() === 'true') {
      res.status(200).json({ availableTimes: [] });
      return;
    }

    const startHour = timeToMinutes(availability.OpeningTime);
    const endHour = timeToMinutes(availability.ClosingTime);

    res.status(200).json({
      availableTimes: getAvailableTimes(startHour, endHour, 60, 0),
    });
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
    const dateInput = new Date(rawDate);
    const dayNumber = dateInput.getDay() === 0 ? 6 : dateInput.getDay() - 1;
    const weekdays = [
      'Monday', 'Tuesday', 'Wednesday', 'Thursday',
      'Friday', 'Saturday', 'Sunday',
    ];
    const dayName = weekdays[dayNumber] || 'Monday';

    const availability = await r.hGetAll(`StandardAvailability:${dayName}`);

    if (!availability || availability.IsDayOff === 'true') {
      res.status(200).json({
        availableTimes: [],
        message: 'No availability on this day',
      });
      return;
    }

    const [openH, openM] = (availability.OpeningTime || '09:00').split(':').map(Number);
    const [closeH, closeM] = (availability.ClosingTime || '17:00').split(':').map(Number);
    const openingMinutes = openH * 60 + openM;
    const closingMinutes = closeH * 60 + closeM;

    let availableTimes: number[] = [];
    for (let i = openingMinutes; i < closingMinutes; i += 60) {
      availableTimes.push(i);
    }

    const customTimes = await checkCustomAvailability(
      rawDate,
      availableTimes,
      'both',
    );
    const finalAvailableTimes =
      customTimes.length > 0 ? customTimes : availableTimes;

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
