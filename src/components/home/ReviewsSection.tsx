import { RiShieldCheckLine } from "react-icons/ri";

import { PlaceholderBadge, SectionHeading } from "@/components/ui/primitives";
import { approvedTestimonials } from "@/content/sections";

/**
 * Patient reviews.
 *
 * Intentionally honest: no reviews are invented. When real, consented reviews
 * are added to `src/content/sections.ts` (and approved), they render here as
 * cards; until then, an explanatory panel is shown.
 */
export function ReviewsSection() {
  const reviews = approvedTestimonials();

  return (
    <section className="section bg-cream-100">
      <div className="container-x">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Patient feedback"
            title="Reviews from patients"
            description="Reviews are only published with the patient's written consent."
          />
          <PlaceholderBadge label="Awaiting consented reviews" />
        </div>

        {reviews.length > 0 ? (
          <ul className="mt-12 grid gap-6 lg:grid-cols-3">
            {reviews.map((review) => (
              <li key={review.id} className="card p-7">
                <div
                  className="flex gap-1 text-gold-ink"
                  aria-label={`${review.rating} out of 5`}
                >
                  {Array.from({ length: 5 }).map((_, index) => (
                    <span key={index} aria-hidden="true">
                      {index < review.rating ? "★" : "☆"}
                    </span>
                  ))}
                </div>
                <blockquote className="mt-5 font-body text-sm leading-relaxed text-ink-700">
                  “{review.quote}”
                </blockquote>
                <footer className="mt-6 border-t border-ink-900/8 pt-4">
                  <p className="font-heading text-lg text-ink-900">{review.author}</p>
                  {review.role && (
                    <p className="font-ui text-xs text-ink-500">{review.role}</p>
                  )}
                </footer>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-10 grid gap-6 rounded-card border border-dashed border-ink-900/15 bg-white p-8 lg:grid-cols-[auto_1fr] lg:items-center lg:p-10">
            <span
              aria-hidden="true"
              className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-700/8 text-brand-700"
            >
              <RiShieldCheckLine className="h-7 w-7" />
            </span>
            <div>
              <h3 className="font-heading text-xl text-ink-900">
                No reviews published yet — on purpose
              </h3>
              <p className="mt-2 max-w-2xl font-body text-sm leading-relaxed text-ink-600">
                Inventing testimonials is dishonest and, for a medical practice, often unlawful
                advertising. Real reviews are added here once patients have given written consent
                and the clinic has approved the wording. The space is reserved and styled, so the
                layout will not shift when they arrive.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
