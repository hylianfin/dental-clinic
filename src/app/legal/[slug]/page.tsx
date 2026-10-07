import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Alert, SectionHeading } from "@/components/ui/primitives";
import { clinic } from "@/content/site";

/**
 * Legal pages.
 *
 * ⚠️ PLACEHOLDER WORDING. These pages exist so the links in the footer are not
 * broken, but their content must be written or approved by the clinic
 * (ideally with legal advice) before launch — privacy, terms and cookies all
 * depend on the jurisdiction and on which third-party services are enabled.
 */

const PAGES = {
  privacy: {
    title: "Privacy policy",
    intro:
      "This policy explains what personal data this website collects, why, and how long it is kept.",
    sections: [
      {
        heading: "What is collected",
        body: "When you request an appointment the site records your name, email address, phone number, the treatment you selected, and any notes you choose to add. The contact form records your name, email address, optional phone number and message.",
      },
      {
        heading: "Why it is collected",
        body: "Only to handle your appointment request or enquiry, and to contact you about it. The data is not used for advertising, and it is not sold or shared with third parties for marketing.",
      },
      {
        heading: "Where it is stored",
        body: "In a Supabase (PostgreSQL) database, protected with row-level security. If Supabase is not configured, submissions are written to a local demo store on the server and no real appointment is created.",
      },
      {
        heading: "How long it is kept",
        body: "Retention periods still need to be agreed with the clinic and stated here.",
      },
      {
        heading: "Your rights",
        body: "Depending on your jurisdiction you may have the right to access, correct or delete your data, or to object to its processing. A contact address for such requests must be added by the clinic.",
      },
    ],
  },
  terms: {
    title: "Terms of use",
    intro: "The terms that apply to using this website and requesting appointments through it.",
    sections: [
      {
        heading: "Information is not medical advice",
        body: "Content on this site is provided for general information only. It is not a diagnosis and does not replace an examination by a qualified practitioner. Always seek professional advice for your own situation.",
      },
      {
        heading: "Appointment requests are not confirmed bookings",
        body: "Submitting the appointment form sends a request. A slot is only reserved once the clinic confirms it. The clinic may propose a different time or decline a request.",
      },
      {
        heading: "Accuracy of information",
        body: "Treatment lists, durations and opening hours shown here are being finalised. The clinic should confirm them before launch, and this clause should be reviewed then.",
      },
      {
        heading: "Governing law",
        body: "The applicable jurisdiction and governing law must be supplied by the clinic.",
      },
    ],
  },
  cookies: {
    title: "Cookie notice",
    intro: "How this site uses cookies and similar technologies.",
    sections: [
      {
        heading: "Essential cookies",
        body: "The admin area uses a cookie to keep staff signed in. It is strictly necessary for the dashboard to work and is never used for advertising.",
      },
      {
        heading: "Analytics",
        body: "No analytics or advertising cookies are installed at present. If analytics are added later, this notice must be updated and consent obtained where required.",
      },
      {
        heading: "Third-party embeds",
        body: "A Google Maps embed may be added to the contact page. It is only loaded when a map URL is configured, and Google's own cookies apply once it loads.",
      },
    ],
  },
} as const;

type Slug = keyof typeof PAGES;

export function generateStaticParams() {
  return Object.keys(PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = PAGES[slug as Slug];
  if (!page) return { title: "Not found" };

  return {
    title: page.title,
    description: page.intro,
    robots: { index: false, follow: true },
  };
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = PAGES[slug as Slug];

  if (!page) notFound();

  return (
    <main className="section bg-cream-100">
      <div className="container-x max-w-3xl">
        <SectionHeading as="h1" eyebrow="Legal" title={page.title} description={page.intro} />

        <Alert tone="warning" className="mt-8" title="Placeholder wording — needs review">
          This page is a structured placeholder. Privacy, terms and cookie wording depend on the
          clinic&apos;s jurisdiction and on which services are enabled, so it must be reviewed and
          approved (ideally with legal advice) before the site goes live.
        </Alert>

        <div className="mt-10 space-y-8">
          {page.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-heading text-2xl text-ink-900">{section.heading}</h2>
              <p className="mt-3 font-body text-base leading-relaxed text-ink-600">
                {section.body}
              </p>
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-card border border-ink-900/10 bg-white p-6">
          <h2 className="font-heading text-xl text-ink-900">Contact point</h2>
          <p className="mt-2 font-body text-sm leading-relaxed text-ink-600">
            Requests relating to this policy should be sent to{" "}
            <span className="font-medium text-ink-900">{clinic.contact.email}</span>{" "}
            <em>(placeholder address — replace with the clinic&apos;s real contact)</em>.
          </p>
        </div>

        <p className="mt-10">
          <Link href="/" className="btn-outline">
            Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
