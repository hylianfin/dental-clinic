import { generatedMedia } from "@/content/media.generated";

/**
 * ============================================================================
 *  MEDIA REGISTRY — every image path in the project lives here
 * ============================================================================
 *  Nothing in the components hard-codes an image URL. To swap a photo:
 *
 *    1. drop the file in `public/media/…` (or paste a Supabase Storage URL),
 *    2. point the matching entry below at it,
 *    3. save — every place that shows that image updates at once.
 *
 *  A `null` value renders the branded placeholder instead of a broken image,
 *  which is why the site is complete today and photographs can arrive later.
 * ============================================================================
 */

export interface BrandAssets {
  /** Full lockup for light backgrounds: navy wordmark + gold curve (PNG/SVG). */
  logoLight: string | null;
  /** Full lockup for navy backgrounds: white wordmark + gold curve. */
  logoDark: string | null;
  /** Square icon-only mark — sidebar, favicon fallback, small spaces. */
  markLight: string | null;
  markDark: string | null;
}

export interface PortraitAsset {
  src: string | null;
  alt: string;
  /** `object-position` hint so faces are not cropped awkwardly. */
  position?: string;
}

export interface FacilityPhoto {
  id: string;
  title: string;
  caption: string;
  src: string | null;
  /**
   * `true` when the picture is a stand-in rather than a photograph of this
   * practice. The UI says so; never set it to `false` for imagery the clinic
   * did not send.
   */
  illustrative: boolean;
}

export interface ResultCase {
  id: string;
  /** Neutral label — no clinical claims are made about the treatment. */
  title: string;
  caption: string;
  /** Separate files when available… */
  before: string | null;
  after: string | null;
  /** …or a single ready-made side-by-side composite. */
  composite: string | null;
  /**
   * Explicit consent record. The clinic confirmed that documented patient
   * consent exists for the cases supplied; keep this `true` only while that
   * remains true.
   */
  consentOnFile: boolean;
}

/**
 * ── Brand ───────────────────────────────────────────────────────────────────
 * The clinic's own logo sheet is cut into the four variants below by
 * `npm run media:setup` (which also writes the favicon and app icon). Set any
 * entry by hand to override it — every surface reads the artwork from here.
 */
export const brand: BrandAssets = generatedMedia.brand ?? {
  logoLight: null,
  logoDark: null,
  markLight: null,
  markDark: null,
};

export const logoSizing = {
  /** Rendered height of the full lockup, in pixels, per size token. */
  height: { sm: 34, md: 42, lg: 56 },
} as const;

/**
 * ── Dr. Bouamara ────────────────────────────────────────────────────────────
 * A portrait of the doctor is used in the About section.
 * Save the file as `public/media/doctor/dr-bouamara.jpg`, then set `src` below.
 * Crop for a 4:5 portrait, keep it untouched — do not retouch facial features.
 */
export const doctor: {
  portrait: PortraitAsset;
  /** Optional wider/treatment-room shot used beside the portrait. */
  secondary: PortraitAsset;
} = {
  portrait: {
    // Produced by `npm run media:setup` from the clinic's own photograph.
    src: generatedMedia.doctorPortrait,
    alt: "Dr. Messaouda Bouamara",
    position: "50% 18%",
  },
  secondary: {
    /**
     * The practitioner block further down the About page: the radio-station
     * photograph, cropped to Dr. Bouamara (the person on the right). Framing
     * only — nothing about her appearance is altered.
     */
    src: generatedMedia.doctorPortraitSecondary,
    alt: "Dr. Messaouda Bouamara at the Radio El Bahdia studio",
    position: "50% 20%",
  },
};

/**
 * ── Gallery photographs ─────────────────────────────────────────────────────
 * One slot. The clinic asked for the room categories to be withdrawn.
 * Suggested file: public/media/appearances/nabd-el-seha.jpg
 */
const GALLERY_SLOTS: { id: string; title: string }[] = [
  { id: "tv-interview", title: "Dr. Bouamara on Television" },
];

