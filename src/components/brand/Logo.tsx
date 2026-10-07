import Image from "next/image";
import Link from "next/link";

import { BrandMark } from "@/components/brand/BrandMark";
import { brand, logoSizing } from "@/content/media";
import { clinic } from "@/content/site";
import { cn } from "@/lib/utils";

/**
 * Clinic wordmark.
 *
 * ONE component is used by the site header, mobile navigation, footer, sign-in
 * screen and the admin sidebar — so the brand appears consistently everywhere
 * and swapping the artwork is a single change in `src/content/media.ts`.
 *
 * How the final logo is applied:
 *   1. save the files into `public/brand/` (see the list in `content/media.ts`),
 *   2. set `brand.logoLight` / `brand.logoDark` / `brand.markLight` to their
 *      paths.
 * Until then, a typographic wordmark in the clinic's navy + champagne gold is
 * rendered — matching the lockup's structure (wide-tracked caps over a smaller
 * "Dental Clinic" line), so nothing looks unfinished in the meantime.
 */

interface LogoProps {
  size?: "sm" | "md" | "lg";
  /** `light` renders the version intended for navy/dark backgrounds. */
  tone?: "dark" | "light";
  asLink?: boolean;
  /** Mark only, no wordmark — used in tight spaces such as the sidebar header. */
  compact?: boolean;
  className?: string;
}

const SIZES = {
  sm: { markPx: 30, height: logoSizing.height.sm },
  md: { markPx: 38, height: logoSizing.height.md },
  lg: { markPx: 52, height: logoSizing.height.lg },
} as const;

/** Approximate aspect ratio of the horizontal lockup (width ÷ height). */
const LOCKUP_RATIO = 3.7;

export function Logo({
  size = "md",
  tone = "dark",
  asLink = true,
  compact = false,
  className,
}: LogoProps) {
  const sizing = SIZES[size];
  const isLight = tone === "light";

  const lockupSrc = isLight ? brand.logoDark : brand.logoLight;
  const markSrc = isLight ? brand.markDark : brand.markLight;

  const artwork = compact && markSrc ? markSrc : lockupSrc;

  const content = artwork ? (
    <Image
      src={artwork}
      alt={clinic.name}
      width={Math.round(sizing.height * (compact ? 1 : LOCKUP_RATIO))}
      height={sizing.height}
      // The artwork is already a crisp export; no need to re-encode it.
      unoptimized
      className="w-auto"
      style={{ height: sizing.height }}
      priority={size === "lg"}
    />
  ) : (
    <span className={cn("flex items-center gap-3", className)}>
      {/* Mark */}
      <BrandMark size={sizing.markPx} tone={isLight ? "light" : "dark"} />

      {/* Wordmark — mirrors the supplied lockup's typographic structure. */}
      {!compact && (
        <span className="flex min-w-0 flex-col leading-none">
          <span
            className={cn(
              "truncate font-ui font-semibold uppercase tracking-[0.14em]",
              size === "lg" ? "text-base" : size === "md" ? "text-sm" : "text-xs",
              isLight ? "text-white" : "text-ink-900",
            )}
          >
            Dr. Bouamara
          </span>
          <span
            className={cn(
              "mt-1 truncate font-ui uppercase",
              size === "lg" ? "text-[0.625rem] tracking-[0.3em]" : "text-[0.5625rem] tracking-[0.28em]",
              isLight ? "text-gold/90" : "text-ink-500",
            )}
          >
            Dental Clinic
          </span>
        </span>
      )}
    </span>
  );

  if (!asLink) return content;

  return (
    <Link
      href="/"
      aria-label={`${clinic.name} — home`}
      className="rounded-lg transition-opacity duration-200 hover:opacity-90"
    >
      {content}
    </Link>
  );
}
