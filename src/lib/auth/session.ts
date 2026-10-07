import "server-only";

import { cookies } from "next/headers";

import {
  DEMO_SESSION_COOKIE,
  verifyDemoSession,
  type DemoSessionPayload,
} from "@/lib/auth/demo-session";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { StaffRole } from "@/lib/supabase/types";

/**
 * Authentication & authorisation for `/admin`.
 *
 * Two modes, never mixed:
 *  1. **Supabase configured** → real Supabase Auth (email + password) and a row
 *     in `staff_profiles`. Users without an active staff row are refused, even
 *     if their Supabase account is valid.
 *  2. **Supabase NOT configured** → the dashboard is in demo mode and only
 *     opens when `ADMIN_DEMO_ACCESS=true` has been set deliberately. Otherwise
 *     the admin area shows setup instructions instead of pretending to be
 *     secured.
 *
 * Every admin page and Server Action re-checks access server-side; middleware
 * is only the first, cheap gate.
 */

export interface StaffSession {
  userId: string;
  email: string;
  fullName: string;
  role: StaffRole;
  /** `true` when the session came from the signed demo cookie. */
  isDemo: boolean;
}

export type AdminAccess =
  | { kind: "staff"; session: StaffSession }
  | { kind: "demo"; session: StaffSession }
  | { kind: "unauthenticated" }
  /** Signed in with Supabase, but not provisioned as clinic staff. */
  | { kind: "not-staff"; email: string }
  | { kind: "not-configured" }
  /** Supabase configured, demo mode requested — ignored for safety. */
  | { kind: "demo-disabled" };

export function isDemoAccessEnabled(): boolean {
  return process.env.ADMIN_DEMO_ACCESS?.trim().toLowerCase() === "true";
}

async function readDemoSession(): Promise<DemoSessionPayload | null> {
  if (!isDemoAccessEnabled() || isSupabaseConfigured) return null;
  const store = await cookies();
  return verifyDemoSession(store.get(DEMO_SESSION_COOKIE)?.value);
}

export async function getAdminAccess(): Promise<AdminAccess> {
  if (!isSupabaseConfigured) {
    const demo = await readDemoSession();
    if (demo) {
      return {
        kind: "demo",
        session: {
          userId: "demo-user",
          email: demo.email,
          fullName: demo.name,
          role: demo.role,
          isDemo: true,
        },
      };
    }
    return { kind: "not-configured" };
  }

  let supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  try {
    supabase = await createSupabaseServerClient();
  } catch {
    return { kind: "not-configured" };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { kind: "unauthenticated" };

  const { data: profile } = await supabase
    .from("staff_profiles")
    .select("full_name, role, active")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile || !profile.active) {
    return { kind: "not-staff", email: user.email ?? "unknown" };
  }

  return {
    kind: "staff",
    session: {
      userId: user.id,
      email: user.email ?? "",
      fullName: profile.full_name,
      role: profile.role,
      isDemo: false,
    },
  };
}
