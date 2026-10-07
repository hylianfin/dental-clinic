import "server-only";

import { createClient } from "@supabase/supabase-js";

import { isSupabaseAdminConfigured, supabaseEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

/**
 * Privileged client that bypasses RLS.
 *
 * Rules for this file:
 *  - Never import it from a Client Component or anything bundled for the browser.
 *  - Only use it for operations a signed-in staff session cannot perform
 *    (background jobs, notifications, admin user provisioning).
 *  - It returns `null` when `SUPABASE_SERVICE_ROLE_KEY` is absent, so the app
 *    keeps working in local/demo mode.
 */
export function createSupabaseAdminClient() {
  if (!isSupabaseAdminConfigured || !supabaseEnv.url || !supabaseEnv.serviceRoleKey) {
    return null;
  }

  return createClient<Database>(supabaseEnv.url, supabaseEnv.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
