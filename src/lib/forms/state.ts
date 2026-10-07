import type { ActionResult } from "@/lib/booking/types";

/**
 * Shared form state.
 *
 * These live outside the `"use server"` action modules on purpose: a
 * `"use server"` file may only export async functions, so an initial-state
 * object exported from one breaks the module for every client component that
 * imports it (`useActionState` needs the value at render time).
 */

export interface FormState extends ActionResult {
  /** Populated on success so the UI can show a confirmation panel. */
  reference?: string;
  whenLabel?: string;
  serviceTitle?: string;
  emailsSent?: boolean;
  retryAfterSeconds?: number;
}

export const initialFormState: FormState = { ok: false, message: "" };

export interface AuthFormState {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
}

export const initialAuthState: AuthFormState = { ok: false, message: "" };
