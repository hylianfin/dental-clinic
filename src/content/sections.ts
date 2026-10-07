import type { FaqItem, MediaAppearance, Testimonial, ValueItem } from "@/types/content";
import { appearanceThumbnail } from "@/content/media";

/**
 * ============================================================================
 *  PAGE COPY — DEMO CONTENT
 * ============================================================================
 *  All descriptive copy below is intentional placeholder wording written to
 *  keep the layout readable. It makes no medical, outcome or accreditation
 *  claims. Replace with the clinic's approved copy before launch.
 * ============================================================================
 */

export const heroContent = {
  eyebrow: "Dental care",
  /** The tagline is generic positioning, not a clinical claim. */
  title: "Calm, precise dentistry,",
  titleAccent: "for every stage of your smile",
  subtitle:
    "Dr. Bouamara Dental Clinic — a focused practice built around clear explanations, unhurried appointments and modern equipment.",
  primaryCta: { href: "/appointment", label: "Request an appointment" },
  secondaryCta: { href: "/services", label: "View services" },
};

export const trustPoints: ValueItem[] = [
  {
    id: "trust-time",
    title: "Unhurried appointments",
    description: "Scheduled so there is time to explain findings and agree on a plan before treatment.",
  },
  {
    id: "trust-clarity",
    title: "Written treatment plans",
    description: "Options, phases and estimated costs set out in writing before you decide.",
  },
  {
    id: "trust-hygiene",
    title: "Strict sterilisation protocol",
    description: "Instrument reprocessing and surface protocols followed for every patient.",
  },
  {
    id: "trust-prevention",
    title: "Prevention first",
    description: "Routine reviews and prevention are recommended before more invasive options.",
  },
];

export const values: ValueItem[] = [
  {
    id: "value-honesty",
    title: "Honest advice",
    description:
      "You are told what is needed, what can wait, and what is optional — with the reasoning behind it.",
  },
  {
    id: "value-comfort",
    title: "Comfort as standard",
    description:
      "Anaesthesia, pacing and positioning are adjusted to you, including for anxious patients.",
  },
  {
    id: "value-precision",
    title: "Precision work",
    description: "Treatment planned from imaging and measurement rather than guesswork.",
  },
  {
    id: "value-continuity",
    title: "Continuity of care",
    description: "The same practitioner follows your case from first consultation to review.",
  },
];

/**
 * The practitioner.
 *
 * The name is confirmed by the clinic's own material ("Dr. Messaouda Bouamara"
 * — Messaouda is her given name, which is why it appears in the clinic's
 * signature, e.g. "Dr. Bouamara · Messaouda"). Qualifications, special
 * interests and a biography must still be supplied and approved by the clinic —
 * inventing credentials on a medical site is unacceptable. Until then the About
 * page shows the portrait with a clearly-marked "credentials pending" note.
 */
export const doctorProfile = {
  id: "dr-bouamara",
  name: "Dr. Messaouda Bouamara",
  shortName: "Dr. Bouamara",
  role: "Dentist",
  /** e.g. "DDS, MSc Implantology" — must come from the clinic. */
  credentials: null as string | null,
  /** A short biography in the clinic's own words. */
  bio: null as string | null,
  isPlaceholder: true,
};


export const aboutContent = {
  eyebrow: "About the practice",
  title: "A practice built around clarity and precision",
  /**
   * CONFIRMED facts only (from the clinic): town and opening hours.
   */
  intro:
    "Dr. Bouamara Dental Clinic is based in Djelfa, Algeria, and is open 24 hours a day, seven days a week.",
  /**
   * ⚠️ PLACEHOLDER narrative. Rewrite with the practice's real history and
   * approach, in the clinic's own words, before launch.
   */
  placeholderParagraphs: [
    "This paragraph is placeholder copy. Replace it with the practice's real history, its approach to patient care and anything that makes it distinctive.",
    "The site deliberately avoids the invented awards, statistics and accreditation badges that template websites usually carry. Add verified details only — they are far more convincing than made-up numbers.",
  ],
  isPlaceholder: true,
};

