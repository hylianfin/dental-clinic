import "server-only";

import { bookingConfig } from "@/lib/booking/config";
import { generateAppointmentReference } from "@/lib/booking/reference";
import { addMinutes, dateKeyInTimeZone, formatInstant } from "@/lib/booking/time";
import type { ActionResult, BookingRecord, DashboardStats } from "@/lib/booking/types";
import { createDemoAppointment, listDemoAppointments, updateDemoAppointment } from "@/lib/data/appointments";
import { listDemoContactMessages } from "@/lib/data/contact-messages";
import { appUrl, isEmailConfigured, isSupabaseConfigured } from "@/lib/env";
import { checkSlotBookable } from "@/lib/services/availability";
import {
  appointmentClinicNotificationEmail,
  appointmentRequestPatientEmail,
  sendEmail,
} from "@/lib/services/email";
import { getServiceById } from "@/lib/queries/site";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppointmentStatus } from "@/lib/supabase/types";

/**
 * Appointment service.
 *
 * Flow for a new request:
 *   1. validate input (done by the caller with the shared Zod schema)
 *   2. re-check the slot against live availability — the client is never trusted
 *   3. persist (Supabase insert under RLS, or the demo store)
 *   4. notify patient + clinic (best-effort; never blocks the booking)
 */

export interface CreateAppointmentInput {
  serviceId: string;
  date: string;
  time: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  isNewPatient: boolean;
  notes?: string;
}

export interface CreateAppointmentResult extends ActionResult {
  /** ISO instant of the requested slot (for the confirmation screen). */
  startsAt?: string;
  /** Human label in clinic time. */
  whenLabel?: string;
  serviceTitle?: string;
  emailsSent?: boolean;
}

