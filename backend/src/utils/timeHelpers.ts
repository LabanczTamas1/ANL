// ---------------------------------------------------------------------------
// Time utility functions
// ---------------------------------------------------------------------------

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function getAvailableTimes(
  start: number,
  end: number,
  increment: number,
  offset: number,
): number[] {
  const result: number[] = [];
  for (let i = start; i < end; i += increment) {
    result.push(i + offset);
  }
  return result;
}

export function getUnavailableTimes(
  availableStart: number,
  availableEnd: number,
): number[] {
  const allAvailableHours = getAvailableTimes(0, 1440, 60, 0);
  return allAvailableHours.filter(
    (hour) => hour < availableStart || hour >= availableEnd,
  );
}

export function convertMinutesToTime(minutes: number | string): string {
  const totalMinutes =
    typeof minutes === 'string' ? parseInt(minutes, 10) : minutes;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  const displayMin = mins.toString().padStart(2, '0');
  return `${displayHour}:${displayMin} ${ampm}`;
}

export function extractUTCOffset(utcString: string): number | null {
  const match = utcString.match(/[-+]?\d+/);
  return match ? parseInt(match[0], 10) : null;
}

export function getCountedTimesFromUTC(
  array: number[],
  UTCOffset: number,
): number[] {
  return array
    .map((num) => num + UTCOffset * 60 - 1440)
    .filter((num) => num >= 0 && num <= 1440);
}

export function utcToMinutes(gmtString: string): number | null {
  const match = gmtString.match(/UTC([+-])(\d+)/);
  if (!match) return null;
  const sign = match[1] === '+' ? -1 : 1;
  const hours = parseInt(match[2], 10);
  return sign * hours * 60;
}