/**
 * Television appearance.
 *
 * “Nabd El Seha” — topic: “جراحة الأسنان والرياضة” (dental surgery and sport).
 * The programme name and topic are exactly as supplied. No channel, broadcast
 * date or description is asserted, because none was provided.
 */
export const mediaAppearances: MediaAppearance[] = [
  {
    id: "nabd-el-seha",
    program: "Nabd El Seha",
    topic: "جراحة الأسنان والرياضة",
    topicTranslation: "Dental surgery and sport",
    /**
     * Official link supplied by the clinic — the timestamp is the moment the
     * segment begins. It opens on YouTube in a new tab; the video is never
     * embedded on this site.
     */
    videoUrl: "https://www.youtube.com/watch?v=08k-7ALuaQY&t=1230s",
    thumbnail: appearanceThumbnail,
    isPlaceholder: false,
  },
];

export const facilityContent = {
  eyebrow: "In the media",
  title: "Dr. Bouamara on television",
  body: "Dr. Bouamara speaking about dentistry and sport on Radio El Bahdia's television programme, alongside treatment results published with the patient's written consent.",
  isPlaceholder: false,
};

/**
 * Testimonials are intentionally empty.
 *
 * Publishing patient reviews requires documented consent, and inventing them
 * is both dishonest and, in many jurisdictions, unlawful advertising. The
 * reviews section renders an explanatory empty state until real, consented and
 * approved reviews are added to `approvedTestimonials`.
 */
export const testimonials: Testimonial[] = [];

export const approvedTestimonials = (): Testimonial[] =>
  testimonials.filter((testimonial) => testimonial.approved);

export const faqs: FaqItem[] = [
  {
    id: "faq-book",
    question: "How do I book an appointment?",
    answer:
      "Use the booking form on this site. You choose a service and a time slot, and the request is sent to the clinic for confirmation. You will receive a confirmation once the clinic has reviewed it.",
    isPlaceholder: false,
  },
  {
    id: "faq-first-visit",
    question: "What happens at a first visit?",
    answer:
      "A first appointment usually includes a discussion of your concerns, an examination and any imaging that is clinically indicated. A treatment plan is then explained and given to you in writing.",
    isPlaceholder: false,
  },
  {
    id: "faq-urgent",
    question: "I am in pain — how quickly can I be seen?",
    answer:
      "The clinic is open 24 hours a day, seven days a week. For urgent problems, call +213 776 065 276 or +213 671 149 592 rather than using the booking form.",
    // The clinic's specific triage procedure still has to be supplied.
    isPlaceholder: true,
  },
  {
    id: "faq-payment",
    question: "How does payment work?",
    answer:
      "Placeholder: add the accepted payment methods, whether insurance or third-party payment is accepted, and how estimates are issued.",
    isPlaceholder: true,
  },
  {
    id: "faq-cancellation",
    question: "What is the cancellation policy?",
    answer:
      "Placeholder: add the clinic's notice period for cancellations and any associated conditions.",
    isPlaceholder: true,
  },
];

/**
 * Legal pages are required before a public launch but their wording depends on
 * the clinic's jurisdiction and the final data flows.
 */
export const legalPages = [
  { id: "legal-privacy", href: "/legal/privacy", label: "Privacy policy", isPlaceholder: true },
  { id: "legal-terms", href: "/legal/terms", label: "Terms of use", isPlaceholder: true },
  { id: "legal-cookies", href: "/legal/cookies", label: "Cookie notice", isPlaceholder: true },
];

export const bookingNotice = {
  title: "Requests, not instant bookings",
  body: "Submitting the form sends an appointment request. A slot is only reserved once the clinic confirms it — you will always be told the outcome.",
  isPlaceholder: false,
};
