import { query } from './db.js';

export async function checkCustomAvailability(
  date: string,
  standardAvailabilityArr: number[],
  openClosedFlag: string,
): Promise<number[]> {
  let allAvailableTimes: number[] = [];

  if (openClosedFlag === 'both') {
    const rows = await query<{ time_minutes: number; type: string }>(
      `SELECT time_minutes, type FROM custom_availability WHERE date = $1`,
      [date],
    );

    const addedNumbers = rows.filter(r => r.type === 'added').map(r => r.time_minutes);
    const deletedNumbers = rows.filter(r => r.type === 'deleted').map(r => r.time_minutes);

    const allSet = new Set([...standardAvailabilityArr, ...addedNumbers]);
    allAvailableTimes = [...allSet].filter(
      (item) => !deletedNumbers.includes(item),
    );
  }

  return allAvailableTimes;
}
