import { readEnv } from "@/lib/booking/env-reader";

/**
 * Booking engine configuration — the single place these policies live.
 *
 * The clinic is open 24 hours a day, seven days a week, so EVERY 30-minute slot
 * of every day is offered. Which slots exist comes from the opening hours
 * resolved by `src/lib/services/hours.ts` (editable in the dashboard, default
 * 00:00–24:00); the values here only describe how slots are cut and validated.
 */
export const bookingConfig = {
  /** Clinic time zone (set NEXT_PUBLIC_CLINIC_TIME_ZONE to override). */
  timeZone: readEnv("NEXT_PUBLIC_CLINIC_TIME_ZONE") ?? "Africa/Algiers",
  /** Granularity of generated slots. */
  slotStepMinutes: 30,
  /** How far ahead patients may request an appointment. */
  horizonDays: 60,
  /**
   * Minimum notice before the earliest bookable slot. Kept deliberately small
   * (one hour) because the clinic answers around the clock — this is a courtesy
   * buffer, not a limit on opening hours. Change it here only.
   */
  minimumNoticeHours: 1,
  /** Used when a service has no duration configured. */
  defaultDurationMinutes: 30,
  /** Buffer added after each appointment before the next slot is offered. */
  turnaroundMinutes: 10,
} as const;

export const BOOKING_TIME_ZONE_IS_PLACEHOLDER = !readEnv("NEXT_PUBLIC_CLINIC_TIME_ZONE");

/**
 * Convenience: the clinic's confirmed availability in one sentence. Opening
 * hours themselves always come from `getOpeningHours()` — never from here.
 */
export const AVAILABILITY_IS_24_7 = true;
