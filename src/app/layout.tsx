import type { Metadata, Viewport } from "next";

import "./globals.css";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { clinic, scheduleConfirmed, scheduleSummary } from "@/content/site";
import { appUrl } from "@/lib/env";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: `${clinic.name} — ${clinic.tagline}`,
    template: `%s · ${clinic.name}`,
  },
  description: `${clinic.name} in ${clinic.contact.addressLine} — ${scheduleSummary.toLowerCase()}. Request a dental appointment online and the clinic confirms your time. Call ${clinic.contact.phoneDisplay}.`,
  applicationName: clinic.name,
  keywords: [
    "dental clinic",
    "dentist",
    "dental appointment",
    "Dr. Messaouda Bouamara",
    "Dr. Bouamara",
    "clinique dentaire",
    "Djelfa",
  ],
  authors: [{ name: clinic.name }],
  openGraph: {
    type: "website",
    siteName: clinic.name,
    title: `${clinic.name} — ${clinic.tagline}`,
    description:
      "Request a dental appointment online. Clear explanations, unhurried appointments and modern equipment.",
    url: appUrl,
    locale: "en",
  },
  twitter: {
    card: "summary_large_image",
    title: `${clinic.name} — ${clinic.tagline}`,
    description: "Request a dental appointment online at Dr. Bouamara Dental Clinic.",
  },
  robots: {
    index: true,
    follow: true,
  },
  formatDetection: { telephone: true, address: false, email: true },
  category: "health",
};

export const viewport: Viewport = {
  themeColor: "#0B2342",
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
};

/**
 * Structured data (schema.org Dentist).
 *
 * Only facts the clinic has actually provided are emitted: name, email, the two
 * telephone numbers, the town, the 24/7 opening hours and the Google Maps link.
 * No street address, price range, rating or founding date is asserted, because
 * none was supplied — invented values in JSON-LD would mislead search engines
 * and patients alike.
 */
function JsonLd() {
  const openingHoursSpecification = [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "00:00",
      closes: "24:00",
    },
  ];

  const payload = {
    "@context": "https://schema.org",
    "@type": "Dentist",
    name: clinic.name,
    url: appUrl,
    description: `${clinic.tagline} General and specialist dental care.`,
    availableLanguage: clinic.languages,
    email: clinic.contact.email,
    telephone: [clinic.contact.phone, clinic.contact.phoneSecondary],
    address: {
      "@type": "PostalAddress",
      addressLocality: clinic.contact.city,
      addressCountry: "DZ",
      ...(clinic.contact.streetAddress ? { streetAddress: clinic.contact.streetAddress } : {}),
    },
    ...(clinic.contact.mapLinkUrl ? { hasMap: clinic.contact.mapLinkUrl } : {}),
    ...(scheduleConfirmed ? { openingHoursSpecification } : {}),
    ...(clinic.foundedYear ? { foundingDate: String(clinic.foundedYear) } : {}),
  };

  return (
    <script
      type="application/ld+json"
      // Static, developer-authored JSON — no user input is interpolated.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-cream-100">
        <a href="#main" className="skip-link">
          Skip to main content
        </a>

        <SiteHeader />

        <div id="main" className="flex flex-1 flex-col">
          {children}
        </div>

        <SiteFooter />
        <JsonLd />

        {/*
          Screen-reader-only completion notice. Contact details and 24/7 opening
          hours are now real; the remaining pending content (photography, team
          profiles, legal wording) is labelled in place, on the page.
        */}
      </body>
    </html>
  );
}
