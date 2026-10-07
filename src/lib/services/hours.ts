import "server-only";

import { openingHours as contentHours, scheduleSummary } from "@/content/site";
import type { ActionResult } from "@/lib/booking/types";
import { readCollection, writeCollection } from "@/lib/data/store";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { OpeningHours } from "@/types/content";

/**
 * Opening hours: read + write.
 *
 * Resolution order (so the site works with or without a backend):
 *   1. Supabase `opening_hours` when it is configured and has rows,
 *   2. the local demo store (`.data/opening-hours.json`) when an editor saved
 *      changes in a no-backend environment,
 *   3. the typed content file `src/content/site.ts` as the built-in default —
 *      currently "24 hours a day, seven days a week".
 *
 * This is the ONLY place opening hours are resolved, which is why the booking
 * engine, contact page, header and footer can never disagree with each other.
 */

const FILE = "opening-hours.json";

export const WEEKDAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/** Canonical full-day value used by the 24/7 preset. */
export const ALL_DAY_OPEN = "00:00";
export const ALL_DAY_CLOSE = "24:00";

export function buildAllDaySchedule(): OpeningHours[] {
  return WEEKDAY_LABELS.map((label, weekday) => ({
    weekday,
    label,
    open: ALL_DAY_OPEN,
    close: ALL_DAY_CLOSE,
    closed: false,
  }));
}

export function isOpen24Hours(open: string | null, close: string | null): boolean {
  return open === ALL_DAY_OPEN && close === ALL_DAY_CLOSE;
}

/** True when every day is an open 24-hour day. */
export function isTwentyFourSeven(hours: OpeningHours[]): boolean {
  return (
    hours.length === 7 &&
    hours.every((day) => !day.closed && isOpen24Hours(day.open, day.close))
  );
}

/** Human summary, e.g. "Open 24 hours, 7 days a week" or "Mon–Fri 09:00–17:00". */
export function summariseHours(hours: OpeningHours[]): string {
  if (isTwentyFourSeven(hours)) return scheduleSummary;

  const open = hours.filter((day) => !day.closed && day.open && day.close);
  if (open.length === 0) return "Closed";
  if (open.length === 1) {
    const day = open[0]!;
    return `${day.label} ${day.open}–${day.close}`;
  }

  const uniform = open.every((day) => day.open === open[0]!.open && day.close === open[0]!.close);
  if (uniform && open.length === 7) return `Every day ${open[0]!.open}–${open[0]!.close}`;

  return `${open.length} days per week`;
}

/** "24:00" is valid for closing time; "25:00" is not. */
export function isValidTime(value: string | null): boolean {
  if (value === null) return true;
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return false;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  return hour <= 24 && minute <= 59 && !(hour === 24 && minute !== 0);
}

function toMinutes(value: string): number {
  const [hour, minute] = value.split(":").map(Number);
  return (hour ?? 0) * 60 + (minute ?? 0);
}

/** Validates a full week's schedule before it is persisted. */
export function validateSchedule(hours: OpeningHours[]): string | null {
  if (hours.length !== 7) return "A schedule must define all seven days.";

  for (const day of hours) {
    if (day.closed) continue;
    if (!day.open || !day.close) return `${day.label}: opening and closing times are required.`;
    if (!isValidTime(day.open) || !isValidTime(day.close)) {
      return `${day.label}: times must be in 24-hour format (e.g. 09:00 or 24:00).`;
    }
    if (toMinutes(day.close) <= toMinutes(day.open)) {
      return `${day.label}: the closing time must be after the opening time.`;
    }
  }
  return null;
}

async function readStoredHours(): Promise<OpeningHours[] | null> {
  const stored = await readCollection<OpeningHours[] | null>(FILE, null);
  if (!stored || !Array.isArray(stored) || stored.length !== 7) return null;
  return stored;
}

/** The schedule the whole application reads. */
export async function getOpeningHours(): Promise<OpeningHours[]> {
  if (isSupabaseConfigured) {
    try {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase
        .from("opening_hours")
        .select("weekday, label, opens_at, closes_at, closed")
        .order("weekday", { ascending: true });

      if (!error && data && data.length === 7) {
        return data.map((row) => ({
          weekday: row.weekday,
          label: row.label,
          open: row.opens_at ? row.opens_at.slice(0, 5) : null,
          close: row.closes_at ? row.closes_at.slice(0, 5) : null,
          closed: row.closed,
        }));
      }
    } catch {
      // fall through to the local sources
    }
  }

  const stored = await readStoredHours();
  if (stored) return stored;

  return contentHours;
}

/** Persists a validated schedule. Used by the dashboard editor. */
export async function saveOpeningHours(hours: OpeningHours[]): Promise<ActionResult> {
  const problem = validateSchedule(hours);
  if (problem) return { ok: false, message: problem };

  if (isSupabaseConfigured) {
    try {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.from("opening_hours").upsert(
        hours.map((day) => ({
          weekday: day.weekday,
          label: day.label,
          opens_at: day.closed ? null : day.open,
          closes_at: day.closed ? null : day.close,
          closed: day.closed,
        })),
        { onConflict: "weekday" },
      );

      if (error) throw new Error(error.message);
      return { ok: true, message: "Opening hours saved." };
    } catch (error) {
      return {
        ok: false,
        message:
          error instanceof Error
            ? `Could not save to Supabase: ${error.message}`
            : "Could not save the opening hours.",
      };
    }
  }

  await writeCollection(FILE, hours);
  return {
    ok: true,
    message: "Opening hours saved locally (demo store — Supabase is not configured).",
    demoMode: true,
  };
}

/** Resets the schedule back to the built-in default. */
export async function resetOpeningHours(): Promise<ActionResult> {
  return saveOpeningHours(contentHours);
}
