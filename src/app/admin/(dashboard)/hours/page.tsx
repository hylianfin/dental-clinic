import { RiTimeLine } from "react-icons/ri";

import { Badge } from "@/components/ui/primitives";
import { saveOpeningHoursAction } from "@/lib/actions/admin-hours";
import { bookingConfig } from "@/lib/booking/config";
import {
  ALL_DAY_CLOSE,
  ALL_DAY_OPEN,
  getOpeningHours,
  isTwentyFourSeven,
  summariseHours,
  WEEKDAY_LABELS,
} from "@/lib/services/hours";

import { HoursForm } from "./hours-form";

export const metadata = { title: "Opening hours" };

/**
 * Opening-hours editor.
 *
 * Writes to the Supabase `opening_hours` table (or the local demo store when
 * Supabase is not configured). The booking engine, the header strip, the footer
 * and the contact page all read the result of `getOpeningHours()`, so a change
 * made here takes effect everywhere at once — nothing is hard-coded.
 */

const SAVED_MESSAGES: Record<string, { tone: "success" | "warning"; text: string }> = {
  "24-7": {
    tone: "success",
    text: "Saved. The clinic is now open 24 hours a day, every day, and every 30-minute slot is bookable.",
  },
  custom: { tone: "success", text: "Opening hours saved." },
  reset: { tone: "success", text: "Reset to the clinic's default schedule (24/7)." },
};

export default async function AdminHoursPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const params = await searchParams;
  const hours = await getOpeningHours();
  const is247 = isTwentyFourSeven(hours);

  const banner = params.error
    ? { tone: "warning" as const, text: params.error }
    : params.saved
      ? SAVED_MESSAGES[params.saved]
      : undefined;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl text-ink-900">Opening hours</h1>
          <p className="mt-2 max-w-2xl font-body text-sm text-ink-600">
            These hours drive the appointment system: only times the clinic is open are offered to
            patients, and every request is re-validated against them before it is saved.
          </p>
        </div>
        <Badge tone={is247 ? "success" : "info"}>
          {is247 ? "Open 24/7" : summariseHours(hours)}
        </Badge>
      </header>

      {banner && (
        <div
          role="status"
          className={
            banner.tone === "success"
              ? "rounded-xl border border-brand-700/20 bg-brand-50 px-4 py-3 font-body text-sm text-ink-800"
              : "rounded-xl border border-amber-500/30 bg-amber-50 px-4 py-3 font-body text-sm text-amber-900"
          }
        >
          {banner.text}
        </div>
      )}

      {/* Current state — read from the resolved schedule, not from a constant. */}
      <section className="rounded-card border border-ink-900/10 bg-cream-50 p-6">
        <h2 className="flex items-center gap-2 font-ui text-sm font-semibold uppercase tracking-[0.14em] text-ink-700">
          <RiTimeLine aria-hidden="true" className="h-4 w-4 text-gold-ink" />
          Current schedule
        </h2>

        <dl className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
          {hours.map((day) => (
            <div
              key={day.weekday}
              className="flex items-baseline justify-between gap-3 border-b border-ink-900/8 pb-2"
            >
              <dt className="font-body text-sm text-ink-600">{WEEKDAY_LABELS[day.weekday]}</dt>
              <dd className="font-ui text-sm tabular-nums text-ink-900">
                {day.closed || !day.open || !day.close ? "Closed" : `${day.open} – ${day.close}`}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-5 font-body text-xs leading-relaxed text-ink-500">
          {summariseHours(hours)}. Appointments are offered every{" "}
          {bookingConfig.slotStepMinutes} minutes, up to {bookingConfig.horizonDays} days ahead, with{" "}
          {bookingConfig.minimumNoticeHours} hour{bookingConfig.minimumNoticeHours === 1 ? "" : "s"}{" "}
          of notice, and a {bookingConfig.turnaroundMinutes}-minute turnaround between patients.
        </p>
      </section>

      <HoursForm
        hours={hours}
        is247={is247}
        saveAction={saveOpeningHoursAction}
        openAllDay={ALL_DAY_OPEN}
        closeAllDay={ALL_DAY_CLOSE}
      />
    </div>
  );
}
