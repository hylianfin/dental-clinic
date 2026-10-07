"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  RiCalendarCheckLine,
  RiCloseLine,
  RiDashboardLine,
  RiExternalLinkLine,
  RiLogoutBoxRLine,
  RiMailLine,
  RiMenuLine,
  RiSettings3Line,
  RiTimeLine,
} from "react-icons/ri";

import { Logo } from "@/components/brand/Logo";
import { Badge } from "@/components/ui/primitives";
import { signOutAction } from "@/lib/actions/auth";
import { cn, initialsFromName } from "@/lib/utils";
import type { StaffSession } from "@/lib/auth/session";

interface NavItem {
  href: string;
  label: string;
  Icon: typeof RiDashboardLine;
  badge?: number;
  exact?: boolean;
}

/** Dashboard frame: sidebar navigation + top bar. */
export function AdminShell({
  session,
  pendingAppointments,
  unreadMessages,
  children,
}: {
  session: StaffSession;
  pendingAppointments: number;
  unreadMessages: number;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const navItems: NavItem[] = [
    { href: "/admin", label: "Overview", Icon: RiDashboardLine, exact: true },
    {
      href: "/admin/appointments",
      label: "Appointments",
      Icon: RiCalendarCheckLine,
      badge: pendingAppointments,
    },
    { href: "/admin/messages", label: "Messages", Icon: RiMailLine, badge: unreadMessages },
    { href: "/admin/hours", label: "Opening hours", Icon: RiTimeLine },
    { href: "/admin/settings", label: "Settings & setup", Icon: RiSettings3Line },
  ];

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-5 py-6">
        <Logo size="sm" tone="light" compact />
      </div>

      <nav aria-label="Dashboard" className="flex-1 space-y-1 px-3 py-5">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-3 font-ui text-sm transition-colors duration-200",
                active
                  ? "bg-white/10 text-white"
                  : "text-ink-100/65 hover:bg-white/5 hover:text-white",
              )}
            >
              <item.Icon aria-hidden="true" className="h-5 w-5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="rounded-full bg-gold px-2 py-0.5 font-ui text-[0.625rem] font-bold text-ink-900">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-4 border-t border-white/10 px-5 py-5">
        <Link
          href="/"
          className="flex items-center gap-2 font-ui text-xs text-ink-100/60 transition-colors hover:text-gold"
        >
          <RiExternalLinkLine aria-hidden="true" className="h-4 w-4" />
          View public site
        </Link>

        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/15 font-ui text-xs font-semibold text-gold"
          >
            {initialsFromName(session.fullName)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-ui text-sm text-white">{session.fullName}</span>
            <span className="block truncate font-ui text-[0.6875rem] text-ink-100/50">
              {session.email}
            </span>
          </span>
        </div>

        <form action={signOutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-lg border border-white/10 px-3 py-2 font-ui text-xs text-ink-100/70 transition-colors hover:border-gold/40 hover:text-gold"
          >
            <RiLogoutBoxRLine aria-hidden="true" className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-72 shrink-0 bg-ink-900 lg:sticky lg:top-0 lg:block lg:h-screen">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-ink-950/70"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 bg-ink-900 shadow-lift">{sidebar}</div>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-40 border-b border-ink-900/8 bg-cream-100/90 backdrop-blur-md">
          <div className="flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-label={open ? "Close navigation" : "Open navigation"}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-ink-900/10 text-ink-700 lg:hidden"
            >
              {open ? (
                <RiCloseLine aria-hidden="true" className="h-5 w-5" />
              ) : (
                <RiMenuLine aria-hidden="true" className="h-5 w-5" />
              )}
            </button>

            <div className="min-w-0 flex-1">
              <p className="truncate font-heading text-lg text-ink-900">
                {navItems.find(isActive)?.label ?? "Dashboard"}
              </p>
            </div>

            {session.isDemo ? (
              <Badge tone="warning">Demo session</Badge>
            ) : (
              <Badge tone="brand">{session.role}</Badge>
            )}
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
