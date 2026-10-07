"use server";

import { revalidatePath } from "next/cache";

import { getStaffOrNull } from "@/lib/auth/require-staff";
import { saveInternalNote, updateAppointmentStatus } from "@/lib/services/appointments";
import { appointmentStatusSchema } from "@/lib/validation/schemas";

/**
 * Admin actions.
 *
 * Every action re-checks the session server-side — a Server Action is a public
 * HTTP endpoint, so hiding the button in the UI is not authorisation.
 */

export async function updateAppointmentStatusAction(formData: FormData): Promise<void> {
  const staff = await getStaffOrNull();
  if (!staff) return;

  const id = String(formData.get("id") ?? "");
  const status = appointmentStatusSchema.safeParse(String(formData.get("status") ?? ""));

  if (!id || !status.success) return;

  await updateAppointmentStatus(id, status.data);
  revalidatePath("/admin");
  revalidatePath("/admin/appointments");
}

/**
 * Saves the staff-only note for an appointment.
 *
 * Declared as a plain `(formData) => Promise<void>` action on purpose: the form
 * then works without JavaScript (progressive enhancement), and the note is
 * never shown to the patient.
 */
export async function saveInternalNoteAction(formData: FormData): Promise<void> {
  const staff = await getStaffOrNull();
  if (!staff) return;

  const id = String(formData.get("id") ?? "");
  const note = String(formData.get("internalNote") ?? "");
  if (!id) return;

  await saveInternalNote(id, note);
  revalidatePath("/admin");
  revalidatePath("/admin/appointments");
}

