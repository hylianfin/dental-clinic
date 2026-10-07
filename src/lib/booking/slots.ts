import type { OpeningHours } from "@/types/content";

import { bookingConfig } from "@/lib/booking/config";
import {
  addDays,
  addMinutes,
  dateKeyInTimeZone,
  expandTimeRange,
  weekdayInTimeZone,
  zonedWallClockToUtc,
} from "@/lib/booking/time";
import type { DayAvailability, TimeSlot } from "@/lib/booking/types";

export interface BusyInterval {
  startsAt: string;
  endsAt: string;
}

export interface GenerateSlotsOptions {
  /** `YYYY-MM-DD` in clinic time. */
  date: string;
  hours: OpeningHours[];
  durationMinutes: number;
  busy?: BusyInterval[];
  timeOff?: BusyInterval[];
  now?: Date;
  timeZone?: string;
  stepMinutes?: number;
  minimumNoticeHours?: number;
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/** `true` once every weekday has real opening hours. */
export function isScheduleConfigured(hours: OpeningHours[]): boolean {
  return hours.some((day) => day.closed || (day.open !== null && day.close !== null));
}

/**
 * Builds the slot list for a single day, marking each slot as available or
 * explaining why it is not. Pure function — no I/O — so it is safe to call from
 * Server Components, Server Actions and (with the same inputs) the client.
 */
export function generateDayAvailability(options: GenerateSlotsOptions): DayAvailability {
  const {
    date,
    hours,
    durationMinutes,
    busy = [],
    timeOff = [],
    now = new Date(),
    timeZone = bookingConfig.timeZone,
    stepMinutes = bookingConfig.slotStepMinutes,
    minimumNoticeHours = bookingConfig.minimumNoticeHours,
  } = options;

  // Noon avoids any DST edge case when resolving the weekday.
  const noon = zonedWallClockToUtc(date, "12:00", timeZone);
  const weekday = weekdayInTimeZone(noon, timeZone);
  const day = hours.find((entry) => entry.weekday === weekday);

  if (!day || day.closed || !day.open || !day.close) {
    return { date, open: false, slots: [] };
  }

  const closeAt = zonedWallClockToUtc(date, day.close, timeZone).getTime();
  const earliest = now.getTime() + minimumNoticeHours * 3_600_000;
  const effectiveDuration = durationMinutes;

  const slots: TimeSlot[] = [];

  for (const label of expandTimeRange(day.open, day.close, stepMinutes)) {
    const startsAt = zonedWallClockToUtc(date, label, timeZone);
    const endsAt = addMinutes(startsAt, effectiveDuration);

    // Never offer a slot that would run past closing time.
    if (endsAt.getTime() > closeAt) continue;

    const slot: TimeSlot = {
      time: label,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      available: true,
    };

    if (startsAt.getTime() < earliest) {
      slot.available = false;
      slot.unavailableReason = "lead_time";
    } else if (
      timeOff.some((interval) =>
        overlaps(startsAt.getTime(), endsAt.getTime(), +new Date(interval.startsAt), +new Date(interval.endsAt)),
      )
    ) {
      slot.available = false;
      slot.unavailableReason = "time_off";
    } else if (
      busy.some((interval) =>
        overlaps(startsAt.getTime(), endsAt.getTime(), +new Date(interval.startsAt), +new Date(interval.endsAt)),
      )
    ) {
      slot.available = false;
      slot.unavailableReason = "booked";
    }

    slots.push(slot);
  }

  return { date, open: true, slots };
}

/**
 * The next `count` calendar dates (clinic time) starting from `fromDateKey`,
 * skipping weekdays the clinic is closed. Used by the booking wizard so the
 * patient never lands on an empty day.
 */
export function nextOpenDates(
  fromDateKey: string,
  count: number,
  hours: OpeningHours[],
  timeZone: string = bookingConfig.timeZone,
  maxScanDays = 60,
): string[] {
  const results: string[] = [];
  const anchor = zonedWallClockToUtc(fromDateKey, "12:00", timeZone);

  for (let offset = 0; offset <= maxScanDays && results.length < count; offset += 1) {
    const candidate = addDays(anchor, offset);
    const key = dateKeyInTimeZone(candidate, timeZone);
    const weekday = weekdayInTimeZone(candidate, timeZone);
    const day = hours.find((entry) => entry.weekday === weekday);
    if (day && !day.closed && day.open && day.close) results.push(key);
  }

  return results;
}

/** Re-validates a requested slot server-side (never trust the client's answer). */
export function isSlotBookable(
  options: GenerateSlotsOptions & { requestedTime: string },
): { ok: boolean; reason?: string; startsAt?: string; endsAt?: string } {
  const availability = generateDayAvailability(options);
  const slot = availability.slots.find((entry) => entry.time === options.requestedTime);

  if (!availability.open) {
    return { ok: false, reason: "The clinic is closed on the selected day." };
  }
  if (!slot) return { ok: false, reason: "That time is not offered on the selected day." };
  if (!slot.available) {
    const reasons: Record<NonNullable<TimeSlot["unavailableReason"]>, string> = {
      booked: "That time has just been taken. Please choose another slot.",
      time_off: "The clinic is unavailable at that time. Please choose another slot.",
      past: "That time has passed. Please choose another slot.",
      lead_time: "That time is too soon. Please choose a later slot.",
    };
    return { ok: false, reason: reasons[slot.unavailableReason ?? "past"] };
  }

  return { ok: true, startsAt: slot.startsAt, endsAt: slot.endsAt };
}
