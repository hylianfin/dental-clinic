"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import {
  DEMO_SESSION_COOKIE,
  DEMO_SESSION_MAX_AGE_SECONDS,
  signDemoSession,
} from "@/lib/auth/demo-session";
import { isDemoAccessEnabled } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fieldErrorsFrom, safeRedirectPath, staffSignInSchema } from "@/lib/validation/schemas";
import type { AuthFormState } from "@/lib/forms/state";

/** Email + password sign-in (Supabase Auth). */
export async function signInAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!isSupabaseConfigured) {
    return {
      ok: false,
      message: "Supabase is not configured in this environment, so sign-in is unavailable.",
    };
  }

  const parsed = staffSignInSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    redirectTo: String(formData.get("redirectTo") ?? "/admin"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please check your details.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    // Deliberately generic: do not reveal whether the account exists.
    return { ok: false, message: "Those credentials were not accepted." };
  }

  revalidatePath("/admin", "layout");
  redirect(safeRedirectPath(parsed.data.redirectTo));
}

export async function signOutAction(): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      const supabase = await createSupabaseServerClient();
      await supabase.auth.signOut();
    } catch {
      // Fall through to cookie cleanup.
    }
  }

  const store = await cookies();
  store.delete(DEMO_SESSION_COOKIE);
  revalidatePath("/admin", "layout");
  redirect("/admin/login");
}

/**
 * Starts the offline demo session.
 *
 * Only reachable when Supabase is NOT configured **and** `ADMIN_DEMO_ACCESS=true`.
 * It establishes a signed cookie; it is not a security boundary and the UI says
 * so explicitly.
 */
export async function startDemoSessionAction(): Promise<void> {
  if (isSupabaseConfigured || !isDemoAccessEnabled()) {
    redirect("/admin/login?reason=setup-required");
  }

  const token = await signDemoSession({
    email: "demo@example.com",
    name: "Demo operator",
    role: "admin",
    exp: Math.floor(Date.now() / 1000) + DEMO_SESSION_MAX_AGE_SECONDS,
  });

  const store = await cookies();
  store.set(DEMO_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DEMO_SESSION_MAX_AGE_SECONDS,
  });

  revalidatePath("/admin", "layout");
  redirect("/admin");
}
