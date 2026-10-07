import "server-only";

import type { AppointmentStatus } from "@/lib/supabase/types";
import type { BookingRecord } from "@/lib/booking/types";
import { buildDemoAppointments } from "@/lib/data/demo-seed";
import { readCollection, writeCollection } from "@/lib/data/store";

const FILE = "appointments.json";

/** Statuses that block a slot in the calendar. */
const BLOCKING_STATUSES: AppointmentStatus[] = ["pending", "confirmed"];

export async function listDemoAppointments(): Promise<BookingRecord[]> {
  const records = await readCollection<BookingRecord[]>(FILE, []);
  if (records.length > 0) return records;

  // First run: seed sample records so the dashboard is demonstrable.
  const seeded = buildDemoAppointments();
  await writeCollection(FILE, seeded);
  return seeded;
}

export async function createDemoAppointment(record: BookingRecord): Promise<BookingRecord> {
  const records = await listDemoAppointments();
  const next = [...records, record];
  await writeCollection(FILE, next);
  return record;
}

export async function updateDemoAppointment(
  id: string,
  patch: Partial<Pick<BookingRecord, "status" | "internalNote" | "startsAt" | "endsAt">>,
): Promise<BookingRecord | null> {
  const records = await listDemoAppointments();
  let updated: BookingRecord | null = null;

  const next = records.map((record) => {
    if (record.id !== id) return record;
    updated = { ...record, ...patch, updatedAt: new Date().toISOString() };
    return updated;
  });

  if (updated) await writeCollection(FILE, next);
  return updated;
}

export async function clearDemoAppointments(): Promise<void> {
  await writeCollection(FILE, []);
}

/** Busy intervals used by the availability engine. */
export async function listDemoBusyIntervals(): Promise<
  Array<{ startsAt: string; endsAt: string; reference: string }>
> {
  const records = await listDemoAppointments();
  return records
    .filter((record) => BLOCKING_STATUSES.includes(record.status))
    .map((record) => ({
      startsAt: record.startsAt,
      endsAt: record.endsAt,
      reference: record.reference,
    }));
}
