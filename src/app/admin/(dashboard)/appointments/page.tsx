import Link from "next/link";

import { AppointmentRow } from "@/components/admin/AppointmentRow";
import { Badge, EmptyState } from "@/components/ui/primitives";
import { bookingConfig } from "@/lib/booking/config";
import { dateKeyInTimeZone } from "@/lib/booking/time";
import { listAppointmentsForAdmin } from "@/lib/services/appointments";
import { cn } from "@/lib/utils";

export const metadata = { title: "Appointments" };

const FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Awaiting confirmation" },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
] as const;

export default async function AdminAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const [{ status }, { records, demoMode }] = await Promise.all([
    searchParams,
    listAppointmentsForAdmin(),
  ]);

  const activeFilter = FILTERS.some((filter) => filter.key === status) ? status! : "all";
  const filtered =
    activeFilter === "all" ? records : records.filter((record) => record.status === activeFilter);

  // Group by clinic-local day for a readable schedule.
  const grouped = filtered.reduce<Map<string, typeof filtered>>((map, record) => {
    const key = dateKeyInTimeZone(new Date(record.startsAt), bookingConfig.timeZone);
    const existing = map.get(key) ?? [];
    existing.push(record);
    map.set(key, existing);
    return map;
  }, new Map());

  const todayKey = dateKeyInTimeZone(new Date(), bookingConfig.timeZone);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl text-ink-900">Appointments</h1>
          <p className="mt-2 font-body text-sm text-ink-600">
            Times are shown in the clinic time zone ({bookingConfig.timeZone}).
          </p>
        </div>
        <Badge tone={demoMode ? "warning" : "success"}>
          {demoMode ? "Demo data" : "Live data"}
        </Badge>
      </header>

      <nav aria-label="Filter appointments" className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const count =
            filter.key === "all"
              ? records.length
              : records.filter((record) => record.status === filter.key).length;
          const active = filter.key === activeFilter;

          return (
            <Link
              key={filter.key}
              href={filter.key === "all" ? "/admin/appointments" : `/admin/appointments?status=${filter.key}`}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex items-center gap-2 rounded-pill border px-4 py-2 font-ui text-sm transition-colors",
                active
                  ? "border-brand-700 bg-brand-700 text-white"
                  : "border-ink-900/12 bg-white text-ink-700 hover:border-brand-700/40 hover:text-brand-700",
              )}
            >
              {filter.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[0.625rem] font-semibold",
                  active ? "bg-white/20 text-white" : "bg-ink-900/6 text-ink-500",
                )}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </nav>

      {filtered.length === 0 ? (
        <EmptyState
          title="No appointments to show"
          description="There are no appointments matching this filter. Patient requests submitted through the website appear here immediately."
        />
      ) : (
        <div className="space-y-8">
          {[...grouped.entries()].map(([dateKey, dayRecords]) => (
            <section key={dateKey} aria-labelledby={`day-${dateKey}`}>
              <h2
                id={`day-${dateKey}`}
                className="mb-3 flex items-center gap-3 font-heading text-xl text-ink-900"
              >
                {new Intl.DateTimeFormat("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  timeZone: bookingConfig.timeZone,
                }).format(new Date(`${dateKey}T12:00:00Z`))}
                {dateKey === todayKey && <Badge tone="brand">Today</Badge>}
                <span className="font-ui text-xs font-normal text-ink-400">
                  {dayRecords.length} appointment{dayRecords.length === 1 ? "" : "s"}
                </span>
              </h2>

              <ul className="space-y-3">
                {dayRecords.map((record) => (
                  <li key={record.id}>
                    <AppointmentRow record={record} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
