"use client";

import { useState } from "react";
import { RiCheckLine, RiRestartLine, RiTimeLine } from "react-icons/ri";

import { cn } from "@/lib/utils";
import type { OpeningHours } from "@/types/content";

/**
 * Opening-hours editor.
 *
 * Deliberately a plain form (progressive enhancement): every button is a
 * `<input type="submit">` with its own `name`/`value`, so the profile also
 * works without JavaScript at all.
 */
export function HoursForm({
  hours,
  is247,
  saveAction,
  openAllDay,
  closeAllDay,
}: {
  hours: OpeningHours[];
  is247: boolean;
  saveAction: (formData: FormData) => Promise<void>;
  openAllDay: string;
  closeAllDay: string;
}) {
  const [rows, setRows] = useState<OpeningHours[]>(hours);

  const update = (weekday: number, patch: Partial<OpeningHours>) => {
    setRows((current) =>
      current.map((row) => (row.weekday === weekday ? { ...row, ...patch } : row)),
    );
  };

  const anyClosed = rows.some((row) => row.closed);

  return (
    <form action={saveAction} className="space-y-6">
      {/* One-click presets */}
      <section className="rounded-card border border-ink-900/10 bg-white p-6">
        <h2 className="font-ui text-sm font-semibold uppercase tracking-[0.14em] text-ink-700">
          Quick settings
        </h2>
        <p className="mt-2 font-body text-sm text-ink-600">
          The clinic is currently open 24 hours a day, seven days a week. Use a preset below, or set
          each day individually — changes apply across the whole site immediately.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="submit"
            name="preset"
            value="24-7"
            className="btn-primary"
            disabled={is247}
          >
            <RiCheckLine aria-hidden="true" className="h-4 w-4" />
            {is247 ? "Already open 24/7" : "Open 24 hours, every day"}
          </button>

          <button type="submit" name="preset" value="reset" className="btn-outline">
            <RiRestartLine aria-hidden="true" className="h-4 w-4" />
            Reset to default
          </button>
        </div>

        <p className="mt-4 font-body text-xs leading-relaxed text-ink-500">
          The 24/7 preset stores <span className="font-mono">{openAllDay}</span> –{" "}
          <span className="font-mono">{closeAllDay}</span> for every day. Times use the 24-hour clock;
          use <span className="font-mono">{closeAllDay}</span> for midnight at the end of the day.
        </p>
      </section>

      {/* Per-day editor */}
      <section className="rounded-card border border-ink-900/10 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-ui text-sm font-semibold uppercase tracking-[0.14em] text-ink-700">
            <RiTimeLine aria-hidden="true" className="h-4 w-4 text-gold-ink" />
            Set each day
          </h2>
          <label className="flex cursor-pointer items-center gap-2 font-body text-sm text-ink-600">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-ink-900/25 text-brand-700 focus:ring-brand-700/40"
              checked={anyClosed}
              onChange={(event) => {
                const closed = event.target.checked;
                setRows((current) =>
                  current.map((row) => ({
                    ...row,
                    closed: closed && row.weekday === 0 ? true : closed ? row.closed : false,
                  })),
                );
              }}
            />
            Mark specific days as closed
          </label>
        </div>

        <ul className="mt-6 divide-y divide-ink-900/8">
          {rows.map((row) => (
            <li
              key={row.weekday}
              className="grid grid-cols-1 items-center gap-3 py-4 sm:grid-cols-[8rem_1fr_auto]"
            >
              <span className="font-ui text-sm font-medium text-ink-900">{row.label}</span>

              <div className="flex flex-wrap items-center gap-2">
                <label className="sr-only" htmlFor={`open-${row.weekday}`}>
                  {row.label} opening time
                </label>
                <input
                  id={`open-${row.weekday}`}
                  name={`open-${row.weekday}`}
                  type="time"
                  defaultValue={row.open ?? openAllDay}
                  disabled={row.closed}
                  className={cn(
                    "w-32 rounded-lg border border-ink-900/15 bg-white px-3 py-2 font-ui text-sm tabular-nums text-ink-900",
                    "focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-700/25",
                    row.closed && "opacity-50",
                  )}
                />
                <span className="font-body text-sm text-ink-400">to</span>
                <label className="sr-only" htmlFor={`close-${row.weekday}`}>
                  {row.label} closing time
                </label>
                <input
                  id={`close-${row.weekday}`}
                  name={`close-${row.weekday}`}
                  type="time"
                  defaultValue={row.close ?? closeAllDay}
                  disabled={row.closed}
                  className={cn(
                    "w-32 rounded-lg border border-ink-900/15 bg-white px-3 py-2 font-ui text-sm tabular-nums text-ink-900",
                    "focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-700/25",
                    row.closed && "opacity-50",
                  )}
                />

                {row.closed ? (
                  <span className="rounded-full border border-ink-900/12 px-2.5 py-1 font-ui text-[0.625rem] font-semibold uppercase tracking-wider text-ink-500">
                    Closed
                  </span>
                ) : (
                  row.open === openAllDay &&
                  row.close === closeAllDay && (
                    <span className="rounded-full border border-brand-700/25 bg-brand-50 px-2.5 py-1 font-ui text-[0.625rem] font-semibold uppercase tracking-wider text-brand-800">
                      24 hours
                    </span>
                  )
                )}
              </div>

              <label className="flex cursor-pointer items-center gap-2 justify-self-start font-body text-xs text-ink-500 sm:justify-self-end">
                <input
                  type="checkbox"
                  name={`closed-${row.weekday}`}
                  checked={Boolean(row.closed)}
                  onChange={(event) => update(row.weekday, { closed: event.target.checked })}
                  className="h-4 w-4 rounded border-ink-900/25 text-brand-700 focus:ring-brand-700/40"
                />
                Closed
              </label>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-ink-900/8 pt-6">
          <button type="submit" name="preset" value="custom" className="btn-primary">
            <RiCheckLine aria-hidden="true" className="h-4 w-4" />
            Save opening hours
          </button>
          <p className="font-body text-xs text-ink-500">
            Appointments already booked are not affected.
          </p>
        </div>
      </section>
    </form>
  );
}
