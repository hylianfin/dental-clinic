import type { Metadata } from "next";

import { CtaBand } from "@/components/home/CtaBand";
import { ServiceGrid } from "@/components/services/ServiceGrid";
import { PlaceholderBadge, SectionHeading } from "@/components/ui/primitives";
import { getPublicServices } from "@/lib/queries/site";

export const metadata: Metadata = {
  title: "Services & treatments",
  description:
    "Dental treatments available at Dr. Bouamara Dental Clinic. Each appointment is planned from an examination, with options and costs explained before treatment.",
  alternates: { canonical: "/services" },
};

export default async function ServicesPage() {
  const services = await getPublicServices();

  return (
    <main>
      <section className="bg-ink-900 py-16 text-white sm:py-20">
        <div className="container-x">
          <SectionHeading
            tone="dark"
            as="h1"
            eyebrow="Services"
            title="Treatments, clearly described"
            description="Every treatment below lists what the appointment involves. Nothing is booked on this page — start a request and the clinic confirms the time with you."
          />
        </div>
      </section>

      <section className="section bg-cream-100">
        <div className="container-x">
          <div className="mb-10 flex flex-wrap items-center gap-3">
            <PlaceholderBadge label="Catalogue under review" />
            <p className="font-body text-sm text-ink-600">
              The clinic will confirm which treatments it offers, their appointment lengths and any
              pricing notes.
            </p>
          </div>

          <ServiceGrid services={services} />
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-x grid gap-10 lg:grid-cols-3">
          {[
            {
              title: "Planned, not assumed",
              body: "Treatment is planned from an examination and, where needed, imaging — not from a photo or a phone description.",
            },
            {
              title: "Costs before treatment",
              body: "You receive a written plan with the phases and estimated costs so you can decide without pressure.",
            },
            {
              title: "Time to ask",
              body: "Appointments are scheduled with room to discuss alternatives, including doing nothing for now.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-card border border-ink-900/10 bg-cream-50 p-7">
              <h2 className="font-heading text-xl text-ink-900">{item.title}</h2>
              <p className="mt-3 font-body text-sm leading-relaxed text-ink-600">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <CtaBand
        title="Not sure which treatment you need?"
        description="Book a consultation and the clinic will advise on the options after an examination."
        primaryLabel="Request a consultation"
      />
    </main>
  );
}
