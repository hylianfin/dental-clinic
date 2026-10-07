/**
 * Time-zone helpers built on `Intl` — no date library required.
 *
 * All instants are stored as UTC ISO strings. Wall-clock values
 * (`YYYY-MM-DD`, `HH:mm`) are always interpreted in the *clinic* time zone, so
 * a patient booking from another country still lands on the right hour.
 */

interface ZonedParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

function partsInTimeZone(date: Date, timeZone: string): ZonedParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const lookup = (type: Intl.DateTimeFormatPartTypes): number => {
    const found = parts.find((part) => part.type === type)?.value ?? "0";
    return Number.parseInt(found, 10);
  };

  return {
    year: lookup("year"),
    month: lookup("month"),
    day: lookup("day"),
    // `hour12: false` can yield "24" for midnight in some ICU versions.
    hour: lookup("hour") % 24,
    minute: lookup("minute"),
    second: lookup("second"),
  };
}

/** Offset of `timeZone` from UTC at the given instant, in milliseconds. */
function offsetMs(date: Date, timeZone: string): number {
  const parts = partsInTimeZone(date, timeZone);
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
  return asUtc - date.getTime();
}

/**
 * Converts clinic wall-clock values to an exact UTC instant.
 * `date` = `YYYY-MM-DD`, `time` = `HH:mm`. Handles DST transitions by
 * re-evaluating the offset once at the resolved instant.
 */
export function zonedWallClockToUtc(date: string, time: string, timeZone: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);

  const utcGuess = Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1, hour ?? 0, minute ?? 0);
  const firstOffset = offsetMs(new Date(utcGuess), timeZone);
  const firstPass = utcGuess - firstOffset;
  const secondOffset = offsetMs(new Date(firstPass), timeZone);
  return new Date(utcGuess - secondOffset);
}

/** `YYYY-MM-DD` for the given instant, in the clinic time zone. */
export function dateKeyInTimeZone(date: Date, timeZone: string): string {
  const parts = partsInTimeZone(date, timeZone);
  return `${parts.year.toString().padStart(4, "0")}-${parts.month
    .toString()
    .padStart(2, "0")}-${parts.day.toString().padStart(2, "0")}`;
}

/** `HH:mm` for the given instant, in the clinic time zone. */
export function timeKeyInTimeZone(date: Date, timeZone: string): string {
  const parts = partsInTimeZone(date, timeZone);
  return `${parts.hour.toString().padStart(2, "0")}:${parts.minute.toString().padStart(2, "0")}`;
}

/** Weekday index (0 = Sunday) for the given instant, in the clinic time zone. */
export function weekdayInTimeZone(date: Date, timeZone: string): number {
  const name = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" }).format(date);
  const order = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const index = order.indexOf(name);
  return index === -1 ? date.getDay() : index;
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000);
}

export function minutesBetween(startIso: string, endIso: string): number {
  return Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / 60_000);
}

/** Builds every `HH:mm` label between two wall-clock times (exclusive of close). */
export function expandTimeRange(open: string, close: string, stepMinutes: number): string[] {
  const [openHour, openMinute] = open.split(":").map(Number);
  const [closeHour, closeMinute] = close.split(":").map(Number);

  const start = (openHour ?? 0) * 60 + (openMinute ?? 0);
  const end = (closeHour ?? 0) * 60 + (closeMinute ?? 0);

  const labels: string[] = [];
  for (let minute = start; minute + stepMinutes <= end; minute += stepMinutes) {
    const hour = Math.floor(minute / 60);
    const remainder = minute % 60;
    labels.push(`${hour.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`);
  }
  return labels;
}

/** "09:00" → "9:00 AM" (locale-aware, used for display). */
export function formatTimeLabel(time: string, locale = "en-GB"): string {
  const [hour, minute] = time.split(":").map(Number);
  const date = new Date(Date.UTC(2000, 0, 1, hour ?? 0, minute ?? 0));
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(date);
}

/** Human date for a `YYYY-MM-DD` key, e.g. "Monday 12 October 2026". */
export function formatDateKey(dateKey: string, locale = "en-GB"): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1)));
}

/** Formats an instant for display in the clinic time zone. */
export function formatInstant(
  iso: string,
  timeZone: string,
  options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  },
  locale = "en-GB",
): string {
  return new Intl.DateTimeFormat(locale, { ...options, timeZone }).format(new Date(iso));
}
