/**
 * Environment access.
 *
 * The application is designed to boot and render **without** Supabase
 * configured: the public site runs on the content files in `src/content/*` and
 * the booking flow falls back to a clearly-labelled demo store. As soon as the
 * variables below are present, the real integrations activate.
 *
 * See `.env.example` for the full list.
 */

function read(name: string): string | undefined {
  const value = process.env[name];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function isHttpUrl(value: string | undefined): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

const supabaseUrl = read("NEXT_PUBLIC_SUPABASE_URL");
const supabaseAnonKey = read("NEXT_PUBLIC_SUPABASE_ANON_KEY");

export const supabaseEnv = {
  url: isHttpUrl(supabaseUrl) ? supabaseUrl : undefined,
  anonKey: supabaseAnonKey,
  serviceRoleKey: read("SUPABASE_SERVICE_ROLE_KEY"),
} as const;

/** True when the browser/server clients can talk to Supabase. */
export const isSupabaseConfigured: boolean = Boolean(
  supabaseEnv.url && supabaseEnv.anonKey,
);

/** True when privileged server-side operations (admin writes, RLS bypass) are possible. */
export const isSupabaseAdminConfigured: boolean = Boolean(
  supabaseEnv.url && supabaseEnv.serviceRoleKey,
);

/** Absolute site URL used for links in emails and for metadata. */
export const appUrl: string = read("NEXT_PUBLIC_APP_URL") ?? "http://localhost:3000";

/** Outbound email is optional; without it confirmations are logged server-side. */
export const emailEnv = {
  apiKey: read("RESEND_API_KEY"),
  from: read("EMAIL_FROM"),
  clinicInbox: read("CLINIC_NOTIFICATION_EMAIL"),
} as const;

export const isEmailConfigured: boolean = Boolean(emailEnv.apiKey && emailEnv.from);

/**
 * Feature switches derived purely from configuration, so the UI can be honest
 * about what is live instead of pretending.
 */
export const features = {
  supabaseAuth: isSupabaseConfigured,
  appointmentPersistence: isSupabaseConfigured,
  emailNotifications: isEmailConfigured,
  /** Local "pending reviews" inbox works without any backend. */
  builtInInbox: !isSupabaseConfigured,
} as const;

/**
 * Throws a helpful error when Supabase is required but not configured.
 * Used by the auth/admin code paths only — public pages never call this.
 */
export function requireSupabaseEnv(): { url: string; anonKey: string } {
  if (!supabaseEnv.url || !supabaseEnv.anonKey) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment (see .env.example).",
    );
  }
  return { url: supabaseEnv.url, anonKey: supabaseEnv.anonKey };
}
