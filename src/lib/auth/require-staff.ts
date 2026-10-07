import "server-only";

import { redirect } from "next/navigation";

import { getAdminAccess, type StaffSession } from "@/lib/auth/session";

/**
 * Gate for every protected admin surface.
 *
 * Call this at the top of admin layouts, pages and Server Actions. It is the
 * authoritative check — never rely on middleware alone, and never trust a
 * client-provided role.
 */
export async function requireStaff(): Promise<StaffSession> {
  const access = await getAdminAccess();

  switch (access.kind) {
    case "staff":
    case "demo":
      return access.session;
    case "unauthenticated":
      redirect("/admin/login?reason=signin-required");
    case "not-staff":
      redirect(`/admin/login?reason=not-provisioned&email=${encodeURIComponent(access.email)}`);
    case "not-configured":
    case "demo-disabled":
      redirect("/admin/login?reason=setup-required");
    default:
      redirect("/admin/login");
  }
}

/** Variant for Server Actions: returns a result instead of redirecting. */
export async function getStaffOrNull(): Promise<StaffSession | null> {
  const access = await getAdminAccess();
  if (access.kind === "staff" || access.kind === "demo") return access.session;
  return null;
}

export function isAdminSession(session: StaffSession): boolean {
  return session.role === "admin";
}
