import { z } from "zod";

/**
 * Validation shared by the browser (instant feedback) and the server
 * (authoritative check). Server-side validation is never skipped, even when
 * the client already validated.
 */

const nameField = z
  .string()
  .trim()
  .min(2, "Please enter your full name.")
  .max(120, "That name is too long.");

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .email("Please enter a valid email address.")
  .max(200, "That email address is too long.");

/** Permissive international phone: optional +, digits, spaces, dashes, dots, parens. */
const phoneField = z
  .string()
  .trim()
  .min(6, "Please enter a phone number.")
  .max(32, "That phone number is too long.")
  .regex(/^\+?[\d\s().-]{6,32}$/, "Please enter a valid phone number.");

export const appointmentRequestSchema = z.object({
  serviceId: z.string().trim().min(1, "Please choose a service."),
  date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a date."),
  time: z
    .string()
    .trim()
    .regex(/^\d{2}:\d{2}$/, "Please choose a time."),
  patientName: nameField,
  patientEmail: emailField,
  patientPhone: phoneField,
  isNewPatient: z.boolean(),
  notes: z.string().trim().max(1000, "Please keep notes under 1000 characters.").optional(),
  /** Hidden field — must stay empty. Bots fill it in. */
  company: z.string().max(0).optional(),
});

export type AppointmentRequestInput = z.infer<typeof appointmentRequestSchema>;

export const contactMessageSchema = z.object({
  name: nameField,
  email: emailField,
  phone: z.union([phoneField, z.literal("")]).optional(),
  subject: z.enum(["appointment", "consultation", "inquiry", "other"], {
    message: "Please choose a subject.",
  }),
  message: z
    .string()
    .trim()
    .min(10, "Please give us a little more detail (at least 10 characters).")
    .max(2000, "Please keep your message under 2000 characters."),
  company: z.string().max(0).optional(),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;

export const appointmentStatusSchema = z.enum([
  "pending",
  "confirmed",
  "cancelled",
  "completed",
  "no_show",
]);

export const staffSignInSchema = z.object({
  email: emailField,
  password: z.string().min(8, "Password must be at least 8 characters."),
  redirectTo: z.string().optional(),
});

/** Flattens a ZodError into `{ field: message }` for form rendering. */
export function fieldErrorsFrom(error: {
  issues: ReadonlyArray<{ path: ReadonlyArray<PropertyKey>; message: string }>;
}): Record<string, string> {
  const output: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? String(issue.path[0]) : "form";
    if (!output[key]) output[key] = issue.message;
  }
  return output;
}

/** Safe redirect target — blocks protocol-relative / absolute URLs (open redirect). */
export function safeRedirectPath(value: unknown, fallback = "/admin"): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}
