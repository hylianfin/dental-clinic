import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/LoginForm";
import { Logo } from "@/components/brand/Logo";
import { Alert, PlaceholderBadge } from "@/components/ui/primitives";
import { isDemoAccessEnabled } from "@/lib/auth/session";
import { getAdminAccess } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/env";
import { safeRedirectPath } from "@/lib/validation/schemas";

export const metadata: Metadata = {
  title: "Staff sign-in",
};

const REASON_MESSAGES: Record<string, { tone: "info" | "warning" | "danger"; text: string }> = {
  "signin-required": {
    tone: "info",
    text: "Please sign in to open the dashboard.",
  },
  "not-provisioned": {
    tone: "danger",
    text: "That account is not authorised for the clinic dashboard. Ask an administrator to add an active staff_profiles row for it.",
  },
  "setup-required": {
    tone: "warning",
    text: "The dashboard needs a Supabase project before staff sign-in can work.",
  },
  expired: {
    tone: "info",
    text: "Your session ended. Please sign in again.",
  },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string; next?: string }>;
}) {
  const [{ reason, next }, access] = await Promise.all([searchParams, getAdminAccess()]);

  // Already signed in — no need to see the login screen.
  if (access.kind === "staff" || access.kind === "demo") {
    redirect(safeRedirectPath(next ?? "/admin"));
  }

  const notice = reason ? REASON_MESSAGES[reason] : undefined;
  const demoAvailable = !isSupabaseConfigured && isDemoAccessEnabled();

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-900 px-5 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo size="lg" tone="light" />
        </div>

        <div className="rounded-card border border-white/10 bg-white p-7 shadow-lift sm:p-8">
          <h1 className="font-heading text-2xl text-ink-900">Staff area</h1>
          <p className="mt-2 font-body text-sm text-ink-600">
            Sign in to manage appointments, messages and site content.
          </p>

          {notice && (
            <Alert tone={notice.tone} className="mt-6">
              {notice.text}
            </Alert>
          )}

          {isSupabaseConfigured ? (
            <LoginForm redirectTo={safeRedirectPath(next ?? "/admin")} />
          ) : (
            <div className="mt-6 space-y-5">
              <Alert tone="warning" title="Supabase is not configured">
                Real staff sign-in requires a Supabase project. Until then this dashboard is locked,
                which is deliberate — an admin area without authentication should never be exposed.
              </Alert>

              <ol className="space-y-3 font-body text-sm text-ink-600">
                {[
                  "Create a Supabase project and run the SQL files in supabase/migrations.",
                  "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment.",
                  "Create a user and add an active row for it in staff_profiles.",
                  "Sign in here with that account.",
                ].map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-700/10 font-ui text-xs font-semibold text-brand-800">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>

              {demoAvailable ? (
                <div className="rounded-xl border border-gold-ink/30 bg-gold-ink/[0.04] p-5">
                  <PlaceholderBadge label="Demo mode enabled" />
                  <p className="mt-3 font-body text-sm leading-relaxed text-ink-700">
                    <code className="font-mono text-xs">ADMIN_DEMO_ACCESS=true</code> is set, so you
                    can open the dashboard with sample data. This is a development convenience with{" "}
                    <strong>no real authentication</strong> — never enable it on a public
                    deployment.
                  </p>
                  <LoginForm redirectTo={safeRedirectPath(next ?? "/admin")} demoMode />
                </div>
              ) : (
                <p className="font-body text-xs leading-relaxed text-ink-500">
                  To preview the dashboard with sample data during development, set{" "}
                  <code className="font-mono">ADMIN_DEMO_ACCESS=&quot;true&quot;</code> in your
                  environment file and reload this page.
                </p>
              )}
            </div>
          )}
        </div>

        <p className="mt-6 text-center">
          <Link
            href="/"
            className="font-ui text-sm text-white/60 transition-colors hover:text-gold"
          >
            ← Back to the website
          </Link>
        </p>
      </div>
    </main>
  );
}
