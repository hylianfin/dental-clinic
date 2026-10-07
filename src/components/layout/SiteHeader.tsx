"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { RiMenuLine, RiCloseLine, RiPhoneLine, RiTimeLine } from "react-icons/ri";

import { Logo } from "@/components/brand/Logo";
import { clinic, navigation, scheduleSummary } from "@/content/site";
import { cn, toTelHref } from "@/lib/utils";

/**
 * Site header.
 *
 * Client component only because of the mobile menu and the active-link state;
 * the markup is small and it stays interactive without blocking first paint.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile menu on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on Escape, and lock body scroll while open.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Utility strip */}
      <div className="hidden bg-ink-900 text-white lg:block">
        <div className="container-x flex h-10 items-center justify-between font-ui text-xs">
          <p className="flex items-center gap-2 text-white/70">
            <RiTimeLine aria-hidden="true" className="h-3.5 w-3.5 text-gold" />
            {scheduleSummary}
          </p>
          <div className="flex items-center gap-5">
            <a
              href={toTelHref(clinic.contact.phone)}
              className="flex items-center gap-2 text-white/80 transition-colors hover:text-gold"
            >
              <RiPhoneLine aria-hidden="true" className="h-3.5 w-3.5 text-gold" />
              {clinic.contact.phoneDisplay}
            </a>
            <span className="text-white/40">{clinic.contact.email}</span>
          </div>
        </div>
      </div>

      <div className="border-b border-ink-900/8 bg-cream-100/85 backdrop-blur-md">
        <div className="container-x flex h-20 items-center justify-between gap-6">
          <Logo size="md" />

          <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "relative py-2 font-ui text-sm transition-colors duration-200",
                  isActive(item.href)
                    ? "text-brand-800"
                    : "text-ink-700 hover:text-brand-700",
                )}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-x-0 -bottom-0.5 h-px origin-left bg-gold transition-transform duration-300 ease-premium",
                    isActive(item.href) ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/appointment" className="btn-primary hidden sm:inline-flex">
              Request an appointment
            </Link>

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-navigation"
              aria-label={open ? "Close menu" : "Open menu"}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink-900/10 text-ink-800 transition-colors hover:border-brand-700/40 hover:text-brand-700 lg:hidden"
            >
              {open ? (
                <RiCloseLine aria-hidden="true" className="h-6 w-6" />
              ) : (
                <RiMenuLine aria-hidden="true" className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-navigation"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="border-b border-ink-900/10 bg-cream-100 lg:hidden"
          >
            <nav aria-label="Mobile" className="container-x flex flex-col py-4">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "border-b border-ink-900/5 py-4 font-ui text-base last:border-0",
                    isActive(item.href) ? "text-brand-800" : "text-ink-800",
                  )}
                >
                  {item.label}
                </Link>
              ))}

              <Link href="/appointment" className="btn-primary mt-5 w-full">
                Request an appointment
              </Link>

              <a
                href={toTelHref(clinic.contact.phone)}
                className="mt-3 flex items-center justify-center gap-2 font-ui text-sm text-ink-700"
              >
                <RiPhoneLine aria-hidden="true" className="h-4 w-4 text-gold-ink" />
                {clinic.contact.phoneDisplay}
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
