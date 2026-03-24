import { getRedisClient } from '../config/database.js';

export async function checkCustomAvailability(
  date: string,
  standardAvailabilityArr: number[],
  openClosedFlag: string,
): Promise<number[]> {
  const redisClient = getRedisClient();
  let allAvailableTimes: number[] = [];

  if (openClosedFlag === 'both') {
    let addedTimes = await redisClient.zRange(`AddedTimes:${date}`, 0, -1);
    const addedNumbers = addedTimes.map((item) => Number(item));

    let deletedTimes = await redisClient.zRange(
      `DeletedTimes:${date}`,
      0,
      -1,
    );
    const deletedNumbers = deletedTimes.map((item) => Number(item));

    const allSet = new Set([...standardAvailabilityArr, ...addedNumbers]);
    allAvailableTimes = [...allSet].filter(
      (item) => !deletedNumbers.includes(item),
    );
  }

  return allAvailableTimes;
}
