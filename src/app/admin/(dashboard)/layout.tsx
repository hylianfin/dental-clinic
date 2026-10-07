import { AdminShell } from "@/components/admin/AdminShell";
import { Alert } from "@/components/ui/primitives";
import { requireStaff } from "@/lib/auth/require-staff";
import { isSupabaseConfigured } from "@/lib/env";
import { getDashboardStats } from "@/lib/services/appointments";

/**
 * Protected dashboard layout.
 *
 * `requireStaff()` runs on every request: it redirects signed-out users to the
 * sign-in page and refuses accounts without an active `staff_profiles` row.
 * The middleware already performs a cheap check, but this is the authoritative
 * gate and it covers Server Actions too.
 */
export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireStaff();
  const stats = await getDashboardStats();

  return (
    <AdminShell
      session={session}
      pendingAppointments={stats.pendingCount}
      unreadMessages={stats.unreadMessages}
    >
      {session.isDemo && (
        <Alert tone="warning" title="Demo mode — no real data is being stored" className="mb-6">
          This dashboard is running without Supabase, on sample data. Appointments and messages you
          see are examples, and new requests are written to a local file on the server. Configure
          Supabase and disable <code className="font-mono text-xs">ADMIN_DEMO_ACCESS</code> before
          using this with real patients.
        </Alert>
      )}

      {!isSupabaseConfigured && !session.isDemo && (
        <Alert tone="info" className="mb-6">
          Supabase is not configured in this environment.
        </Alert>
      )}

      {children}
    </AdminShell>
  );
}