/**
 * The room categories — treatment room, equipment, reception, sterilisation,
 * waiting area and digital scanning — were withdrawn at the clinic's request,
 * so the gallery carries one photograph: Dr. Bouamara during her television
 * interview. It appears once the picture is supplied (see README →
 * "Adding the clinic's photographs"); until then the frame stays labelled.
 */
export const galleryPhotos: FacilityPhoto[] = GALLERY_SLOTS.map((slot) => {
  const src = generatedMedia.appearanceStill;

  return {
    ...slot,
    src,
    illustrative: false,
    caption: src
      ? "Dr. Bouamara during her television interview."
      : "Photograph pending",
  };
});

/**
 * ── Treatment results ───────────────────────────────────────────────────────
 * Before/after cases. The clinic confirmed documented patient consent for the
 * material supplied, so these may be published.
 *
 * Each case can be a pair (`before` + `after`) or one pre-made composite.
 * Suggested files: public/media/results/case-01-before.jpg, case-01-after.jpg …
 *
 * Captions stay neutral on purpose: no treatment counts, durations or outcome
 * claims are stated, because none were provided.
 */
const RESULT_CAPTIONS: Record<string, string> = {
  "case-01": "Extra-oral view with a wide smile, before and after.",
  "case-02": "Smile view, before and after.",
  "case-03": "Frontal view, before and after.",
  "case-04": "Lateral view, before and after.",
  "case-05": "Intraoral view, before and after.",
  "case-06": "Intraoral view, before and after.",
};

/**
 * Each case is the clinic's own before/after sheet (a composite), because that
 * is how the material was supplied. `before`/`after` stay available for the
 * day separate files exist.
 */
export const results: ResultCase[] = generatedMedia.results.map((item, index) => ({
  id: item.id,
  title: `Case ${String(index + 1).padStart(2, "0")}`,
  caption: RESULT_CAPTIONS[item.id] ?? "Before and after.",
  before: null,
  after: null,
  composite: item.composite,
  consentOnFile: true,
}));

/** Standard, honest disclaimer required next to clinical photography. */
export const resultsDisclaimer =
  "Published with the patient's written consent. Every case is individual and results vary from person to person.";

/**
 * ── Clinical / service imagery ──────────────────────────────────────────────
 * Professional, non-identifiable dental imagery: no faces, no identifiable
 * patients, no treatment outcomes. These are stand-ins for photography of the
 * practice — the UI does not present them as photographs of this clinic.
 *
 * Replace a file in `public/media/services/` (same name) or point `src` at a
 * real photograph and delete the `illustrative` flag.
 */
export interface ServiceImage {
  src: string;
  alt: string;
  /** `true` while the picture is a stand-in rather than this clinic's own. */
  illustrative: boolean;
  /**
   * Bump this whenever the file behind `src` is replaced. The value is appended
   * as `?v=…`, which forces browsers — and the Next image optimiser's
   * long-lived cache — to fetch the new picture instead of showing the old one.
   */
  version?: number;
}

