"use client";

import { useActionState } from "react";
import { RiCheckLine, RiLoader4Line, RiSendPlaneLine } from "react-icons/ri";

import { Alert } from "@/components/ui/primitives";
import { submitContactMessage } from "@/lib/actions/public-booking";
import { initialFormState, type FormState } from "@/lib/forms/state";
import { cn } from "@/lib/utils";

const SUBJECTS = [
  { value: "appointment", label: "Booking an appointment" },
  { value: "consultation", label: "Question about a treatment" },
  { value: "inquiry", label: "General enquiry" },
  { value: "other", label: "Something else" },
];

/** Contact form wired to a Server Action with inline validation feedback. */
export function ContactForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    submitContactMessage,
    initialFormState,
  );

  if (state.ok) {
    return (
      <div className="space-y-5">
        <span
          aria-hidden="true"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-700/10 text-brand-800"
        >
          <RiCheckLine className="h-7 w-7" />
        </span>
        <h2 className="font-heading text-2xl text-ink-900">Message sent</h2>
        <p className="font-body text-sm leading-relaxed text-ink-600">{state.message}</p>

        {state.demoMode && (
          <Alert tone="warning" title="Demo mode — stored locally">
            Supabase is not configured, so this message was saved to the local demo store and can be
            read in the admin dashboard. The clinic is not notified until the database and email are
            connected.
          </Alert>
        )}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.message && !state.ok && (
        <Alert tone="danger" title="Please check the form">
          {state.message}
        </Alert>
      )}

      {/* Honeypot */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label htmlFor="contact-company">Company (leave empty)</label>
        <input id="contact-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="name"
          label="Full name"
          autoComplete="name"
          required
          error={state.fieldErrors?.name}
        />
        <TextField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          error={state.fieldErrors?.email}
        />
        <TextField
          id="phone"
          label="Phone (optional)"
          type="tel"
          autoComplete="tel"
          error={state.fieldErrors?.phone}
        />

        <div>
          <label htmlFor="subject" className="label">
            Subject
          </label>
          <select
            id="subject"
            name="subject"
            required
            defaultValue="appointment"
            className={cn("field", state.fieldErrors?.subject && "field-error")}
            aria-invalid={state.fieldErrors?.subject ? true : undefined}
          >
            {SUBJECTS.map((subject) => (
              <option key={subject.value} value={subject.value}>
                {subject.label}
              </option>
            ))}
          </select>
          {state.fieldErrors?.subject && (
            <p className="error-text">{state.fieldErrors.subject}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="message" className="label">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          maxLength={2000}
          placeholder="Tell the clinic how it can help. Please do not include sensitive medical details in this form."
          className={cn("field resize-none", state.fieldErrors?.message && "field-error")}
          aria-invalid={state.fieldErrors?.message ? true : undefined}
        />
        {state.fieldErrors?.message && <p className="error-text">{state.fieldErrors.message}</p>}
      </div>

      <button type="submit" className="btn-primary w-full sm:w-auto" disabled={pending}>
        {pending ? (
          <RiLoader4Line aria-hidden="true" className="h-4 w-4 animate-spin" />
        ) : (
          <RiSendPlaneLine aria-hidden="true" className="h-4 w-4" />
        )}
        {pending ? "Sending…" : "Send message"}
      </button>

      <p className="font-body text-xs leading-relaxed text-ink-500">
        This form is not monitored around the clock. For urgent dental problems, call the clinic.
        Privacy policy wording is still to be confirmed.
      </p>
    </form>
  );
}

function TextField({
  id,
  label,
  type = "text",
  required,
  autoComplete,
  error,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn("field", error && "field-error")}
      />
      {error && (
        <p id={`${id}-error`} className="error-text">
          {error}
        </p>
      )}
    </div>
  );
}
