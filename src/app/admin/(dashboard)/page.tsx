import Link from "next/link";
import {
  RiCalendarCheckLine,
  RiChat3Line,
  RiErrorWarningLine,
  RiTimerLine,
} from "react-icons/ri";

import { ReadinessPanel } from "@/components/admin/ReadinessPanel";
import { StatCard } from "@/components/admin/StatCard";
import { AppointmentRow } from "@/components/admin/AppointmentRow";
import { EmptyState, StatusBadge } from "@/components/ui/primitives";
import { bookingConfig } from "@/lib/booking/config";
import { dateKeyInTimeZone, formatInstant } from "@/lib/booking/time";
import { getStaffOrNull } from "@/lib/auth/require-staff";
import { listAppointmentsForAdmin } from "@/lib/services/appointments";
import { listContactMessagesForAdmin } from "@/lib/services/contact";

export const metadata = { title: "Overview" };

export default async function AdminOverviewPage() {
  const [session, { records, demoMode }, { records: messages }] = await Promise.all([
    getStaffOrNull(),
    listAppointmentsForAdmin(),
    listContactMessagesForAdmin(),
  ]);

  const unreadMessages = messages.filter((message) => !message.read).length;

  const todayKey = dateKeyInTimeZone(new Date(), bookingConfig.timeZone);
  const today = records.filter(
    (record) => dateKeyInTimeZone(new Date(record.startsAt), bookingConfig.timeZone) === todayKey,
  );
  const pending = records.filter((record) => record.status === "pending");
  const upcoming = records
    .filter((record) => new Date(record.startsAt) >= new Date() && record.status !== "cancelled")
    .slice(0, 6);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-heading text-3xl text-ink-900">
          Good day{session?.fullName ? `, ${session.fullName.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-2 font-body text-sm text-ink-600">
          Everything happening at the clinic today, plus what is still missing before launch.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Today"
          value={today.length}
          hint={`Clinic time zone: ${bookingConfig.timeZone}`}
          tone="brand"
          icon={<RiCalendarCheckLine className="h-5 w-5" />}
          href="#today"
        />
        <StatCard
          label="Awaiting confirmation"
          value={pending.length}
          hint="Requests that need a decision"
          tone={pending.length > 0 ? "warning" : "default"}
          icon={<RiTimerLine className="h-5 w-5" />}
          href="/admin/appointments?status=pending"
        />
        <StatCard
          label="Upcoming (7 days)"
          value={
            records.filter(
              (record) =>
                new Date(record.startsAt) <= new Date(Date.now() + 7 * 86_400_000) &&
                new Date(record.startsAt) >= new Date(),
            ).length
          }
          hint="Confirmed and pending"
          icon={<RiCalendarCheckLine className="h-5 w-5" />}
        />
        <StatCard
          label="Unread messages"
          value={unreadMessages}
          hint={`${messages.length} in the inbox`}
          tone={unreadMessages > 0 ? "warning" : "default"}
          icon={<RiChat3Line className="h-5 w-5" />}
          href="/admin/messages"
        />
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-8">
          <section id="today" aria-labelledby="today-heading" className="card p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 id="today-heading" className="font-heading text-xl text-ink-900">
                Today&apos;s schedule
              </h2>
              <Link
                href="/admin/appointments"
                className="font-ui text-sm text-brand-700 hover:text-brand-800"
              >
                All appointments →
              </Link>
            </div>

            {today.length === 0 ? (
              <div className="mt-5">
                <EmptyState
                  title="Nothing booked for today"
                  description="New patient requests will appear here as soon as they are submitted."
                />
              </div>
            ) : (
              <ul className="mt-5 divide-y divide-ink-900/8">
                {today.map((record) => (
                  <li key={record.id} className="py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-ui text-sm font-medium text-ink-900">
                          {formatInstant(record.startsAt, bookingConfig.timeZone, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          · {record.patientName}
                        </p>
                        <p className="mt-1 font-body text-xs text-ink-500">
                          {record.serviceTitle ?? "Treatment not specified"}
                          {record.isNewPatient && " · new patient"}
                        </p>
                      </div>
                      <StatusBadge status={record.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="upcoming-heading" className="card p-6">
            <h2 id="upcoming-heading" className="font-heading text-xl text-ink-900">
              Next appointments
            </h2>

            {upcoming.length === 0 ? (
              <div className="mt-5">
                <EmptyState
                  title="No upcoming appointments"
                  description="Once patients request appointments they will be listed here for confirmation."
                />
              </div>
            ) : (
              <ul className="mt-5 space-y-3">
                {upcoming.map((record) => (
                  <li key={record.id}>
                    <AppointmentRow record={record} compact />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-8">
          <ReadinessPanel />

          <section className="card p-6">
            <h2 className="flex items-center gap-2 font-heading text-xl text-ink-900">
              <RiErrorWarningLine aria-hidden="true" className="h-5 w-5 text-amber-500" />
              Reminders
            </h2>
            <ul className="mt-4 space-y-3 font-body text-sm leading-relaxed text-ink-600">
              <li className="flex gap-3">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-ink" />
                {demoMode
                  ? "Supabase is not connected: bookings and messages live in a local file and are not backed up."
                  : "Supabase is connected — remember to back up the project regularly."}
              </li>
              <li className="flex gap-3">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-ink" />
                Confirmations depend on outbound email. Check the readiness list for its status.
              </li>
              <li className="flex gap-3">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-ink" />
                Staff access is controlled by the <code className="font-mono text-xs">staff_profiles</code>{" "}
                table — deactivate a row to revoke access immediately.
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
