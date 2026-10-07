"use server";

import { headers } from "next/headers";

import type { DayAvailability } from "@/lib/booking/types";
import type { FormState } from "@/lib/forms/state";
import { clientKeyFrom, rateLimit } from "@/lib/rate-limit";
import { createAppointmentRequest } from "@/lib/services/appointments";
import {
  getBookingCalendar,
  getDayAvailability,
  getUpcomingAvailability,
  isDateWithinHorizon,
} from "@/lib/services/availability";
import { createContactMessage } from "@/lib/services/contact";
import { getServiceById } from "@/lib/queries/site";
import {
  appointmentRequestSchema,
  contactMessageSchema,
  fieldErrorsFrom,
} from "@/lib/validation/schemas";

/**
 * Public form endpoints (Server Actions).
 *
 * Security posture:
 *  - Zod validation runs server-side regardless of client checks.
 *  - Rate limited per IP (see `src/lib/rate-limit.ts`).
 *  - Honeypot field `company`: bots that fill it get a fake success.
 *  - The slot is re-validated against live availability before insert.
 */

export interface AvailabilityResponse {
  ok: boolean;
  /** `false` when the clinic has no opening hours configured yet. */
  configured: boolean;
  timeZone: string;
  serviceTitle: string;
  durationMinutes: number;
  days: DayAvailability[];
  message?: string;
}

/**
 * Availability for the booking wizard.
 *
 * All slot generation happens on the server; the browser only receives the
 * resulting times, so the client cannot fabricate a bookable slot.
 */
export async function fetchAvailabilityAction(
  serviceId: string,
  dayCount = 7,
): Promise<AvailabilityResponse> {
  const service = await getServiceById(serviceId);

  if (!service) {
    return {
      ok: false,
      configured: false,
      timeZone: "",
      serviceTitle: "",
      durationMinutes: 0,
      days: [],
      message: "Please choose a treatment to see available times.",
    };
  }

  const preview = await getUpcomingAvailability(service.durationMinutes, dayCount);

  return {
    ok: true,
    configured: preview.configured,
    timeZone: preview.timeZone,
    serviceTitle: service.title,
    durationMinutes: service.durationMinutes,
    days: preview.days,
    message: preview.configured
      ? undefined
      : "The clinic's opening hours are still being confirmed, so online times are not available yet.",
  };
}

export interface DayAvailabilityResponse {
  ok: boolean;
  configured: boolean;
  timeZone: string;
  /** The clinic-time date this response describes. */
  dateKey: string;
  serviceTitle: string;
  durationMinutes: number;
  day: DayAvailability | null;
  message?: string;
}

/**
 * Availability for one specific calendar day.
 *
 * The wizard shows the whole booking horizon up front (server-rendered) and
 * calls this when the patient picks a date, so a 60-day horizon costs one
 * request instead of sixty. The date is validated against the horizon and the
 * clinic's opening hours server-side — the browser cannot ask for a day the
 * clinic is closed.
 */
export async function fetchDayAvailabilityAction(
  serviceId: string,
  dateKey: string,
): Promise<DayAvailabilityResponse> {
  const requestHeaders = await headers();

  // A patient clicking through months can legitimately make many requests, so
  // the ceiling is far higher than for submissions — but it is still bounded.
  const limit = rateLimit(clientKeyFrom(requestHeaders, "availability"), {
    limit: 120,
    windowSeconds: 600,
  });

  const empty = {
    ok: false,
    configured: false,
    timeZone: "",
    dateKey,
    serviceTitle: "",
    durationMinutes: 0,
    day: null,
  } as const;

  if (!limit.ok) {
    return {
      ...empty,
      message: "Too many availability checks. Please wait a moment and try again.",
    };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return { ...empty, message: "Please choose a valid date." };
  }

  const service = await getServiceById(serviceId);

  if (!service) {
    return { ...empty, message: "Please choose a treatment first." };
  }

  const range = await getBookingCalendar();

  if (!range.configured) {
    return {
      ...empty,
      serviceTitle: service.title,
      durationMinutes: service.durationMinutes,
      message: "Online times are not available yet. Please call the clinic.",
    };
  }

  if (!isDateWithinHorizon(dateKey, range.todayKey, range.horizonDays)) {
    return {
      ...empty,
      configured: true,
      timeZone: range.timeZone,
      serviceTitle: service.title,
      durationMinutes: service.durationMinutes,
      message:
        dateKey < range.todayKey
          ? "That date has passed. Please choose a day from today onwards."
          : `Appointments can be requested up to ${range.horizonDays} days ahead.`,
    };
  }

  const day = await getDayAvailability(dateKey, service.durationMinutes);

  if (!day.open) {
    return {
      ...empty,
      configured: true,
      timeZone: range.timeZone,
      serviceTitle: service.title,
      durationMinutes: service.durationMinutes,
      message: "The clinic is closed on that day. Please choose another date.",
    };
  }

  return {
    ok: true,
    configured: true,
    timeZone: range.timeZone,
    dateKey,
    serviceTitle: service.title,
    durationMinutes: service.durationMinutes,
    day,
  };
}

export async function submitAppointmentRequest(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const requestHeaders = await headers();

  const limit = rateLimit(clientKeyFrom(requestHeaders, "booking"), {
    limit: 5,
    windowSeconds: 600,
  });

  if (!limit.ok) {
    return {
      ok: false,
      message: `Too many requests. Please try again in ${Math.ceil(
        limit.retryAfterSeconds / 60,
      )} minute(s), or contact the clinic directly.`,
      retryAfterSeconds: limit.retryAfterSeconds,
    };
  }

  const raw = {
    serviceId: String(formData.get("serviceId") ?? ""),
    date: String(formData.get("date") ?? ""),
    time: String(formData.get("time") ?? ""),
    patientName: String(formData.get("patientName") ?? ""),
    patientEmail: String(formData.get("patientEmail") ?? ""),
    patientPhone: String(formData.get("patientPhone") ?? ""),
    isNewPatient: String(formData.get("isNewPatient") ?? "yes") === "yes",
    notes: String(formData.get("notes") ?? ""),
    company: String(formData.get("company") ?? ""),
  };

  const parsed = appointmentRequestSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please review the highlighted fields.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  // Honeypot tripped — behave exactly like a success so bots do not retry.
  if (parsed.data.company && parsed.data.company.length > 0) {
    return {
      ok: true,
      message: "Request received.",
      reference: "DB-PENDING",
    };
  }

  return createAppointmentRequest({
    serviceId: parsed.data.serviceId,
    date: parsed.data.date,
    time: parsed.data.time,
    patientName: parsed.data.patientName,
    patientEmail: parsed.data.patientEmail,
    patientPhone: parsed.data.patientPhone,
    isNewPatient: parsed.data.isNewPatient,
    notes: parsed.data.notes,
  });
}

export async function submitContactMessage(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const requestHeaders = await headers();

  const limit = rateLimit(clientKeyFrom(requestHeaders, "contact"), {
    limit: 5,
    windowSeconds: 600,
  });

  if (!limit.ok) {
    return {
      ok: false,
      message: "Too many messages sent. Please try again later.",
      retryAfterSeconds: limit.retryAfterSeconds,
    };
  }

  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    subject: String(formData.get("subject") ?? ""),
    message: String(formData.get("message") ?? ""),
    company: String(formData.get("company") ?? ""),
  };

  const parsed = contactMessageSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please review the highlighted fields.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  if (parsed.data.company && parsed.data.company.length > 0) {
    return { ok: true, message: "Message received." };
  }

  return createContactMessage({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    subject: parsed.data.subject,
    message: parsed.data.message,
  });
}
