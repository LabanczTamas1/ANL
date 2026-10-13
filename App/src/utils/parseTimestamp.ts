/**
 * Parse an email timestamp that may arrive in either format:
 *  - epoch milliseconds in a numeric string / number (mock + legacy data), or
 *  - an ISO-8601 date string (PostgreSQL `created_at`).
 *
 * The backend serialises `created_at` as an ISO string, so the previous
 * `new Date(Number(value))` approach produced `NaN` (hence "NaN" dates in the
 * email views). Returns a valid `Date`, or `null` when the value is missing or
 * unparseable.
 */
export function parseTimestamp(
  value: string | number | null | undefined
): Date | null {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "number") {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }

  const trimmed = value.trim();
  // A string of only digits is epoch milliseconds; otherwise treat as ISO.
  const date = /^\d+$/.test(trimmed)
    ? new Date(Number(trimmed))
    : new Date(trimmed);

  return isNaN(date.getTime()) ? null : date;
}

export default parseTimestamp;
