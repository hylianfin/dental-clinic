import { NextResponse, type NextRequest } from "next/server";

import { DEMO_SESSION_COOKIE } from "@/lib/auth/demo-session";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Middleware responsibilities:
 *  1. refresh the Supabase auth session on every `/admin` navigation (required —
 *     Server Components cannot write cookies);
 *  2. cheap early redirect for unauthenticated visitors.
 *
 * It is deliberately NOT the only gate: each admin layout, page and Server
 * Action calls `requireStaff()` / `getStaffOrNull()` again, because middleware
 * alone has been bypassable in several Next.js advisories.
 */
export async function middleware(request: NextRequest) {
  const { response, userId } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isAdminArea = pathname === "/admin" || pathname.startsWith("/admin/");
  const isLoginRoute = pathname.startsWith("/admin/login");

  if (isAdminArea && !isLoginRoute) {
    const hasDemoCookie = request.cookies.has(DEMO_SESSION_COOKIE);
    if (!userId && !hasDemoCookie) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/admin/login";
      redirectUrl.search = "?reason=signin-required";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
