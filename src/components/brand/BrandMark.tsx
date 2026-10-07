import { BRAND_COLORS, SMILE_PATH, TOOTH_PATH } from "@/components/brand/mark";
import { cn } from "@/lib/utils";

/**
 * The clinic mark, rendered inline (no image request, crisp at every size).
 *
 * Used wherever a square icon is needed and no logo file has been supplied:
 * the header lockup, the admin sidebar and the sign-in screen. The moment
 * `brand.markLight` / `brand.markDark` are set in `src/content/media.ts`, the
 * Logo component uses those files instead and this component is not rendered.
 */
export function BrandMark({
  size = 40,
  tone = "dark",
  className,
  title,
}: {
  size?: number;
  /** `light` is the variant for navy backgrounds. */
  tone?: "dark" | "light";
  className?: string;
  /** Omit for a decorative mark (the surrounding link already has a label). */
  title?: string;
}) {
  const onNavy = tone === "light";

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={cn("shrink-0", className)}
    >
      <rect
        width="64"
        height="64"
        rx="15"
        fill={onNavy ? BRAND_COLORS.cream : BRAND_COLORS.navy}
      />
      <g transform="matrix(0.72 0 0 0.72 8.96 2.6)">
        <path d={TOOTH_PATH} fill={onNavy ? BRAND_COLORS.navy : BRAND_COLORS.cream} />
      </g>
      <path
        d={SMILE_PATH}
        fill="none"
        stroke={onNavy ? BRAND_COLORS.gold : BRAND_COLORS.gold}
        strokeWidth="3.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
