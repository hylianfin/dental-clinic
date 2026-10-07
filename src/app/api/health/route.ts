import { NextResponse } from "next/server";

import { isEmailConfigured, isSupabaseConfigured, supabaseEnv } from "@/lib/env";

/**
 * Health / configuration endpoint for uptime monitors.
 *
 * Reports only *configuration state* — never credentials, never patient data.
 * `status` is 200 when the app can serve the public site; a missing database is
 * reported as a degraded capability rather than an outage, because the site is
 * designed to keep working on content files and the demo store.
 */
export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      capabilities: {
        database: isSupabaseConfigured,
        auth: isSupabaseConfigured,
        email: isEmailConfigured,
        /** True while the booking flow writes to the local demo store. */
        demoStore: !isSupabaseConfigured,
      },
      configured: {
        supabaseUrl: Boolean(supabaseEnv.url),
        supabaseAnonKey: Boolean(supabaseEnv.anonKey),
        supabaseServiceRole: Boolean(supabaseEnv.serviceRoleKey),
      },
    },
    {
      headers: { "Cache-Control": "no-store" },
    },
  );
}
