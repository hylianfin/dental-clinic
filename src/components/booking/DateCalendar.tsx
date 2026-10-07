"use client";

import { useMemo, useState } from "react";
import { RiArrowLeftSLine, RiArrowRightSLine, RiCalendarLine } from "react-icons/ri";

import { cn } from "@/lib/utils";
import type { CalendarDay } from "@/lib/booking/types";

/**
 * Month calendar for the booking wizard.
 *
 * The whole booking horizon (60 days by default) is rendered from data the
 * server already computed, so the grid is visible immediately — no round trip
 * before a patient can see which days exist. Picking a day asks the server for
 * that day's times (`fetchDayAvailabilityAction`).
 *
 * Date maths is done on `YYYY-MM-DD` strings with a fixed month-name table and
 * a Monday-first week, so the server and client render identical markup.
 */

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/** Monday-first, matching the local calendar convention. */
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const WEEKDAY_INITIALS = ["M", "T", "W", "T", "F", "S", "S"] as const;

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

/** Monday-first weekday index (0 = Monday) for the 1st of a month. */
function firstWeekdayOffset(year: number, monthIndex: number): number {
  const jsDay = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay(); // 0 = Sunday
  return (jsDay + 6) % 7;
}

export function DateCalendar({
  days,
  selectedDate,
  todayKey,
  onSelect,
  disabled = false,
}: {
  days: CalendarDay[];
  selectedDate: string;
  todayKey: string;
  onSelect: (date: string) => void;
  disabled?: boolean;
}) {
  const byDate = useMemo(() => new Map(days.map((day) => [day.date, day])), [days]);

  const months = useMemo(() => {
    const seen = new Map<string, { key: string; year: number; month: number }>();
    for (const day of days) {
      const key = day.date.slice(0, 7);
      if (!seen.has(key)) {
        seen.set(key, {
          key,
          year: Number(day.date.slice(0, 4)),
          month: Number(day.date.slice(5, 7)) - 1,
        });
      }
    }
    return [...seen.values()];
  }, [days]);

  const [cursor, setCursor] = useState(0);
  const month = months[Math.min(cursor, months.length - 1)];

  if (!month) return null;

  const totalCells = daysInMonth(month.year, month.month);
  const leading = firstWeekdayOffset(month.year, month.month);
  const cells: (string | null)[] = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: totalCells }, (_, index) => {
      const day = String(index + 1).padStart(2, "0");
      const monthPart = String(month.month + 1).padStart(2, "0");
      return `${month.year}-${monthPart}-${day}`;
    }),
  ];

  const selectedDay = byDate.get(selectedDate);

  return (
    <div className="rounded-card border border-ink-900/10 bg-white p-4 sm:p-5">
      {/* Month header */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setCursor((value) => Math.max(0, value - 1))}
          disabled={cursor === 0 || disabled}
          aria-label="Previous month"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-900/12 text-ink-700 transition-colors hover:border-brand-700/40 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RiArrowLeftSLine aria-hidden="true" className="h-5 w-5" />
        </button>

        <p aria-live="polite" className="font-ui text-sm font-semibold text-ink-900">
          <RiCalendarLine aria-hidden="true" className="mr-1.5 inline h-4 w-4 text-gold-ink" />
          {MONTHS[month.month]} {month.year}
        </p>

        <button
          type="button"
          onClick={() => setCursor((value) => Math.min(months.length - 1, value + 1))}
          disabled={cursor >= months.length - 1 || disabled}
          aria-label="Next month"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-900/12 text-ink-700 transition-colors hover:border-brand-700/40 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RiArrowRightSLine aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>

      {/* Weekday header */}
      <div className="mt-4 grid grid-cols-7 gap-1" aria-hidden="true">
        {WEEKDAYS.map((name, index) => (
          <div
            key={name}
            className="py-1 text-center font-ui text-[0.625rem] font-semibold uppercase tracking-wider text-ink-400"
          >
            <span className="hidden sm:inline">{name.slice(0, 3)}</span>
            <span className="sm:hidden">{WEEKDAY_INITIALS[index]}</span>
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((date, index) => {
          if (!date) return <div key={`blank-${index}`} />;

          const info = byDate.get(date);
          const dayNumber = Number(date.slice(8, 10));
          const isSelected = date === selectedDate;
          const isToday = date === todayKey;
          const isPast = date < todayKey;
          const unavailable = disabled || isPast || !info?.bookable;

          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelect(date)}
              disabled={unavailable}
              aria-pressed={isSelected}
              aria-label={`${dayNumber} ${MONTHS[month.month]} ${month.year}${
                unavailable ? " — unavailable" : ""
              }${isToday ? " (today)" : ""}`}
              className={cn(
                "relative flex h-10 w-full items-center justify-center rounded-lg border font-ui text-sm transition-all duration-200 sm:h-11",
                isSelected
                  ? "border-brand-700 bg-brand-700 font-semibold text-white shadow-soft"
                  : unavailable
                    ? "cursor-not-allowed border-transparent bg-cream-100 text-ink-300"
                    : "border-ink-900/10 bg-white text-ink-800 hover:border-brand-700/50 hover:text-brand-700",
                isToday && !isSelected && !unavailable && "border-gold-ink/40",
              )}
            >
              <span className="tabular-nums">{dayNumber}</span>
              {!unavailable && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute bottom-1 h-1 w-1 rounded-full",
                    isSelected ? "bg-white/80" : "bg-gold",
                  )}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend + selection summary */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-ink-900/8 pt-3 font-ui text-[0.6875rem] text-ink-500">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-gold" />
          Open
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm bg-cream-200 ring-1 ring-inset ring-ink-900/10" />
          Unavailable
        </span>
        <span className="text-ink-400">Closed days and past dates cannot be chosen.</span>
      </div>

      {selectedDay && (
        <p className="mt-3 font-body text-xs text-ink-600" aria-live="polite">
          Selected: <span className="font-medium text-ink-900">{selectedDate}</span>
        </p>
      )}
    </div>
  );
}
