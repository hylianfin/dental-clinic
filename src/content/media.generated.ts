/**
 * ============================================================================
 *  MEDIA MANIFEST — the files that `npm run media:setup` produced
 * ============================================================================
 *  `scripts/media-setup.mjs` writes processed images into `public/media/…` (and
 *  the brand artwork into `public/brand/`), then prints a ready-to-paste
 *  snippet for this file. It never rewrites the file itself, so hand-edited
 *  entries are never lost — paste the snippet, or point an entry at any URL.
 *  `src/content/media.ts` reads everything from here.
 *
 *  Every value is `null`/empty until a real file exists, which is what makes
 *  the site fall back to a labelled placeholder instead of a broken image.
 *  Commit this file so every environment renders identically.
 * ============================================================================
 */

export interface GeneratedMedia {
  /** The clinic's own artwork, extracted from the logo sheet it supplied. */
  brand: {
    logoLight: string | null;
    logoDark: string | null;
    markLight: string | null;
    markDark: string | null;
  } | null;
  /** Portrait of Dr. Messaouda Bouamara for the About page. */
  doctorPortrait: string | null;
  /** The radio-station photograph, cropped — used in the practitioner block. */
  doctorPortraitSecondary: string | null;
  /** Still from the television appearance, shown in the gallery. */
  appearanceStill: string | null;
  /** Before/after case sheets, in display order. */
  results: { id: string; composite: string }[];
  /**
   * Clinic interior photographs, in display order.
   *
   * `illustrative: true` marks a picture that is *not* a photograph of this
   * practice — the site labels it as such. Replace it by dropping real files
   * into `media-source/facility/`, running `npm run media:setup`, and pasting
   * the snippet the script prints (which sets `illustrative: false`).
   */
  facility: { id: string; src: string; illustrative?: boolean }[];
}

export const generatedMedia: GeneratedMedia = {
  brand: {
    logoLight: "/brand/logo-light.png",
    logoDark: "/brand/logo-dark.png",
    markLight: "/brand/mark-light.png",
    markDark: "/brand/mark-dark.png",
  },

  doctorPortrait: "/media/doctor/dr-bouamara.jpg",

  doctorPortraitSecondary: "/media/doctor/dr-bouamara-radio.jpg",

  /** Dr. Bouamara during her television interview — the gallery frame. */
  appearanceStill: "/media/appearances/nabd-el-seha.jpg",

  /**
   * The clinic's own before/after sheets. The printed promotional band (and,
   * on one sheet, the design tool's template footer) is cropped away; case-06
   * is printed after/before and is swapped so it reads before → after.
   */
  results: [
    { id: "case-01", composite: "/media/results/case-01.jpg" },
    { id: "case-02", composite: "/media/results/case-02.jpg" },
    { id: "case-03", composite: "/media/results/case-03.jpg" },
    { id: "case-04", composite: "/media/results/case-04.jpg" },
    { id: "case-05", composite: "/media/results/case-05.jpg" },
    { id: "case-06", composite: "/media/results/case-06.jpg" },
  ],

  /**
   * Room photographs are not used: those gallery categories were withdrawn at
   * the clinic's request. Kept as the target for `media-source/facility/`.
   */
  facility: [],
};
