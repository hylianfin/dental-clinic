import Link from "next/link";
import { RiArrowRightLine, RiCalendarCheckLine, RiMapPin2Line, RiTimeLine } from "react-icons/ri";

import { Reveal } from "@/components/ui/Reveal";
import { MediaPlaceholder } from "@/components/ui/primitives";
import { clinicPhoto } from "@/content/media";
import { clinic, navigation, scheduleSummary } from "@/content/site";
import { heroContent } from "@/content/sections";
import { services } from "@/content/services";

/** Home hero. */
export function Hero() {
  const treatmentCount = services.length;

  return (
    <section className="relative isolate overflow-hidden bg-ink-900 text-white">
      <div className="container-x relative z-10 grid gap-14 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-28">
        <div>
          <Reveal>
            <p className="eyebrow-on-dark">{heroContent.eyebrow}</p>
          </Reveal>

          <Reveal delay={60}>
            <h1 className="mt-5 font-heading text-display-sm font-normal leading-[1.08] tracking-tight text-white sm:text-display-md lg:text-display-lg">
              {heroContent.title}
              <span className="block text-gold">{heroContent.titleAccent}</span>
            </h1>
          </Reveal>

          <Reveal delay={120}>
            <p className="mt-6 max-w-xl font-body text-base leading-relaxed text-ink-100/80 sm:text-lg">
              {heroContent.subtitle}
            </p>
          </Reveal>

          <Reveal delay={180}>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href={heroContent.primaryCta.href} className="btn-gold">
                {heroContent.primaryCta.label}
                <RiArrowRightLine aria-hidden="true" className="h-4 w-4" />
              </Link>
              <Link href={heroContent.secondaryCta.href} className="btn-outline-light">
                {heroContent.secondaryCta.label}
              </Link>
            </div>
          </Reveal>

          <Reveal delay={240}>
            <dl className="mt-12 grid max-w-lg grid-cols-1 gap-6 border-t border-white/10 pt-8 sm:grid-cols-3">
              <div className="flex items-start gap-3">
                <RiCalendarCheckLine aria-hidden="true" className="mt-0.5 h-5 w-5 text-gold" />
                <div>
                  <dt className="font-ui text-[0.6875rem] font-semibold uppercase tracking-wider text-white/50">
                    Booking
                  </dt>
                  <dd className="mt-1 font-body text-sm text-white/85">
                    Online requests, confirmed by the clinic
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <RiTimeLine aria-hidden="true" className="mt-0.5 h-5 w-5 text-gold" />
                <div>
                  <dt className="font-ui text-[0.6875rem] font-semibold uppercase tracking-wider text-white/50">
                    Opening hours
                  </dt>
                  <dd className="mt-1 font-body text-sm text-white/85">{scheduleSummary}</dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <RiMapPin2Line aria-hidden="true" className="mt-0.5 h-5 w-5 text-gold" />
                <div>
                  <dt className="font-ui text-[0.6875rem] font-semibold uppercase tracking-wider text-white/50">
                    Location
                  </dt>
                  <dd className="mt-1 font-body text-sm text-white/85">
                    {clinic.contact.addressLine}
                  </dd>
                </div>
              </div>
            </dl>
          </Reveal>
        </div>

        <Reveal delay={120} className="relative">
          <div className="relative mx-auto aspect-4/5 w-full max-w-md overflow-hidden rounded-card border border-white/10 shadow-lift lg:max-w-none">
            <MediaPlaceholder
              src={clinicPhoto.src}
              alt={clinicPhoto.alt}
              label="The practice"
              caption={
                clinicPhoto.illustrative
                  ? "Illustrative image — real photographs of the clinic are on the way"
                  : "The practice"
              }
              tag={clinicPhoto.illustrative ? "Illustrative image" : undefined}
              className="h-full w-full"
              priority
              sizes="(min-width: 1024px) 45vw, 90vw"
              icon="◎"
            />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 rounded-card border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm sm:grid-cols-3">
            <div>
              <p className="font-heading text-3xl text-gold">{treatmentCount}</p>
              <p className="mt-1 font-ui text-[0.6875rem] uppercase tracking-wider text-white/60">
                Treatments listed
              </p>
            </div>
            <div>
              <p className="font-heading text-3xl text-gold">{navigation.length}</p>
              <p className="mt-1 font-ui text-[0.6875rem] uppercase tracking-wider text-white/60">
                Sections to explore
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="font-heading text-3xl text-gold">
                {clinic.languages.length}
              </p>
              <p className="mt-1 font-ui text-[0.6875rem] uppercase tracking-wider text-white/60">
                Languages spoken
              </p>
            </div>
          </div>
        </Reveal>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-gold/10 blur-3xl"
      />
    </section>
  );
}