export async function createAppointmentRequest(
  input: CreateAppointmentInput,
): Promise<CreateAppointmentResult> {
  const service = await getServiceById(input.serviceId);
  if (!service) {
    return {
      ok: false,
      message: "That service is no longer available. Please pick another one.",
      fieldErrors: { serviceId: "Unknown service." },
    };
  }

  // Authoritative availability check — the client's view is never trusted.
  const slotCheck = await checkSlotBookable(
    input.date,
    input.time,
    service.durationMinutes,
  );

  if (!slotCheck.ok || !slotCheck.startsAt || !slotCheck.endsAt) {
    const reason = slotCheck.reason ?? "That time is not available. Please choose another slot.";
    const isClosedDay = reason.toLowerCase().includes("closed");
    return {
      ok: false,
      message: reason,
      fieldErrors: isClosedDay
        ? { date: "The clinic is closed on this day." }
        : { time: "Not available." },
    };
  }

  const startsAt = slotCheck.startsAt;
  const endsAt = addMinutes(new Date(startsAt), service.durationMinutes).toISOString();
  const reference = generateAppointmentReference();
  const notes = input.notes?.trim() ? input.notes.trim() : null;

  const record: BookingRecord = {
    id: globalThis.crypto.randomUUID(),
    reference,
    serviceId: service.id,
    serviceTitle: service.title,
    patientName: input.patientName,
    patientEmail: input.patientEmail,
    patientPhone: input.patientPhone,
    startsAt,
    endsAt,
    status: "pending",
    isNewPatient: input.isNewPatient,
    notes,
    internalNote: null,
    source: isSupabaseConfigured ? "website" : "website-demo",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  let persistedViaSupabase = false;

  if (isSupabaseConfigured) {
    try {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.from("appointments").insert({
        reference: record.reference,
        service_id: service.id,
        patient_name: record.patientName,
        patient_email: record.patientEmail,
        patient_phone: record.patientPhone,
        starts_at: record.startsAt,
        ends_at: record.endsAt,
        status: "pending",
        is_new_patient: record.isNewPatient,
        notes: record.notes,
        source: "website",
      });

      if (error) {
        // 23505 = unique_violation (duplicate reference)
        // 23P01 = exclusion_violation (the DB-level double-booking guard fired)
        // Both mean the slot was taken between the availability check and the
        // insert — i.e. two people raced for the same time.
        if (error.code === "23505" || error.code === "23P01") {
          return {
            ok: false,
            message: "That time has just been taken. Please choose another slot.",
            fieldErrors: { time: "No longer available." },
          };
        }
        // RLS rejection or schema mismatch: fall through to the demo store so the
        // request is never lost, and tell the clinic it happened.
        console.error("[appointments] Supabase insert failed:", error.message);
      } else {
        persistedViaSupabase = true;
      }
    } catch (error) {
      console.error("[appointments] Supabase unavailable:", error);
    }
  }

  if (!persistedViaSupabase) {
    await createDemoAppointment(record);
  }

  // Notifications are best-effort: a mail failure must not lose the booking.
  const whenLabel = formatInstant(startsAt, bookingConfig.timeZone, {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  const [patientEmail, clinicEmail] = await Promise.all([
    sendEmail({
      ...appointmentRequestPatientEmail({
        patientName: record.patientName,
        reference,
        serviceTitle: service.title,
        whenLabel,
      }),
      to: record.patientEmail,
    }),
    sendEmail({
      ...appointmentClinicNotificationEmail({
        reference,
        patientName: record.patientName,
        patientEmail: record.patientEmail,
        patientPhone: record.patientPhone,
        serviceTitle: service.title,
        whenLabel,
        isNewPatient: record.isNewPatient,
        notes: record.notes,
      }),
      to: process.env.CLINIC_NOTIFICATION_EMAIL ?? record.patientEmail,
    }),
  ]);

  return {
    ok: true,
    message: `Request received. Your reference is ${reference}.`,
    reference,
    startsAt,
    whenLabel,
    serviceTitle: service.title,
    demoMode: !persistedViaSupabase,
    emailsSent: patientEmail.sent || clinicEmail.sent,
  };
}

/** Admin: every appointment, newest slot first. */
export async function listAppointmentsForAdmin(): Promise<{
  records: BookingRecord[];
  demoMode: boolean;
}> {
  if (!isSupabaseConfigured) {
    const records = await listDemoAppointments();
    return {
      records: [...records].sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
      demoMode: true,
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("appointments")
      .select(
        "id, reference, service_id, patient_name, patient_email, patient_phone, starts_at, ends_at, status, is_new_patient, notes, internal_note, source, created_at, updated_at, services(title)",
      )
      .order("starts_at", { ascending: true })
      .limit(500);

    if (error || !data) throw new Error(error?.message ?? "No data");

    const records: BookingRecord[] = data.map((row) => ({
      id: row.id,
      reference: row.reference,
      serviceId: row.service_id,
      serviceTitle:
        (row as unknown as { services?: { title?: string } | null }).services?.title ?? null,
      patientName: row.patient_name,
      patientEmail: row.patient_email,
      patientPhone: row.patient_phone,
      startsAt: row.starts_at,
      endsAt: row.ends_at,
      status: row.status,
      isNewPatient: row.is_new_patient,
      notes: row.notes,
      internalNote: row.internal_note,
      source: row.source,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return { records, demoMode: false };
  } catch (error) {
     
    console.error("[appointments] Falling back to demo store:", error);
    const records = await listDemoAppointments();
    return { records, demoMode: true };
  }
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
): Promise<ActionResult> {
  if (isSupabaseConfigured) {
    try {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
      if (error) throw new Error(error.message);
      return { ok: true, message: `Appointment marked as ${status.replace("_", " ")}.` };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : "Could not update the appointment.",
      };
    }
  }

  const updated = await updateDemoAppointment(id, { status });
  return updated
    ? { ok: true, message: `Appointment marked as ${status.replace("_", " ")}.`, demoMode: true }
    : { ok: false, message: "Appointment not found." };
}

export async function saveInternalNote(id: string, note: string): Promise<ActionResult> {
  const trimmed = note.trim().slice(0, 2000);

  if (isSupabaseConfigured) {
    try {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase
        .from("appointments")
        .update({ internal_note: trimmed })
        .eq("id", id);
      if (error) throw new Error(error.message);
      return { ok: true, message: "Note saved." };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : "Could not save the note.",
      };
    }
  }

  const updated = await updateDemoAppointment(id, { internalNote: trimmed });
  return updated
    ? { ok: true, message: "Note saved (demo store).", demoMode: true }
    : { ok: false, message: "Appointment not found." };
}

/** KPI tiles for the dashboard overview. */
export async function getDashboardStats(): Promise<DashboardStats> {
  const { records, demoMode } = await listAppointmentsForAdmin();
  const messages = await listDemoContactMessages();

  const now = new Date();
  const todayKey = dateKeyInTimeZone(now, bookingConfig.timeZone);
  const weekEnd = new Date(now.getTime() + 7 * 86_400_000).toISOString();

  const todayCount = records.filter(
    (record) => dateKeyInTimeZone(new Date(record.startsAt), bookingConfig.timeZone) === todayKey,
  ).length;

  const weekCount = records.filter(
    (record) => record.startsAt <= weekEnd && record.startsAt >= now.toISOString(),
  ).length;

  const pendingCount = records.filter((record) => record.status === "pending").length;
  const decided = records.filter((record) =>
    ["confirmed", "completed"].includes(record.status),
  ).length;

  return {
    todayCount,
    weekCount,
    pendingCount,
    unreadMessages: messages.filter((message) => !message.read).length,
    confirmedRate: records.length === 0 ? 0 : Math.round((decided / records.length) * 100),
    demoMode,
  };
}

export const appointmentEnvSummary = {
  supabase: isSupabaseConfigured,
  email: isEmailConfigured,
  appUrl,
};
