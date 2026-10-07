import type { Metadata } from "next";
import Link from "next/link";

import { CtaBand } from "@/components/home/CtaBand";
import {
  MediaPlaceholder,
  PlaceholderBadge,
  SectionHeading,
  ValueList,
} from "@/components/ui/primitives";
import { doctor } from "@/content/media";
import { aboutContent, doctorProfile, facilityContent, values } from "@/content/sections";
import { clinic, scheduleConfirmed } from "@/content/site";

export const metadata: Metadata = {
  title: "About the practice",
  description:
    "About Dr. Bouamara Dental Clinic: how the practice works, what patients can expect, and the standards behind each appointment.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main>
      {/* ── Hero: the doctor ─────────────────────────────────────────────── */}
      <section className="bg-ink-900 py-16 text-white sm:py-20">
        <div className="container-x grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <SectionHeading
              tone="dark"
              as="h1"
              eyebrow={aboutContent.eyebrow}
              title={aboutContent.title}
              description={aboutContent.intro}
            />

            {scheduleConfirmed && (
              <p className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-4 py-2 font-ui text-xs uppercase tracking-[0.18em] text-white/75">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-gold" />
                Open 24 hours, 7 days a week
              </p>
            )}
          </div>

          {/* Portrait of Dr. Bouamara — replaceable in src/content/media.ts */}
          <figure className="relative mx-auto w-full max-w-md">
            <MediaPlaceholder
              src={doctor.portrait.src}
              alt={doctor.portrait.alt}
              label={doctorProfile.name}
              caption="Portrait pending"
              icon="◍"
              priority
              className="aspect-4/5 w-full rounded-card border border-white/12"
              imageClassName="object-top"
              sizes="(min-width: 1024px) 40vw, 100vw"
            />
            <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <span>
                <span className="block font-heading text-lg text-white">{doctorProfile.name}</span>
                <span className="font-ui text-xs uppercase tracking-[0.2em] text-gold/90">
                  {doctorProfile.role}
                </span>
              </span>
              {!doctor.portrait.src && <PlaceholderBadge label="Photograph pending" />}
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ── At a glance (confirmed facts only) ───────────────────────────── */}
      <section className="bg-cream-100 py-14">
        <div className="container-x">
          <dl className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Practice", value: clinic.name },
              { label: "Location", value: clinic.contact.addressLine },
              { label: "Languages", value: clinic.languages.join(" · ") },
              {
                label: "Opening hours",
                value: scheduleConfirmed ? "24 hours, every day" : "Being confirmed",
              },
            ].map((item) => (
              <div key={item.label} className="border-t border-ink-900/12 pt-5">
                <dt className="font-ui text-[0.6875rem] uppercase tracking-[0.22em] text-ink-500">
                  {item.label}
                </dt>
                <dd className="mt-2 font-heading text-xl text-ink-900">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── The practice narrative ───────────────────────────────────────── */}
      <section className="section bg-white">
        <div className="container-x grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading eyebrow="The practice" title="How we work" />
            <div className="mt-6 space-y-5">
              {aboutContent.placeholderParagraphs.map((paragraph) => (
                <p key={paragraph} className="font-body text-base leading-relaxed text-ink-600">
                  {paragraph}
                </p>
              ))}
            </div>
            {aboutContent.isPlaceholder && (
              <PlaceholderBadge className="mt-6" label="Narrative copy pending" />
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-card border border-ink-900/10 bg-cream-50 p-7">
              <h3 className="font-heading text-xl text-ink-900">What to expect at a visit</h3>
              <ValueList
                className="mt-4"
                items={[
                  "A discussion of your concerns before any examination",
                  "An examination, with imaging only where clinically indicated",
                  "Findings explained in plain language, with alternatives",
                  "A written plan you can take away and consider",
                ]}
              />
            </div>

            <div className="rounded-card border border-gold-ink/25 bg-gold-ink/[0.04] p-7">
              <h3 className="font-heading text-xl text-ink-900">Treatment rooms &amp; environment</h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-ink-600">
                {facilityContent.body}
              </p>
              <Link
                href="/gallery"
                className="mt-4 inline-flex font-ui text-xs font-semibold uppercase tracking-eyebrow text-gold-ink transition hover:text-ink-900"
              >
                See the gallery →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ───────────────────────────────────────────────────────── */}
      <section className="section bg-cream-100">
        <div className="container-x">
          <SectionHeading
            align="center"
            eyebrow="Principles"
            title="What guides the practice"
            description="These are the commitments the site is built around. The clinic should confirm or amend them before launch."
          />

          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <li key={value.id} className="card p-7">
                <span aria-hidden="true" className="font-heading text-2xl text-gold-ink">
                  ◈
                </span>
                <h3 className="mt-4 font-heading text-xl text-ink-900">{value.title}</h3>
                <p className="mt-3 font-body text-sm leading-relaxed text-ink-600">
                  {value.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Practitioner ─────────────────────────────────────────────────── */}
      <section className="section bg-white">
        <div className="container-x grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-16">
          <MediaPlaceholder
            src={doctor.secondary.src}
            alt={doctor.secondary.alt}
            label={doctorProfile.name}
            caption={doctorProfile.name}
            icon="◍"
            className="aspect-4/5 w-full rounded-card border border-ink-900/10"
            sizes="(min-width: 1024px) 40vw, 100vw"
            imageClassName="object-cover"
          />

          <div>
            <SectionHeading
              eyebrow="The practitioner"
              title={doctorProfile.name}
              description={doctorProfile.role}
            />

            <p className="mt-6 font-body text-base leading-relaxed text-ink-600">
              {doctorProfile.bio ??
                "A short biography — training, areas of interest and years in practice — will be published here once the clinic has supplied and approved the exact wording."}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {doctorProfile.credentials ? (
                <span className="rounded-full border border-ink-900/12 px-4 py-2 font-ui text-xs uppercase tracking-[0.16em] text-ink-600">
                  {doctorProfile.credentials}
                </span>
              ) : (
                <PlaceholderBadge label="Qualifications & credentials pending" />
              )}
            </div>

            <p className="mt-6 max-w-prose font-body text-xs leading-relaxed text-ink-500">
              The practice publishes no invented awards, statistics or accreditations. Verified
              details are added only once the clinic provides them.
            </p>
          </div>
        </div>
      </section>

      <CtaBand
        title="Questions before your first visit?"
        description="Send the clinic a message, or request an appointment and ask at your consultation."
        primaryLabel="Request an appointment"
      />
    </main>
  );
}
