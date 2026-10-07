"use client";

import { useActionState } from "react";
import { RiLoader4Line, RiLockLine, RiPlayCircleLine } from "react-icons/ri";

import { Alert } from "@/components/ui/primitives";
import { signInAction, startDemoSessionAction } from "@/lib/actions/auth";
import { initialAuthState, type AuthFormState } from "@/lib/forms/state";
import { cn } from "@/lib/utils";

/**
 * Two sign-in modes:
 *  - `demoMode`: starts a signed demo session (no credentials, dev only).
 *  - default: real Supabase email + password authentication.
 */
export function LoginForm({
  redirectTo = "/admin",
  demoMode = false,
}: {
  redirectTo?: string;
  demoMode?: boolean;
}) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    signInAction,
    initialAuthState,
  );

  if (demoMode) {
    return (
      <form action={startDemoSessionAction} className="mt-5">
        <button type="submit" className="btn-primary w-full">
          <RiPlayCircleLine aria-hidden="true" className="h-4 w-4" />
          Open the demo dashboard
        </button>
        <p className="mt-3 font-body text-xs text-ink-500">
          No password required. Sample appointments and messages are used, and bookings are stored
          locally.
        </p>
      </form>
    );
  }

  return (
    <form action={formAction} className="mt-6 space-y-5" noValidate>
      <input type="hidden" name="redirectTo" value={redirectTo} />

      {state.message && !state.ok && (
        <Alert tone="danger">{state.message}</Alert>
      )}

      <div>
        <label htmlFor="email" className="label">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          aria-invalid={state.fieldErrors?.email ? true : undefined}
          className={cn("field", state.fieldErrors?.email && "field-error")}
        />
        {state.fieldErrors?.email && <p className="error-text">{state.fieldErrors.email}</p>}
      </div>

      <div>
        <label htmlFor="password" className="label">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          aria-invalid={state.fieldErrors?.password ? true : undefined}
          className={cn("field", state.fieldErrors?.password && "field-error")}
        />
        {state.fieldErrors?.password && <p className="error-text">{state.fieldErrors.password}</p>}
      </div>

      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? (
          <RiLoader4Line aria-hidden="true" className="h-4 w-4 animate-spin" />
        ) : (
          <RiLockLine aria-hidden="true" className="h-4 w-4" />
        )}
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
