import { RiMailLine, RiPhoneLine, RiUserLine } from "react-icons/ri";

import { Badge, StatusBadge } from "@/components/ui/primitives";
import { saveInternalNoteAction, updateAppointmentStatusAction } from "@/lib/actions/admin-appointments";
import { bookingConfig } from "@/lib/booking/config";
import { minutesBetween } from "@/lib/booking/time";
import { relativeDayLabel } from "@/lib/utils";
import type { BookingRecord } from "@/lib/booking/types";

const STATUSES = ["pending", "confirmed", "completed", "cancelled", "no_show"] as const;

function timeLabel(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: bookingConfig.timeZone,
  }).format(new Date(iso));
}

/**
 * A single appointment.
 *
 * Status changes and internal notes use plain `<form>` posts to Server Actions,
 * so the dashboard keeps working even if JavaScript fails to load.
 */
export function AppointmentRow({
  record,
  compact = false,
}: {
  record: BookingRecord;
  compact?: boolean;
}) {
  const startsInFuture = new Date(record.startsAt) >= new Date();
  const duration = minutesBetween(record.startsAt, record.endsAt);

  const patientLine = (
    <span className="flex flex-wrap items-center gap-x-4 gap-y-1 font-body text-xs text-ink-500">
      <span className="inline-flex items-center gap-1.5">
        <RiMailLine aria-hidden="true" className="h-3.5 w-3.5" />
        <a href={`mailto:${record.patientEmail}`} className="hover:text-brand-700">
          {record.patientEmail}
        </a>
      </span>
      <span className="inline-flex items-center gap-1.5">
        <RiPhoneLine aria-hidden="true" className="h-3.5 w-3.5" />
        <a href={`tel:${record.patientPhone.replace(/\s+/g, "")}`} className="hover:text-brand-700">
          {record.patientPhone}
        </a>
      </span>
    </span>
  );

  return (
    <div className="rounded-xl border border-ink-900/10 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-ui text-sm font-medium text-ink-900">{timeLabel(record.startsAt)}</span>
            <span className="font-ui text-xs text-ink-400">
              {relativeDayLabel(record.startsAt)} · {duration} min
            </span>
          </div>

          <p className="flex flex-wrap items-center gap-2 font-body text-sm text-ink-800">
            <RiUserLine aria-hidden="true" className="h-4 w-4 text-gold-ink" />
            {record.patientName}
            {record.isNewPatient && <Badge tone="brand">New patient</Badge>}
          </p>

          <p className="font-body text-xs text-ink-500">
            {record.serviceTitle ?? "Treatment not specified"} · ref{" "}
            <span className="font-mono">{record.reference}</span>
          </p>

          {patientLine}
        </div>

        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={record.status} />
          {record.source === "demo-seed" && <Badge tone="neutral">sample</Badge>}
        </div>
      </div>

      {!compact && (
        <div className="mt-4 space-y-4 border-t border-ink-900/8 pt-4">
          {record.notes && (
            <div>
              <p className="font-ui text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-500">
                Patient notes
              </p>
              <p className="mt-1 font-body text-sm leading-relaxed text-ink-700">{record.notes}</p>
            </div>
          )}

          <div className="flex flex-wrap items-end gap-4">
            <form action={updateAppointmentStatusAction} className="flex items-end gap-2">
              <input type="hidden" name="id" value={record.id} />
              <div>
                <label
                  htmlFor={`status-${record.id}`}
                  className="font-ui text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-500"
                >
                  Status
                </label>
                <select
                  id={`status-${record.id}`}
                  name="status"
                  defaultValue={record.status}
                  className="field mt-1 w-40 py-2 text-sm"
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn-outline px-4 py-2 text-xs">
                Save
              </button>
            </form>

            {!startsInFuture && (
              <p className="font-body text-xs text-ink-400">
                This appointment is in the past.
              </p>
            )}
          </div>

          <details className="group">
            <summary className="cursor-pointer font-ui text-xs font-semibold uppercase tracking-wider text-ink-500 hover:text-brand-700">
              Internal note {record.internalNote ? "(saved)" : ""}
            </summary>
            <form action={saveInternalNoteAction} className="mt-3 space-y-3">
              <input type="hidden" name="id" value={record.id} />
              <textarea
                name="internalNote"
                rows={3}
                defaultValue={record.internalNote ?? ""}
                placeholder="Staff-only note — never shown to the patient."
                className="field resize-none"
              />
              <button type="submit" className="btn-outline px-4 py-2 text-xs">
                Save note
              </button>
            </form>
          </details>
        </div>
      )}
    </div>
  );
}
