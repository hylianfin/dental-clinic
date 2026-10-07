"use client";

import { createBrowserClient } from "@supabase/ssr";

import { requireSupabaseEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

/**
 * Browser Supabase client (RLS enforced, anon key only).
 *
 * Memoised per browser session — Supabase clients hold realtime websockets, so
 * creating a new one on every render leaks connections.
 */
let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function createSupabaseBrowserClient() {
  if (browserClient) return browserClient;

  const { url, anonKey } = requireSupabaseEnv();
  browserClient = createBrowserClient<Database>(url, anonKey);
  return browserClient;
}

/** Returns `null` instead of throwing — used by UI that degrades gracefully. */
export function tryCreateSupabaseBrowserClient() {
  try {
    return createSupabaseBrowserClient();
  } catch {
    return null;
  }
}
