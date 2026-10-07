import type { OpeningHours } from "@/types/content";

/**
 * ============================================================================
 *  CLINIC IDENTITY & CONTACT  —  SINGLE SOURCE OF TRUTH
 * ============================================================================
 *  Every phone number, email address, opening hour and social link used
 *  anywhere on the site or in transactional emails is defined in this file.
 *  Change a value here and it updates the header, footer, contact page,
 *  booking engine, structured data and confirmation emails at once.
 *
 *  Confirmed by the clinic:
 *    • name, email, both phone numbers, WhatsApp number
 *    • opening hours: 24 hours a day, 7 days a week
 *    • city: Djelfa (the clinic's name includes "Messaouda", which is the
 *      practitioner's given name — not a place)
 *    • Facebook page
 *    • Google Maps link
 *
 *  Still outstanding — see `PLACEHOLDER_FIELDS` at the bottom (also listed in
 *  the admin dashboard): street address, social profiles, practitioner
 *  profiles, patient reviews, photography and the final legal wording.
 * ============================================================================
 */

export const clinic = {
  name: "Dr. Bouamara Dental Clinic",
  /** The practitioner's full name, as signed on the clinic's own material. */
  doctorName: "Dr. Messaouda Bouamara",
  /** Used by the text wordmark when no logo file is configured. */
  wordmark: "Dr. Bouamara",
  shortName: "Dr. Bouamara",
  monogram: "MB",
  tagline: "Precision dentistry, day and night.",

  contact: {
    /** Primary number. */
    phone: "+213 776 065 276",
    phoneDisplay: "+213 776 065 276",
    /** Secondary number, as printed on the clinic's own material. */
    phoneSecondary: "+213 671 149 592",
    phoneSecondaryDisplay: "+213 671 149 592",
    email: "Drbouamara@gmail.com",
    /** WhatsApp is enabled on the secondary number only (digits, E.164). */
    whatsapp: "213671149592",
    /** City confirmed by the clinic; no street address has been supplied. */
    city: "Djelfa",
    country: "Algeria",
    /**
     * Locator published by the clinic on its own Google Maps listing, which the
     * link below resolves to ("M782+2MC, Djelfa, Algeria"). A Plus Code rather
     * than a street address — replace it the moment the clinic sends one.
     */
    addressLine: "M782+2MC, Djelfa, Algeria",
    streetAddress: "M782+2MC" as string | null,
    /** Public Google Maps link supplied by the clinic. */
    mapLinkUrl: "https://maps.app.goo.gl/nb5PYvmst4qUFScg6",
    /**
     * Live map on the contact page. This is the key-free embed form that
     * resolves the clinic's listing — the share link above cannot be embedded.
     */
    mapEmbedUrl:
      "https://www.google.com/maps?q=Esthetic%20%26%20implant%20Dental%20Centre%20Djelfa%20(dr.bouamara)&z=16&hl=en&output=embed" as string | null,
  },

  /** Social profiles — `null` hides the icon entirely. */
  social: {
    instagram: null as string | null,
    /** The clinic's own Facebook page. */
    facebook: "https://www.facebook.com/drbouamaramessaouda" as string | null,
    tiktok: null as string | null,
    youtube: null as string | null,
  },

  languages: ["Français", "العربية", "English"],

  /** Year the practice was founded — not supplied, so no "since" claims. */
  foundedYear: null as number | null,

  brand: {
    /** Mirrors tailwind.config.ts — deep navy + champagne gold. */
    primary: "#0B2342",
    accent: "#C2A06B",
  },
} as const;

/**
 * Opening hours — confirmed: open 24 hours a day, seven days a week.
 *
 * Stated by the clinic and independently visible on its own Google Maps
 * listing ("Open 24 hours", all seven days, checked 2026-10-07), which is also
 * where the phone number below is published.
 *
 * "00:00 → 24:00" is the canonical full-day representation and is exactly what
 * the booking engine understands: `expandTimeRange("00:00", "24:00", 30)`
 * yields every slot from 00:00 to 23:30, and the closing-time guard correctly
 * allows a 23:30 slot for a 30-minute appointment. `closes_at` is a Postgres
 * `time`, where "24:00" is valid.
 *
 * These values are editable from the dashboard (Admin → Opening hours), which
 * writes to the `opening_hours` table. This array is the fallback used when
 * Supabase is not configured.
 */
export const scheduleConfirmed = true;

const ALL_DAY = { open: "00:00", close: "24:00", closed: false } as const;

export const openingHours: OpeningHours[] = [
  { weekday: 0, label: "Sunday", ...ALL_DAY },
  { weekday: 1, label: "Monday", ...ALL_DAY },
  { weekday: 2, label: "Tuesday", ...ALL_DAY },
  { weekday: 3, label: "Wednesday", ...ALL_DAY },
  { weekday: 4, label: "Thursday", ...ALL_DAY },
  { weekday: 5, label: "Friday", ...ALL_DAY },
  { weekday: 6, label: "Saturday", ...ALL_DAY },
];

/** Short human summary used in the header strip, footer and metadata. */
export const scheduleSummary = "Open 24 hours, 7 days a week";

export const navigation = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
] as const;

/**
 * Persistent calendar closure (e.g. a holiday). `null` = open as normal.
 * Kept here so a closure can be added without touching any component.
 */
export const clinicClosure: { from: string; to: string; reason: string } | null = null;

/**
 * Machine-readable list of everything still awaiting real clinic information.
 * Surfaced in the admin dashboard ("Site readiness" and "Settings → Content
 * still needed") so unfinished content can never ship unnoticed.
 *
 * Remove an entry once the corresponding content is real.
 */
export const PLACEHOLDER_FIELDS = [
  "clinic.contact.streetAddress",
  "clinic.social (Instagram / TikTok / YouTube)",
  "media.brand.logo",
  "media.doctor.portrait",
  "media.facility",
  "media.results",
  "media.appearances.thumbnail",
  "team",
  "testimonials",
  "services.images",
  "legal.policyPages",
] as const;

export type PlaceholderField = (typeof PLACEHOLDER_FIELDS)[number];
