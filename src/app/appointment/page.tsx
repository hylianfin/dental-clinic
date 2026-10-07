import type { Metadata } from "next";
import { RiCalendarCheckLine, RiFileTextLine, RiShieldCheckLine } from "react-icons/ri";

import { BookingWizard } from "@/components/booking/BookingWizard";
import { SectionHeading, ValueList } from "@/components/ui/primitives";
import { bookingNotice } from "@/content/sections";
import { clinic, scheduleSummary } from "@/content/site";
import { getDayAvailability, getBookingCalendar } from "@/lib/services/availability";
import { getPublicServices } from "@/lib/queries/site";
import { toTelHref } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Request an appointment",
  description:
    "Request a dental appointment at Dr. Bouamara Dental Clinic. Choose a treatment, pick any date and time from the live calendar, and the clinic confirms your appointment.",
  alternates: { canonical: "/appointment" },
};

export default async function AppointmentPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const [{ service: requestedSlug }, services] = await Promise.all([
    searchParams,
    getPublicServices(),
  ]);

  const initialService = requestedSlug
    ? services.find((service) => service.slug === requestedSlug)
    : undefined;
  const initialServiceId = initialService?.id;

  /**
   * The whole booking horizon is computed on the server so the calendar is
   * present in the first paint, and the times for the first bookable day are
   * fetched too — a patient arriving from a treatment page never sees an empty
   * step 2.
   */
  const calendar = await getBookingCalendar();

  const initialDay =
    initialService && calendar.firstBookableDate
      ? await getDayAvailability(calendar.firstBookableDate, initialService.durationMinutes)
      : null;

  return (
    <main>
      <section className="bg-ink-900 py-16 text-white sm:py-20">
        <div className="container-x">
          <SectionHeading
            tone="dark"
            as="h1"
            eyebrow="Appointments"
            title="Request your visit"
            description={bookingNotice.body}
          />
        </div>
      </section>

      <section className="section bg-cream-100">
        <div className="container-x grid gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:items-start">
          <BookingWizard
            services={services}
            calendar={calendar}
            initialServiceId={initialServiceId}
            initialDay={initialDay}
          />

          <aside className="space-y-6">
            <div className="card p-7">
              <h2 className="font-heading text-xl text-ink-900">How your request works</h2>
              <ul className="mt-4 space-y-4">
                {[
                  {
                    icon: RiShieldCheckLine,
                    title: "Your slot is held for review",
                    body: "The clinic sees your request immediately and confirms or proposes another time.",
                  },
                  {
                    icon: RiFileTextLine,
                    title: "What happens next",
                    body: "You will be contacted using the details you provide. Bring any recent imaging to the appointment.",
                  },
                  {
                    icon: RiCalendarCheckLine,
                    title: "Need to change it?",
                    body: "Reply to the confirmation message with your reference number and the clinic will rearrange it.",
                  },
                ].map((item) => (
                  <li key={item.title} className="flex gap-3">
                    <item.icon
                      aria-hidden="true"
                      className="mt-0.5 h-5 w-5 shrink-0 text-gold-ink"
                    />
                    <div>
                      <p className="font-ui text-sm font-medium text-ink-900">{item.title}</p>
                      <p className="mt-1 font-body text-sm leading-relaxed text-ink-600">
                        {item.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card p-7">
              <h2 className="font-heading text-xl text-ink-900">Contact the clinic</h2>
              <p className="mt-2 font-body text-sm leading-relaxed text-ink-600">
                {scheduleSummary}. For urgent problems, call rather than using the form.
              </p>
              <div className="mt-4 space-y-1 font-body text-base text-ink-900">
                <a
                  href={toTelHref(clinic.contact.phone)}
                  className="block font-medium text-brand-700 hover:text-brand-800"
                >
                  {clinic.contact.phoneDisplay}
                </a>
                <a
                  href={toTelHref(clinic.contact.phoneSecondary)}
                  className="block font-medium text-brand-700 hover:text-brand-800"
                >
                  {clinic.contact.phoneSecondaryDisplay}
                </a>
                <a
                  href={`mailto:${clinic.contact.email}`}
                  className="block break-all font-body text-sm text-brand-700 hover:text-brand-800"
                >
                  {clinic.contact.email}
                </a>
              </div>
            </div>

            <div className="rounded-card border border-gold-ink/25 bg-white p-7">
              <h2 className="font-heading text-xl text-ink-900">Before your visit</h2>
              <ValueList
                className="mt-4"
                items={[
                  "Bring photo identification",
                  "List your current medication",
                  "Arrive a few minutes early for paperwork",
                  "Tell the clinic about any allergies in advance",
                ]}
              />
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
