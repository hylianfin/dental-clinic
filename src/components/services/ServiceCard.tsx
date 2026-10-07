import Link from "next/link";
import { RiArrowRightLine } from "react-icons/ri";

import { MediaPlaceholder } from "@/components/ui/primitives";
import { getServiceImage } from "@/content/media";
import { categoryName } from "@/content/services";
import type { Service } from "@/types/content";

/** Service card used on the home page and the services grid. */
export function ServiceCard({
  service,
  priority = false,
}: {
  service: Service;
  priority?: boolean;
}) {
  const art = getServiceImage(service.slug);

  return (
    <article className="card-interactive group flex h-full flex-col overflow-hidden">
      <MediaPlaceholder
        src={service.image ?? art?.src ?? null}
        alt={art?.alt ?? service.title}
        label={service.title}
        caption={
          art?.illustrative
            ? `Illustrative image · ${service.durationMinutes} min appointment`
            : `${service.durationMinutes} min appointment`
        }
        tag={art?.illustrative ? "Illustrative image" : undefined}
        className="h-48 w-full"
        imageClassName="transition-transform duration-500 ease-premium group-hover:scale-[1.04]"
        priority={priority}
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
      />

      <div className="flex flex-1 flex-col p-6">
        <p className="font-ui text-[0.6875rem] font-semibold uppercase tracking-eyebrow text-gold-ink">
          {categoryName(service.category)}
        </p>

        <h3 className="mt-3 font-heading text-2xl leading-snug text-ink-900">
          <Link
            href={`/services#${service.slug}`}
            className="transition-colors hover:text-brand-700"
          >
            {service.title}
          </Link>
        </h3>

        <p className="mt-3 font-body text-sm leading-relaxed text-ink-600">{service.summary}</p>

        <div className="mt-auto flex items-center justify-between pt-6">
          <span className="font-ui text-xs text-ink-400">
            {service.details.length} details
          </span>
          <Link
            href={`/appointment?service=${service.slug}`}
            className="inline-flex items-center gap-2 font-ui text-sm text-brand-700 transition-colors hover:text-brand-800"
          >
            Request this
            <RiArrowRightLine aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
