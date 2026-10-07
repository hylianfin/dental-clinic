import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { isSupabaseConfigured, supabaseEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

export interface SessionUpdateResult {
  response: NextResponse;
  /** Authenticated user id, or `null` when signed out / Supabase not configured. */
  userId: string | null;
}

/**
 * Refreshes the Supabase auth session on every request and writes the rotated
 * cookies back onto the response.
 *
 * This must run for the `/admin` routes: Server Components cannot set cookies,
 * so without it sessions expire unpredictably.
 */
export async function updateSession(request: NextRequest): Promise<SessionUpdateResult> {
  let response = NextResponse.next({ request });

  if (!isSupabaseConfigured || !supabaseEnv.url || !supabaseEnv.anonKey) {
    return { response, userId: null };
  }

  const supabase = createServerClient<Database>(supabaseEnv.url, supabaseEnv.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Do not remove: this call is what triggers the token refresh.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, userId: user?.id ?? null };
}
