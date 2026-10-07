/**
 * ============================================================================
 *  BRAND MARK — the geometry of the clinic's icon
 * ============================================================================
 *  One source for every rendering of the mark: the React component in the
 *  navbar/sidebar, the favicon (`src/app/icon.svg`) and the raster app icon.
 *
 *  When the clinic's own logo files arrive they are used verbatim instead —
 *  set `brand.logoLight` / `brand.markLight` in `src/content/media.ts` and this
 *  artwork is no longer rendered anywhere.
 *
 *  Structure: a deep-navy rounded square (the clinic's primary colour) holding
 *  a cream tooth, with a champagne-gold smile arc beneath it.
 * ============================================================================
 */

export const BRAND_COLORS = {
  navy: "#0B2342",
  navyDeep: "#081A31",
  cream: "#FAFAF8",
  gold: "#C2A06B",
  goldSoft: "#D8BC8E",
} as const;

/** Tooth silhouette: rounded crown and two roots. */
export const TOOTH_PATH =
  "M32 13C24 13 22 9 16 9C9 9 5 15 5 24C5 33 8 39 10 47C11.5 53 13 56 16 56C19 56 19.5 52 20.5 47.5C21.5 42.5 23 40 27 40C30 40 31 41.5 32 41.5C33 41.5 34 40 37 40C41 40 42.5 42.5 43.5 47.5C44.5 52 45 56 48 56C51 56 52.5 53 54 47C56 39 59 33 59 24C59 15 55 9 48 9C42 9 40 13 32 13Z";

/** Smile arc drawn under the tooth. */
export const SMILE_PATH = "M19.5 45.5C23.5 55.5 40.5 55.5 44.5 45.5";

/**
 * The complete mark as an SVG string — used for the favicon and app icon.
 * `background: false` renders a transparent (glyph-only) version.
 */
export function brandMarkSvg(options: { size?: number; background?: boolean } = {}): string {
  const { size = 64, background = true } = options;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}" role="img" aria-label="Dr. Bouamara Dental Clinic">
  ${
    background
      ? `<defs><linearGradient id="db-navy" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${BRAND_COLORS.navy}"/><stop offset="1" stop-color="${BRAND_COLORS.navyDeep}"/></linearGradient></defs>
  <rect width="64" height="64" rx="15" fill="url(#db-navy)"/>`
      : ""
  }
  <g transform="matrix(0.72 0 0 0.72 8.96 2.6)">
    <path d="${TOOTH_PATH}" fill="${BRAND_COLORS.cream}"/>
  </g>
  <path d="${SMILE_PATH}" fill="none" stroke="${BRAND_COLORS.gold}" stroke-width="3.4" stroke-linecap="round"/>
</svg>
`;
}

/** Gold-on-navy variant for dark backgrounds. */
export function brandMarkSvgDark(options: { size?: number } = {}): string {
  const { size = 64 } = options;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}" role="img" aria-label="Dr. Bouamara Dental Clinic">
  <defs><linearGradient id="db-navy" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${BRAND_COLORS.navy}"/><stop offset="1" stop-color="${BRAND_COLORS.navyDeep}"/></linearGradient></defs>
  <rect width="64" height="64" rx="15" fill="url(#db-navy)"/>
  <g transform="matrix(0.72 0 0 0.72 8.96 2.6)">
    <path d="${TOOTH_PATH}" fill="${BRAND_COLORS.cream}"/>
  </g>
  <path d="${SMILE_PATH}" fill="none" stroke="${BRAND_COLORS.goldSoft}" stroke-width="3.4" stroke-linecap="round"/>
</svg>
`;
}
