import { RiArrowRightLine, RiExternalLinkLine } from "react-icons/ri";

import { Alert, Badge, PlaceholderBadge } from "@/components/ui/primitives";
import { clinic, PLACEHOLDER_FIELDS, scheduleConfirmed } from "@/content/site";
import { isDemoAccessEnabled } from "@/lib/auth/session";
import { appUrl, emailEnv, isEmailConfigured, isSupabaseAdminConfigured, isSupabaseConfigured, supabaseEnv } from "@/lib/env";
import Link from "next/link";

export const metadata = { title: "Settings & setup" };

interface EnvRow {
  name: string;
  configured: boolean;
  detail: string;
  secret?: boolean;
}

export default function AdminSettingsPage() {
  const rows: EnvRow[] = [
    {
      name: "NEXT_PUBLIC_SUPABASE_URL",
      configured: Boolean(supabaseEnv.url),
      detail: supabaseEnv.url ?? "Not set — the site runs on local content files and the demo store.",
    },
    {
      name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      configured: Boolean(supabaseEnv.anonKey),
      detail: supabaseEnv.anonKey ? "Set (public key)" : "Not set — sign-in and the database are disabled.",
    },
    {
      name: "SUPABASE_SERVICE_ROLE_KEY",
      configured: isSupabaseAdminConfigured,
      detail: isSupabaseAdminConfigured
        ? "Set — server-only. Never expose this to the browser."
        : "Not set — background jobs and staff provisioning are unavailable.",
      secret: true,
    },
    {
      name: "RESEND_API_KEY",
      configured: isEmailConfigured,
      detail: isEmailConfigured
        ? `Set — sending as ${emailEnv.from}`
        : "Not set — confirmation emails are logged instead of sent.",
      secret: true,
    },
    {
      name: "CLINIC_NOTIFICATION_EMAIL",
      configured: Boolean(emailEnv.clinicInbox),
      detail: emailEnv.clinicInbox ?? "Not set — new requests are not emailed to the clinic.",
    },
    {
      name: "ADMIN_DEMO_ACCESS",
      configured: isDemoAccessEnabled(),
      detail: isDemoAccessEnabled()
        ? "Enabled — demo dashboard session with no authentication. Development only."
        : "Disabled (recommended for any deployment with real data).",
      secret: true,
    },
    {
      name: "SESSION_SECRET",
      configured: Boolean(process.env.SESSION_SECRET && process.env.SESSION_SECRET !== "dev-only-insecure-session-secret-change-me"),
      detail: "Signs the demo session cookie. Generate with: openssl rand -hex 32",
      secret: true,
    },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-heading text-3xl text-ink-900">Settings &amp; setup</h1>
        <p className="mt-2 font-body text-sm text-ink-600">
          Configuration state and the remaining work before launch.
        </p>
      </header>

      <section aria-labelledby="env-heading" className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="env-heading" className="font-heading text-xl text-ink-900">
            Environment
          </h2>
          <Badge tone={isSupabaseConfigured ? "success" : "warning"}>
            {isSupabaseConfigured ? "Supabase connected" : "Running without Supabase"}
          </Badge>
        </div>

        <ul className="mt-5 divide-y divide-ink-900/8">
          {rows.map((row) => (
            <li key={row.name} className="flex flex-wrap items-start justify-between gap-4 py-4">
              <div className="min-w-0">
                <p className="flex items-center gap-2 font-mono text-xs text-ink-800">
                  {row.name}
                  {row.secret && <Badge tone="neutral">server-only</Badge>}
                </p>
                <p className="mt-1.5 font-body text-sm text-ink-600">{row.detail}</p>
              </div>
              <Badge tone={row.configured ? "success" : "neutral"}>
                {row.configured ? "configured" : "not set"}
              </Badge>
            </li>
          ))}
        </ul>

        <Alert tone="info" className="mt-5" title="Where to set these">
          Locally: <code className="font-mono text-xs">.env.local</code>. On a host: the project&apos;s
          environment variables. <code className="font-mono text-xs">.env.example</code> lists every
          variable with comments.
        </Alert>
      </section>

      <section aria-labelledby="setup-heading" className="card p-6">
        <h2 id="setup-heading" className="font-heading text-xl text-ink-900">
          Supabase setup
        </h2>
        <ol className="mt-5 space-y-4">
          {[
            {
              title: "Create the project",
              body: "supabase.com → new project. Copy the URL, anon key and service_role key into your environment.",
            },
            {
              title: "Run the migrations",
              body: "Apply supabase/migrations/0001 → 0004 in order (SQL editor or `supabase db push`). This creates the tables, RLS policies, the double-booking constraint and the seed data.",
            },
            {
              title: "Create the first admin user",
              body: "Add a user in Authentication → Users, then insert a row in staff_profiles with role = 'admin' and active = true.",
            },
            {
              title: "Turn off demo access",
              body: "Set ADMIN_DEMO_ACCESS=false and generate a real SESSION_SECRET.",
            },
            {
              title: "Configure email",
              body: "Add RESEND_API_KEY, EMAIL_FROM and CLINIC_NOTIFICATION_EMAIL so patients and the clinic receive confirmations.",
            },
          ].map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-700/10 font-ui text-xs font-semibold text-brand-800">
                {index + 1}
              </span>
              <div>
                <p className="font-ui text-sm font-medium text-ink-900">{step.title}</p>
                <p className="mt-1 font-body text-sm leading-relaxed text-ink-600">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <p className="mt-5 font-body text-xs text-ink-500">
          Full guide: <code className="font-mono">supabase/README.md</code>
        </p>
      </section>

      <section aria-labelledby="content-heading" className="card p-6">
        <h2 id="content-heading" className="font-heading text-xl text-ink-900">
          Content still needed from the clinic
        </h2>
        <p className="mt-2 font-body text-sm text-ink-600">
          These are tracked in <code className="font-mono text-xs">src/content/site.ts</code> and in{" "}
          <code className="font-mono text-xs">src/content/media.ts</code>, and are labelled on the
          public site so nothing ships by accident. Contact details and 24/7 opening hours are
          already live.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {PLACEHOLDER_FIELDS.map((field) => (
            <div
              key={field}
              className="rounded-xl border border-dashed border-gold-ink/35 bg-gold-ink/[0.03] px-4 py-3"
            >
              <p className="font-mono text-xs text-ink-700">{field}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-ink-900/10 bg-cream-50 p-4">
            <p className="font-ui text-xs uppercase tracking-wider text-ink-500">Practice name</p>
            <p className="mt-1 font-body text-sm text-ink-900">{clinic.name}</p>
          </div>
          <div className="rounded-xl border border-ink-900/10 bg-cream-50 p-4">
            <p className="font-ui text-xs uppercase tracking-wider text-ink-500">Opening hours</p>
            <p className="mt-1 font-body text-sm text-ink-900">
              {scheduleConfirmed ? "24 hours, every day" : "Demo schedule"}
            </p>
            <Link
              href="/admin/hours"
              className="mt-2 inline-flex items-center gap-1.5 font-ui text-xs font-medium text-brand-700 hover:text-brand-800"
            >
              Edit hours
              <RiArrowRightLine aria-hidden="true" className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="rounded-xl border border-ink-900/10 bg-cream-50 p-4">
            <p className="font-ui text-xs uppercase tracking-wider text-ink-500">Site URL</p>
            <p className="mt-1 truncate font-body text-sm text-ink-900">{appUrl}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <PlaceholderBadge label="Add these before launch" />
        </div>
      </section>

      <section aria-labelledby="danger-heading" className="card border-red-500/25 p-6">
        <h2 id="danger-heading" className="font-heading text-xl text-ink-900">
          Security notes
        </h2>
        <ul className="mt-4 space-y-3 font-body text-sm leading-relaxed text-ink-600">
          <li>
            Staff access is granted by an <strong>active</strong> row in{" "}
            <code className="font-mono text-xs">staff_profiles</code>. Set{" "}
            <code className="font-mono text-xs">active = false</code> to revoke access instantly.
          </li>
          <li>
            Never expose <code className="font-mono text-xs">SUPABASE_SERVICE_ROLE_KEY</code> to the
            browser or commit it. It lives only in server-side code.
          </li>
          <li>
            Anonymous visitors can create an appointment request and nothing else — they cannot read
            appointments or messages back. Availability is served through views that expose time
            ranges only.
          </li>
          <li>
            Double bookings are impossible: an exclusion constraint in PostgreSQL rejects overlapping
            blocking appointments.
          </li>
        </ul>

        <p className="mt-5">
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-ui text-sm text-brand-700 hover:text-brand-800"
          >
            Open the Supabase dashboard
            <RiExternalLinkLine aria-hidden="true" className="h-4 w-4" />
          </a>
        </p>
      </section>
    </div>
  );
}
