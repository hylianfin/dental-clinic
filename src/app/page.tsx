import Link from "next/link";
import { RiArrowRightLine, RiCalendarCheckLine, RiChat3Line, RiStethoscopeLine } from "react-icons/ri";

import { CtaBand } from "@/components/home/CtaBand";
import { Hero } from "@/components/home/Hero";
import { MediaAppearanceSection } from "@/components/home/MediaAppearance";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { TrustStrip } from "@/components/home/TrustStrip";
import { ServiceCard } from "@/components/services/ServiceCard";
import { Reveal } from "@/components/ui/Reveal";
import { PlaceholderBadge, SectionHeading, ValueList } from "@/components/ui/primitives";
import { faqs, values } from "@/content/sections";
import { getFeaturedServices } from "@/lib/queries/site";

/** Home page — a Server Component: content is rendered on the server. */
export default async function HomePage() {
  const featured = await getFeaturedServices(3);

  const steps = [
    {
      icon: RiStethoscopeLine,
      title: "1 · Choose a treatment",
      body: "Pick the service you need. Each one lists what the appointment involves and how long to allow.",
    },
    {
      icon: RiCalendarCheckLine,
      title: "2 · Pick a time",
      body: "Available slots are generated from the clinic's opening hours and existing bookings, so you only see times that are free.",
    },
    {
      icon: RiChat3Line,
      title: "3 · The clinic confirms",
      body: "Your request is reviewed and confirmed by the clinic. You will be told the outcome before the appointment.",
    },
  ];

  return (
    <main>
      <Hero />
      <TrustStrip />

      {/* Featured treatments */}
      <section className="section bg-white">
        <div className="container-x">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Treatments"
              title="Care, planned around you"
              description="A selection of the treatments listed at this clinic. Every appointment is planned from an examination, with the options explained before anything is agreed."
            />
            <Link href="/services" className="btn-outline shrink-0">
              All services
              <RiArrowRightLine aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((service, index) => (
              <Reveal key={service.id} delay={index * 80}>
                <ServiceCard service={service} priority={index < 2} />
              </Reveal>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-3">
            <PlaceholderBadge label="Service catalogue under review" />
            <p className="font-body text-xs text-ink-500">
              The clinic will confirm which treatments are offered and how long each appointment
              takes.
            </p>
          </div>
        </div>
      </section>

      {/* Approach + booking steps */}
      <section className="section bg-ink-900 text-white">
        <div className="container-x">
          <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <div>
              <SectionHeading
                tone="dark"
                eyebrow="How it works"
                title="Appointments, plainly explained"
                description="No instant confirmation button that quietly does nothing — the flow reflects how the clinic actually works."
              />

              <ol className="mt-10 space-y-8">
                {steps.map((step, index) => (
                  <Reveal as="li" key={step.title} delay={index * 80} className="flex gap-5">
                    <span
                      aria-hidden="true"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold"
                    >
                      <step.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-heading text-xl text-white">{step.title}</h3>
                      <p className="mt-2 font-body text-sm leading-relaxed text-ink-100/75">
                        {step.body}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </ol>
            </div>

            <div className="rounded-card border border-white/10 bg-white/[0.04] p-8 backdrop-blur-sm lg:p-10">
              <h3 className="font-heading text-2xl text-white">What the practice stands for</h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-ink-100/70">
                Four principles that shape every appointment.
              </p>

              <div className="mt-8 space-y-7">
                {values.map((value) => (
                  <div key={value.id} className="border-t border-white/10 pt-6 first:border-0 first:pt-0">
                    <h4 className="font-heading text-lg text-gold">{value.title}</h4>
                    <p className="mt-2 font-body text-sm leading-relaxed text-ink-100/75">
                      {value.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Practical info + FAQ */}
      <section className="section bg-white">
        <div className="container-x grid gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading
              eyebrow="Before you book"
              title="Practical information"
              description="The essentials patients usually ask about."
            />

            <div className="mt-8 rounded-card border border-gold-ink/20 bg-cream-50 p-6">
              <h3 className="font-heading text-xl text-ink-900">Payment & insurance</h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-ink-600">
                Placeholder — the clinic will confirm accepted payment methods, whether insurance or
                third-party payment is handled, and how written estimates are issued.
              </p>
              <PlaceholderBadge className="mt-4" label="Policy pending" />
            </div>

            <div className="mt-6 rounded-card border border-ink-900/10 bg-white p-6">
              <h3 className="font-heading text-xl text-ink-900">What to bring</h3>
              <ValueList
                className="mt-4"
                items={[
                  "Photo identification",
                  "Any recent X-rays or imaging, if you have them",
                  "A list of current medication",
                  "Details of any previous dental treatment you can share",
                ]}
              />
            </div>
          </div>

          <div>
            <SectionHeading
              eyebrow="FAQ"
              title="Common questions"
              description="Answers marked as placeholders still need the clinic's own wording."
            />

            <div className="mt-8 divide-y divide-ink-900/8 border-y border-ink-900/8">
              {faqs.map((faq) => (
                <details key={faq.id} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                    <span className="font-heading text-lg text-ink-900">{faq.question}</span>
                    <span
                      aria-hidden="true"
                      className="mt-1 text-gold-ink transition-transform duration-300 group-open:rotate-45"
                    >
                      ＋
                    </span>
                  </summary>
                  <div className="mt-3 space-y-3">
                    <p className="font-body text-sm leading-relaxed text-ink-600">{faq.answer}</p>
                    {faq.isPlaceholder && <PlaceholderBadge label="Answer pending" />}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <MediaAppearanceSection />
      <ReviewsSection />
      <CtaBand />
    </main>
  );
}
