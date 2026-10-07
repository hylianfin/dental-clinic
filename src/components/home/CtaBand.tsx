import Link from "next/link";
import { RiArrowRightLine, RiPhoneLine, RiWhatsappLine } from "react-icons/ri";

import { clinic } from "@/content/site";
import { toTelHref, toWhatsAppHref } from "@/lib/utils";

/**
 * Closing call-to-action band.
 *
 * Contact options are configuration-driven: the WhatsApp button only appears
 * once a number is set in `src/content/site.ts` — currently the clinic's
 * secondary number, +213 671 149 592 — and the phone link uses the primary
 * number.
 */
export function CtaBand({
  title = "Ready to book your visit?",
  description = "Send a request and the clinic will confirm your appointment time.",
  primaryHref = "/appointment",
  primaryLabel = "Request an appointment",
}: {
  title?: string;
  description?: string;
  primaryHref?: string;
  primaryLabel?: string;
}) {
  const whatsappHref = clinic.contact.whatsapp
    ? toWhatsAppHref(clinic.contact.whatsapp)
    : null;

  return (
    <section className="bg-ink-900 py-16 text-white sm:py-20">
      <div className="container-x">
        <div className="flex flex-col items-start gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-heading text-3xl text-white sm:text-4xl">{title}</h2>
            <p className="mt-4 font-body text-base leading-relaxed text-ink-100/75">
              {description}
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link href={primaryHref} className="btn-gold">
              {primaryLabel}
              <RiArrowRightLine aria-hidden="true" className="h-4 w-4" />
            </Link>

            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline-light"
              >
                <RiWhatsappLine aria-hidden="true" className="h-4 w-4" />
                WhatsApp
                <span className="sr-only">
                  (opens WhatsApp in a new tab)
                </span>
              </a>
            ) : null}

            <a href={toTelHref(clinic.contact.phone)} className="btn-outline-light">
              <RiPhoneLine aria-hidden="true" className="h-4 w-4" />
              {clinic.contact.phoneDisplay}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
