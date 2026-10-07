import Link from "next/link";
import {
  RiInstagramLine,
  RiFacebookCircleLine,
  RiTiktokLine,
  RiYoutubeLine,
  RiMapPin2Line,
  RiPhoneLine,
  RiMailLine,
  RiTimeLine,
} from "react-icons/ri";

import { Logo } from "@/components/brand/Logo";
import { Hairline, PlaceholderBadge } from "@/components/ui/primitives";
import { clinic, navigation, scheduleSummary } from "@/content/site";
import { legalPages } from "@/content/sections";
import { serviceCategories } from "@/content/services";
import { toTelHref, toWhatsAppHref } from "@/lib/utils";

/** Footer (server component — no interactivity needed). */
export function SiteFooter() {
  const year = new Date().getFullYear();

  const socials = [
    { key: "instagram", href: clinic.social.instagram, label: "Instagram", Icon: RiInstagramLine },
    { key: "facebook", href: clinic.social.facebook, label: "Facebook", Icon: RiFacebookCircleLine },
    { key: "tiktok", href: clinic.social.tiktok, label: "TikTok", Icon: RiTiktokLine },
    { key: "youtube", href: clinic.social.youtube, label: "YouTube", Icon: RiYoutubeLine },
  ].filter((social): social is typeof social & { href: string } => Boolean(social.href));


  return (
    <footer className="mt-auto bg-ink-900 text-ink-100">
      <div className="container-x py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div className="space-y-5">
            <Logo size="md" tone="light" />
            <p className="max-w-xs font-body text-sm leading-relaxed text-ink-100/70">
              {clinic.tagline} Clear explanations, unhurried appointments and modern equipment.
            </p>

            {socials.length > 0 ? (
              <div className="flex gap-3">
                {socials.map(({ key, href, label, Icon }) => (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-gold transition-colors hover:border-gold/50 hover:bg-white/5"
                  >
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </a>
                ))}
              </div>
            ) : (
              <PlaceholderBadge label="Social links pending" />
            )}
          </div>

          <nav aria-labelledby="footer-nav-heading">
            <h2 id="footer-nav-heading" className="font-heading text-lg text-white">
              Explore
            </h2>
            <ul className="mt-5 space-y-3">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="font-ui text-sm text-ink-100/75 transition-colors hover:text-gold"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/appointment"
                  className="font-ui text-sm text-ink-100/75 transition-colors hover:text-gold"
                >
                  Request an appointment
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-labelledby="footer-services-heading">
            <h2 id="footer-services-heading" className="font-heading text-lg text-white">
              Treatments
            </h2>
            <ul className="mt-5 space-y-3">
              {serviceCategories.slice(0, 6).map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/services#${category.id}`}
                    className="font-ui text-sm text-ink-100/75 transition-colors hover:text-gold"
                  >
                    {category.shortName}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-heading text-lg text-white">Visit us</h2>
            <ul className="mt-5 space-y-4 font-ui text-sm text-ink-100/75">
              <li className="flex gap-3">
                <RiMapPin2Line aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span className="block">{clinic.contact.addressLine}</span>
              </li>
              <li className="flex gap-3">
                <RiPhoneLine aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span className="flex flex-col gap-1">
                  <a href={toTelHref(clinic.contact.phone)} className="hover:text-gold">
                    {clinic.contact.phoneDisplay}
                  </a>
                  <a href={toTelHref(clinic.contact.phoneSecondary)} className="hover:text-gold">
                    {clinic.contact.phoneSecondaryDisplay}
                  </a>
                  {clinic.contact.whatsapp && (
                    <a
                      href={toWhatsAppHref(clinic.contact.whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ink-100/60 hover:text-gold"
                    >
                      WhatsApp
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  )}
                </span>
              </li>
              <li className="flex gap-3">
                <RiMailLine aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <a href={`mailto:${clinic.contact.email}`} className="break-all hover:text-gold">
                  {clinic.contact.email}
                </a>
              </li>
              <li className="flex gap-3">
                <RiTimeLine aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>{scheduleSummary}</span>
              </li>
            </ul>
          </div>
        </div>

        <Hairline className="my-10 opacity-40" />

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {legalPages.map((page) => (
              <Link
                key={page.id}
                href={page.href}
                className="font-ui text-xs text-ink-100/60 transition-colors hover:text-gold"
              >
                {page.label}
              </Link>
            ))}
            <Link
              href="/admin"
              className="font-ui text-xs text-ink-100/40 transition-colors hover:text-gold"
            >
              Staff area
            </Link>
          </div>

          <p className="font-ui text-xs text-ink-100/50">
            © {year} {clinic.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