export const serviceImages: Record<string, ServiceImage> = {
  "check-up-and-cleaning": {
    src: "/media/services/check-up-and-cleaning.jpg",
    /** Replaced twice: a nail clipper, then an incomplete arm. */
    version: 2,
    alt: "A sterile tray of dental hygiene instruments — mouth mirror, probes and scaler",
    illustrative: true,
  },
  "dental-sealants": {
    src: "/media/services/dental-sealants.jpg",
    alt: "Sealant being applied to the chewing surface of a molar model",
    illustrative: true,
  },
  "teeth-whitening": {
    src: "/media/services/teeth-whitening.jpg",
    alt: "A dental shade guide of ceramic tabs graded from cream to bright white",
    illustrative: true,
  },
  "composite-bonding": {
    src: "/media/services/composite-bonding.jpg",
    alt: "Composite resin syringes, an applicator tip and a curing light on a navy surface",
    illustrative: true,
  },
  veneers: {
    src: "/media/services/veneers.jpg",
    alt: "Thin ceramic veneers resting on a white tray",
    illustrative: true,
  },
  "dental-implants": {
    src: "/media/services/dental-implants.jpg",
    alt: "A titanium dental implant, abutment and healing cap on a ceramic holder",
    illustrative: true,
  },
  crowns: {
    src: "/media/services/crowns.jpg",
    alt: "A glazed ceramic crown and inlay on a white tray",
    illustrative: true,
  },
  bridges: {
    src: "/media/services/bridges.jpg",
    alt: "A three-unit ceramic dental bridge on a plaster model of a jaw",
    illustrative: true,
  },
  "clear-aligners": {
    src: "/media/services/clear-aligners.jpg",
    alt: "Transparent clear aligner trays fitted on a model of a jaw",
    illustrative: true,
  },
  "fixed-braces": {
    src: "/media/services/fixed-braces.jpg",
    alt: "Metal orthodontic brackets and an archwire on a model of a jaw",
    illustrative: true,
  },
  "childrens-dentistry": {
    src: "/media/services/childrens-dentistry.jpg",
    alt: "A child's toothbrush, a plain toothpaste tube, a tooth model and a glass tumbler",
    illustrative: true,
  },
  "space-maintainers": {
    src: "/media/services/space-maintainers.jpg",
    alt: "A stainless steel orthodontic space maintainer appliance on a white dish",
    illustrative: true,
  },
  "gum-treatment": {
    src: "/media/services/gum-treatment.jpg",
    alt: "Periodontal probes and curettes beside a model of a jaw on a white tray",
    illustrative: true,
  },
  "gum-grafting": {
    src: "/media/services/gum-grafting.jpg",
    alt: "Micro-surgical instruments, a suture packet and sterile gauze on a white tray",
    illustrative: true,
  },
  "root-canal-treatment": {
    src: "/media/services/root-canal-treatment.jpg",
    alt: "Endodontic files with colour-coded handles fanned out on a white tray",
    illustrative: true,
  },
  "endodontic-microsurgery": {
    src: "/media/services/endodontic-microsurgery.jpg",
    alt: "A dental operating microscope above an instrument tray in a treatment room",
    illustrative: true,
  },
  extractions: {
    src: "/media/services/extractions.jpg",
    alt: "A sterile set of extraction forceps and elevators on white surgical cloth",
    illustrative: true,
  },
  "bone-grafting": {
    src: "/media/services/bone-grafting.jpg",
    alt: "Bone graft material in a dish with a spatula beside a model of a jaw",
    illustrative: true,
  },
  "3d-imaging": {
    src: "/media/services/3d-imaging.jpg",
    alt: "A dental CBCT 3D imaging scanner in a treatment room",
    illustrative: true,
  },
  "digital-smile-planning": {
    src: "/media/services/digital-smile-planning.jpg",
    alt: "A monitor showing a 3D dental scan beside a model of a jaw",
    illustrative: true,
  },
};

/** Image for a service slug, or `null` when none is registered. */
export const getServiceImage = (slug: string): ServiceImage | null => {
  const image = serviceImages[slug];
  if (!image) return null;
  // Only replaced pictures carry a version, so untouched URLs keep caching.
  return image.version && image.version > 1
    ? { ...image, src: `${image.src}?v=${image.version}` }
    : image;
};

/** Stand-in for photography of the practice itself (home hero). */
export const clinicPhoto: ServiceImage = {
  src: "/media/clinic/practice-hero.jpg",
  alt: "A dental treatment room with navy cabinetry and a modern dental chair",
  illustrative: true,
};

/**
 * ── Media appearance ────────────────────────────────────────────────────────
 * Optional still from the television appearance.
 * Suggested file: public/media/appearances/nabd-el-seha.jpg
 */
export const appearanceThumbnail: string | null = generatedMedia.appearanceStill;

/** `true` when at least one real photograph is wired up. */
export const hasAnyMedia = (): boolean =>
  Boolean(
    brand.logoLight ||
      doctor.portrait.src ||
      galleryPhotos.some((photo) => photo.src),
  );
