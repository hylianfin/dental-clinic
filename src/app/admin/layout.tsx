import type { Metadata } from "next";

/**
 * Admin root layout.
 *
 * Deliberately thin: it only applies noindex metadata. Authorisation lives in
 * `src/app/admin/(dashboard)/layout.tsx`, so the sign-in page itself stays
 * reachable by signed-out users.
 */
export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s · Admin · Dr. Bouamara Dental Clinic",
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function AdminRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="min-h-screen bg-cream-100">{children}</div>;
}
