import type { Metadata } from "next";
import {
  RiExternalLinkLine,
  RiFacebookCircleLine,
  RiMailLine,
  RiMapPin2Line,
  RiPhoneLine,
  RiTimeLine,
  RiWhatsappLine,
} from "react-icons/ri";

import { ContactForm } from "@/components/contact/ContactForm";
import { PlaceholderBadge, SectionHeading } from "@/components/ui/primitives";
import { clinic, scheduleConfirmed } from "@/content/site";
import { getOpeningHours, getScheduleSummary } from "@/lib/queries/site";
import { toTelHref, toWhatsAppHref } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Dr. Bouamara Dental Clinic: send a message, request an appointment, call, or open the practice on Google Maps. Open 24 hours a day, seven days a week.",
  alternates: { canonical: "/contact" },
};

/** Formats "09:00" → "9:00 am"; "24:00" reads as "midnight". */
function displayTime(value: string | null): string {
  if (!value) return "—";
  if (value === "24:00") return "midnight";
  const [hour, minute] = value.split(":").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2000, 0, 1, hour ?? 0, minute ?? 0)));
}

export default async function ContactPage() {
  const [hours, summary] = await Promise.all([getOpeningHours(), getScheduleSummary()]);
  const whatsappEnabled = Boolean(clinic.contact.whatsapp);

  return (
    <main>
      <section className="bg-ink-900 py-16 text-white sm:py-20">
        <div className="container-x">
          <SectionHeading
            tone="dark"
            as="h1"
            eyebrow="Contact"
            title="Talk to the clinic"
            description={`${summary}. Send a message and the clinic will get back to you — for urgent problems, please call.`}
          />
        </div>
      </section>

      <section className="section bg-cream-100">
        <div className="container-x grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
          {/* Form */}
          <div className="card p-7 lg:p-10">
            <h2 className="font-heading text-2xl text-ink-900">Send a message</h2>
            <p className="mt-2 font-body text-sm text-ink-600">
              Fields marked with an asterisk are required.
            </p>
            <div className="mt-8">
              <ContactForm />
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div className="card p-7">
              <h2 className="font-heading text-xl text-ink-900">Clinic details</h2>

              <ul className="mt-5 space-y-5">
                {/* Location */}
                <li className="flex gap-4">
                  <RiMapPin2Line
                    aria-hidden="true"
                    className="mt-0.5 h-5 w-5 shrink-0 text-gold-ink"
                  />
                  <div>
                    <p className="font-ui text-xs uppercase tracking-wider text-ink-500">Location</p>
                    <p className="mt-1 font-body text-sm text-ink-900">
                      {clinic.contact.addressLine}
                    </p>
                    {clinic.contact.mapLinkUrl && (
                      <a
                        href={clinic.contact.mapLinkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 font-ui text-sm font-medium text-brand-700 hover:text-brand-800"
                      >
                        Open in Google Maps
                        <RiExternalLinkLine aria-hidden="true" className="h-3.5 w-3.5" />
                        <span className="sr-only">(opens in a new tab)</span>
                      </a>
                    )}
                    {!clinic.contact.streetAddress && (
                      <PlaceholderBadge className="mt-3" label="Street address pending" />
                    )}
                  </div>
                </li>

                {/* Phones */}
                <li className="flex gap-4">
                  <RiPhoneLine
                    aria-hidden="true"
                    className="mt-0.5 h-5 w-5 shrink-0 text-gold-ink"
                  />
                  <div>
                    <p className="font-ui text-xs uppercase tracking-wider text-ink-500">Phone</p>
                    <p className="mt-1 space-y-1 font-body text-sm">
                      <a
                        href={toTelHref(clinic.contact.phone)}
                        className="block text-brand-700 hover:text-brand-800"
                      >
                        {clinic.contact.phoneDisplay}
                        <span className="ms-2 font-ui text-[0.6875rem] uppercase tracking-wider text-ink-400">
                          Primary
                        </span>
                      </a>
                      <a
                        href={toTelHref(clinic.contact.phoneSecondary)}
                        className="block text-brand-700 hover:text-brand-800"
                      >
                        {clinic.contact.phoneSecondaryDisplay}
                        <span className="ms-2 font-ui text-[0.6875rem] uppercase tracking-wider text-ink-400">
                          Secondary
                        </span>
                      </a>
                    </p>

                    {whatsappEnabled && (
                      <a
                        href={toWhatsAppHref(clinic.contact.whatsapp)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-2 rounded-full border border-brand-700/25 bg-brand-50 px-3.5 py-1.5 font-ui text-xs font-medium text-brand-800 transition-colors duration-200 hover:bg-brand-100"
                      >
                        <RiWhatsappLine aria-hidden="true" className="h-4 w-4" />
                        Message on WhatsApp
                        <span className="sr-only">(opens in a new tab)</span>
                      </a>
                    )}
                  </div>
                </li>

                {/* Email */}
                <li className="flex gap-4">
                  <RiMailLine
                    aria-hidden="true"
                    className="mt-0.5 h-5 w-5 shrink-0 text-gold-ink"
                  />
                  <div>
                    <p className="font-ui text-xs uppercase tracking-wider text-ink-500">Email</p>
                    <p className="mt-1 font-body text-sm">
                      <a
                        href={`mailto:${clinic.contact.email}`}
                        className="break-all text-brand-700 hover:text-brand-800"
                      >
                        {clinic.contact.email}
                      </a>
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Hours */}
            <div className="card p-7">
              <h2 className="flex items-center gap-2 font-heading text-xl text-ink-900">
                <RiTimeLine aria-hidden="true" className="h-5 w-5 text-gold-ink" />
                Opening hours
              </h2>

              <p className="mt-3 font-body text-sm font-medium text-ink-800">{summary}</p>

              <dl className="mt-5 divide-y divide-ink-900/8">
                {hours.map((day) => (
                  <div key={day.weekday} className="flex items-center justify-between py-2.5">
                    <dt className="font-ui text-sm text-ink-700">{day.label}</dt>
                    <dd className="font-ui text-sm text-ink-900">
                      {day.closed || !day.open || !day.close
                        ? "Closed"
                        : day.open === "00:00" && day.close === "24:00"
                          ? "Open 24 hours"
                          : `${displayTime(day.open)} – ${displayTime(day.close)}`}
                    </dd>
                  </div>
                ))}
              </dl>

              {!scheduleConfirmed && (
                <div className="mt-5">
                  <PlaceholderBadge label="Schedule being confirmed" />
                </div>
              )}
            </div>

            <div className="card p-7">
              <h2 className="font-heading text-xl text-ink-900">Languages</h2>
              <p className="mt-2 font-body text-sm text-ink-600">
                {clinic.languages.join(" · ")}
              </p>

              {clinic.social.facebook && (
                <a
                  href={clinic.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-brand-700/25 bg-brand-50 px-3.5 py-1.5 font-ui text-xs font-medium text-brand-800 transition-colors duration-200 hover:bg-brand-100"
                >
                  <RiFacebookCircleLine aria-hidden="true" className="h-4 w-4" />
                  Follow the clinic on Facebook
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="section bg-white">
        <div className="container-x">
          <SectionHeading
            eyebrow="Find us"
            title="Location"
            description={`The practice is in ${clinic.contact.addressLine}.`}
          />

          <div className="mt-8 overflow-hidden rounded-card border border-ink-900/10">
            {clinic.contact.mapEmbedUrl ? (
              <iframe
                src={clinic.contact.mapEmbedUrl}
                title={`Map showing the location of ${clinic.name}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-[24rem] w-full border-0"
              />
            ) : (
              <div className="flex min-h-[16rem] flex-col items-center justify-center gap-4 bg-[linear-gradient(135deg,#0b2342,#17466c)] px-6 py-14 text-center">
                <RiMapPin2Line aria-hidden="true" className="h-8 w-8 text-gold" />
                <p className="font-heading text-2xl text-white">{clinic.contact.addressLine}</p>
                {clinic.contact.mapLinkUrl && (
                  <a
                    href={clinic.contact.mapLinkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-gold"
                  >
                    <RiExternalLinkLine aria-hidden="true" className="h-4 w-4" />
                    Open in Google Maps
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                )}
                <p className="max-w-md font-body text-xs text-white/60">
                  The map opens on Google Maps. No street address is printed on this site, because
                  none has been supplied by the clinic.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
