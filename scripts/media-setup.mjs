#!/usr/bin/env node
/**
 * ============================================================================
 *  MEDIA SETUP — turns the clinic's raw files into web-ready site imagery
 * ============================================================================
 *  Run:  npm run media:setup
 *
 *  Put the clinic's original files in `media-source/` (gitignored) using the
 *  names listed in INPUT below, then run the script. It writes optimised,
 *  correctly-cropped files into `public/media/…` and reports what it produced.
 *  `src/content/media.ts` already points at those output paths, so the site
 *  picks the photographs up with no further editing.
 *
 *  The script is idempotent: running it again just re-derives the outputs.
 *  It never invents imagery — if an input is missing, its output is skipped and
 *  the site keeps showing the labelled placeholder instead.
 *
 *  Crops are defined as fractions of the source (x, y, width, height) so they
 *  are resolution-independent. Adjust `CROP` if a framing needs nudging.
 * ============================================================================
 */

import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join, extname, basename } from "node:path";

import sharp from "sharp";

const ROOT = process.cwd();
const SOURCE_DIR = join(ROOT, "media-source");
const OUT_DIR = join(ROOT, "public", "media");

/* ------------------------------------------------------------------ config -- */

/** Where to look for each source file (first match wins). */
const INPUT = {
  /** The logo sheet: lockups, the mark, and the navy app icon. */
  brand: ["brand/logo-sheet.*", "brand/logo.*", "logo.*"],
  /**
   * Portrait of Dr. Messaouda Bouamara for the About page. A file named
   * `portrait.*` (a purpose-shot portrait) wins over the radio-studio group
   * photograph, which is cropped to the person on the right.
   */
  radio: [
    "doctor/portrait.*",
    "doctor/radio-station.*",
    "radio-station.*",
    "doctor.*",
  ],
  /** The radio-station group photograph, cropped to Dr. Bouamara. */
  radioStation: ["doctor/radio-station.*", "radio-station.*"],
  /** A still from the television appearance. */
  tv: ["appearances/nabd-el-seha.*", "tv.*", "appearance.*"],
  /** Before/after case sheets, in the order they should appear on the site. */
  results: [
    "results/case-01.*",
    "results/case-02.*",
    "results/case-03.*",
    "results/case-04.*",
    "results/case-05.*",
    "results/case-06.*",
  ],
  /** Clinic interior photographs (optional). */
  facility: ["facility/*.*"],
};

/**
 * Crop boxes as { left, top, width, height } fractions of the source.
 *
 * `radioDoctor` targets the right-hand person in the radio-station photograph —
 * the clinic confirmed that Dr. Messaouda Bouamara is the person on the right
 * (cream striped jacket, white headscarf). It is a framing crop only: nothing
 * about her appearance is altered or generated.
 *
 * Case sheets are NOT given a fixed crop: the clinic's posts carry a printed
 * promotional band of varying depth, so `trimPromoBand()` finds it by colour.
 * Add an entry below only to override that decision.
 */
const CROP = {
  radioDoctor: { left: 0.485, top: 0.02, width: 0.5, height: 0.72 },
  /**
   * Purpose-shot portrait (`doctor/portrait.*`): centred, full height. Adjust
   * after looking at the first run — the script prints the output path.
   */
  portrait: { left: 0.22, top: 0, width: 0.56, height: 1 },
  /**
   * Per-case overrides. Anything not listed here is trimmed automatically by
   * `trimPromoBand()`.
   */
  results: {
    /**
     * The sheet's band fades to a very dark green at its top, so the colour
     * test cannot see it, and the gold divider line sits directly above the
     * contact details. Cutting just below the divider removes all of it.
     */
    "case-03": { left: 0, top: 0, width: 1, height: 0.91 },
    /**
     * This sheet carries the design tool's TEMPLATE footer — a placeholder
     * French phone number (+33 6 40 40 40 40) and "Rue de la Clinique" — not
     * the clinic's band. Nothing invented may reach the site, so the footer is
     * cut off with the rest.
     */
    "case-05": { left: 0, top: 0, width: 1, height: 0.94 },
  },
};

/**
 * Per-case corrections, by output id.
 *
 * `case-06` is printed "AFTER | BEFORE": the two halves are swapped so the
 * sheet reads before → after like the others. Swapping keeps each half — and
 * the signature printed inside it — the right way round; mirroring the whole
 * sheet would reverse that lettering.
 */
const TRANSFORM = {
  "case-06": { swapHalves: true },
};

/** Swaps the left and right halves of a side-by-side sheet. */
async function swapHalves(source) {
  const meta = await sharp(source).metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  const half = Math.floor(width / 2);
  if (half === 0) return source;

  const left = await sharp(source).extract({ left: 0, top: 0, width: half, height }).png().toBuffer();
  const right = await sharp(source)
    .extract({ left: half, top: 0, width: width - half, height })
    .png()
    .toBuffer();

  return sharp({ create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([
      { input: right, left: 0, top: 0 },
      { input: left, left: width - half, top: 0 },
    ])
    .png()
    .toBuffer();
}

/**
 * The clinic's promotional band is a saturated green strip carrying the phone
 * numbers and signature. It is detected by colour rather than by a fixed
 * percentage, because the sheets are cropped differently.
 *
 * Only the bottom of the image is examined, and the band must start at the very
 * last row, so a green background inside a photograph is never mistaken for it.
 */
const BAND = {
  /** A row counts as band pixels when green leads red and blue by this much. */
  dominance: 6,
  /** Minimum share of a row that must be green for the row to count. */
  rowThreshold: 0.55,
  /** A band deeper than this share of the image is treated as content, not a band. */
  maxDepth: 0.3,
  /** Rows examined from the bottom. */
  searchDepth: 0.45,
};

/** Returns the height to keep, or the original height when no band is found. */
async function trimPromoBand(file) {
  const meta = await sharp(file).metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  if (width === 0 || height === 0) return height;

  // Work on a small copy: enough to read colours, fast on multi-megabyte files.
  const sampleWidth = 240;
  const { data, info } = await sharp(file)
    .resize({ width: sampleWidth })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const channels = info.channels;
  const rows = info.height;

  const rowIsBand = (row) => {
    let green = 0;
    for (let column = 0; column < sampleWidth; column += 1) {
      const offset = (row * sampleWidth + column) * channels;
      const r = data[offset] ?? 0;
      const g = data[offset + 1] ?? 0;
      const b = data[offset + 2] ?? 0;
      if (g > r + BAND.dominance && g > b + BAND.dominance) green += 1;
    }
    return green / sampleWidth >= BAND.rowThreshold;
  };

  const searchFrom = Math.floor(rows * (1 - BAND.searchDepth));

  // The band must reach the final row.
  if (!rowIsBand(rows - 1)) return height;

  let firstBandRow = rows - 1;
  for (let row = rows - 2; row >= searchFrom; row -= 1) {
    if (rowIsBand(row)) {
      firstBandRow = row;
      continue;
    }
    // Tolerate a couple of light rows (text, gold rules) inside the band.
    let gap = true;
    for (let probe = 1; probe <= 3 && row - probe >= searchFrom; probe += 1) {
      if (rowIsBand(row - probe)) {
        gap = false;
        break;
      }
    }
    if (gap) break;
  }

  const bandSampleRows = rows - firstBandRow;
  const bandShare = bandSampleRows / rows;

  if (bandShare > BAND.maxDepth || bandShare < 0.01) return height;

  const keep = Math.round(height * (1 - bandShare));
  return Math.max(1, keep - Math.round(height * 0.004)); // small safety margin
}

const DOCTOR_PORTRAIT = { width: 1200, height: 1500 }; // 4:5
const RESULT_MAX = { width: 1600 };
const TV_MAX = { width: 1920 };

/* ------------------------------------------------------------------ helpers -- */

function filesMatching(pattern) {
  const [dir, name] = pattern.includes("/") ? pattern.split("/") : ["", pattern];
  const target = dir ? join(SOURCE_DIR, dir) : SOURCE_DIR;
  if (!existsSync(target)) return [];

  const prefix = name.replace(/\.\*$/, "");
  const wildcard = name.endsWith(".*");
  const entries = readdirSync(target);

  const matches = entries
    .filter((entry) => statSync(join(target, entry)).isFile())
    .filter((entry) => {
      if (wildcard) return basename(entry, extname(entry)).startsWith(prefix.replace(/\.$/, ""));
      return entry === name;
    })
    .map((entry) => join(target, entry));

  return matches;
}

function firstMatch(patterns) {
  for (const pattern of patterns) {
    const matches = filesMatching(pattern);
    if (matches.length > 0) return matches[0];
  }
  return null;
}

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

/** Converts a fractional crop box to sharp's integer region options. */
async function cropRegion(file, box) {
  const meta = await sharp(file).metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;

  return {
    left: Math.max(0, Math.round(box.left * width)),
    top: Math.max(0, Math.round(box.top * height)),
    width: Math.min(width, Math.round(box.width * width)),
    height: Math.min(height, Math.round(box.height * height)),
  };
}

const results = [];

/** Ready-to-paste entries for src/content/media.generated.ts. */
const manifest = {
  results: [],
  facility: [],
  unassigned: [],
  brand: null,
  doctorSecondary: null,
};

/**
 * Gallery slot for each suggested facility file name. Files whose name is not
 * listed here are still processed and reported, but the script cannot guess
 * which card they belong to.
 */
const FACILITY_SLOTS = {
  reception: "gal-reception",
  "treatment-room": "gal-room-1",
  sterilisation: "gal-sterilisation",
  equipment: "gal-equipment",
  "waiting-area": "gal-waiting",
  scanning: "gal-scan",
};

function report(label, path, note = "") {
  results.push({ label, path, note });
}

/* ------------------------------------------------------------------- tasks -- */

async function buildDoctorPortrait() {
  const source = firstMatch(INPUT.radio);
  if (!source) return;

  const out = join(OUT_DIR, "doctor", "dr-bouamara.jpg");
  ensureDir(join(OUT_DIR, "doctor"));

  /**
   * The group photograph needs the box that isolates the person on the right;
   * a purpose-shot portrait is already framed, so only a gentle centre crop is
   * applied to reach 4:5.
   */
  const isGroupPhoto = /radio-station/i.test(basename(source));
  const box = isGroupPhoto ? CROP.radioDoctor : CROP.portrait;

  const region = await cropRegion(source, box);

  await sharp(source)
    .extract(region)
    .resize(DOCTOR_PORTRAIT.width, DOCTOR_PORTRAIT.height, {
      fit: "cover",
      position: "top",
    })
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(out);

  report("Doctor portrait", out, `cropped from ${basename(source)} (framing only)`);
}

/**
 * The practitioner block further down the About page uses the radio-station
 * photograph (the clinic confirmed Dr. Bouamara is the person on the right).
 * It is a separate output so the main portrait can come from a different file.
 */
async function buildDoctorSecondary() {
  const source = firstMatch(INPUT.radioStation);
  if (!source) return;

  const out = join(OUT_DIR, "doctor", "dr-bouamara-radio.jpg");
  ensureDir(join(OUT_DIR, "doctor"));

  await sharp(source)
    .extract(await cropRegion(source, CROP.radioDoctor))
    .resize(DOCTOR_PORTRAIT.width, DOCTOR_PORTRAIT.height, {
      fit: "cover",
      position: "top",
    })
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(out);

  report("Practitioner block", out, `cropped from ${basename(source)} (framing only)`);
  manifest.doctorSecondary = "/media/doctor/dr-bouamara-radio.jpg";
}

async function buildAppearanceStill() {
  const source = firstMatch(INPUT.tv);
  if (!source) return;

  const out = join(OUT_DIR, "appearances", "nabd-el-seha.jpg");
  ensureDir(join(OUT_DIR, "appearances"));

  await sharp(source)
    .resize({ width: TV_MAX.width, withoutEnlargement: true })
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(out);

  report("TV appearance still", out);
}

async function buildResults() {
  ensureDir(join(OUT_DIR, "results"));

  let index = 0;
  for (const pattern of INPUT.results) {
    const source = firstMatch([pattern]);
    if (!source) continue;

    index += 1;
    const id = String(index).padStart(2, "0");
    const out = join(OUT_DIR, "results", `case-${id}.jpg`);

    const transform = TRANSFORM[`case-${id}`] ?? {};

    // Work from a buffer when a correction has to be applied first.
    const input = transform.swapHalves ? await swapHalves(source) : source;

    const override = CROP.results[`case-${id}`];
    const keep = override ? null : await trimPromoBand(input);
    const meta = await sharp(input).metadata();

    let pipeline = sharp(input);

    if (override) {
      pipeline = pipeline.extract(await cropRegion(input, override));
    } else if (keep !== null && keep < (meta.height ?? 0)) {
      pipeline = pipeline.extract({
        left: 0,
        top: 0,
        width: meta.width ?? 0,
        height: keep,
      });
    }

    await pipeline
      .resize({ width: RESULT_MAX.width, withoutEnlargement: true })
      .jpeg({ quality: 88, mozjpeg: true })
      .toFile(out);

    const trimmed = !override && keep !== null && keep < (meta.height ?? 0);
    const notes = [];
    if (transform.swapHalves) notes.push("halves swapped to read before \u2192 after");
    if (override) {
      notes.push("explicit crop applied");
    } else {
      notes.push(trimmed ? "promotional band trimmed" : "no promotional band found");
    }

    report(`Results case ${id}`, out, notes.join("; "));
    manifest.results.push({ id: `case-${id}`, src: `/media/results/case-${id}.jpg` });
  }

  if (index === 0) return;
}

async function buildFacility() {
  const dir = join(SOURCE_DIR, "facility");
  if (!existsSync(dir)) return;

  const files = readdirSync(dir).filter((entry) =>
    statSync(join(dir, entry)).isFile(),
  );
  if (files.length === 0) return;

  ensureDir(join(OUT_DIR, "facility"));

  for (const file of files) {
    const name = basename(file, extname(file));
    const out = join(OUT_DIR, "facility", `${name}.jpg`);
    await sharp(join(dir, file))
      .resize({ width: 1600, withoutEnlargement: true })
      .jpeg({ quality: 86, mozjpeg: true })
      .toFile(out);

    const slot = FACILITY_SLOTS[name];
    report("Facility photo", out, slot ? `gallery slot ${slot}` : "no matching gallery slot");

    if (slot) {
      manifest.facility.push({
        id: slot,
        src: `/media/facility/${name}.jpg`,
        illustrative: false,
      });
    } else {
      manifest.unassigned.push(`/media/facility/${name}.jpg`);
    }
  }
}

/** Prints the entries to paste into src/content/media.generated.ts. */
function printManifestSnippet() {
  const blocks = [];

  if (manifest.brand) {
    blocks.push(
      "  brand: {\n" +
        Object.entries(manifest.brand)
          .map(([key, value]) => `    ${key}: "${value}",`)
          .join("\n") +
        "\n  },",
    );
  }

  if (manifest.doctorSecondary) {
    blocks.push(
      `  doctorPortraitSecondary: "${manifest.doctorSecondary}",`,
    );
  }

  if (manifest.results.length > 0) {
    blocks.push(
      "  results: [\n" +
        manifest.results
          .map((item) => `    { id: "${item.id}", composite: "${item.src}" },`)
          .join("\n") +
        "\n  ],",
    );
  }

  if (manifest.facility.length > 0) {
    blocks.push(
      "  facility: [\n" +
        manifest.facility
          .map(
            (item) =>
              `    { id: "${item.id}", src: "${item.src}", illustrative: false },`,
          )
          .join("\n") +
        "\n  ],",
    );
  }

  if (blocks.length === 0) return;

  console.log(
    "\nPaste into src/content/media.generated.ts (replacing the same keys):\n",
  );
  console.log(blocks.join("\n\n"));

  if (manifest.unassigned.length > 0) {
    console.log(
      "\nThese files have no matching gallery slot — add a slot in " +
        "src/content/media.ts or rename the file:\n" +
        manifest.unassigned.map((path) => `  ${path}`).join("\n"),
    );
  }
}

/* ------------------------------------------------------------- logo sheet -- */

/**
 * Crop boxes (fractions of the logo sheet) for the artwork the clinic sent.
 * The sheet is a single image holding several lockups; each box below was
 * measured against it. `whitenToAlpha` turns the sheet's white paper into
 * transparency, and `toWarmWhite` re-colours the navy ink for dark surfaces —
 * the shape and lettering are never redrawn.
 */
const BRAND_CROPS = {
  /** Horizontal lockup: mark + "DR. BOUAMARA / DENTAL CLINIC" on white. */
  lockup: { left: 0.0497, top: 0.1563, width: 0.625, height: 0.3125 },
  /** Square tile: the white mark on a navy panel — used for the app icon. */
  tile: { left: 0.5767, top: 0.6406, width: 0.1392, height: 0.2422 },
  /** The mark on its own, navy ink on white. */
  mark: { left: 0.7557, top: 0.6354, width: 0.1918, height: 0.2552 },
};

const BRAND_DIR = join(ROOT, "public", "brand");
const APP_DIR = join(ROOT, "src", "app");

/** Turns the sheet's paper white into transparency; ink keeps its colour. */
async function whitenToAlpha(source, box) {
  const region = await cropRegion(source, box);
  const { data, info } = await sharp(source)
    .extract(region)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const out = Buffer.alloc(info.width * info.height * 4);
  const channels = info.channels;

  for (let i = 0; i < info.width * info.height; i += 1) {
    const p = i * channels;
    const r = data[p] ?? 255;
    const g = data[p + 1] ?? 255;
    const b = data[p + 2] ?? 255;
    const luminance = (r + g + b) / 3;

    // Paper → transparent, ink → opaque, anti-aliased edge → partial alpha.
    const alpha =
      luminance >= 246 ? 0 : luminance <= 232 ? 255 : Math.round((255 * (246 - luminance)) / 14);

    const o = i * 4;
    out[o] = r;
    out[o + 1] = g;
    out[o + 2] = b;
    out[o + 3] = alpha;
  }

  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } });
}

/** Re-colours the navy ink to warm white, leaving the gold accent alone. */
async function toWarmWhite(pipeline) {
  const { data, info } = await pipeline.png().toBuffer().then((buffer) =>
    sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
  );

  const out = Buffer.from(data);
  for (let i = 0; i < info.width * info.height; i += 1) {
    const o = i * 4;
    if (out[o + 3] === 0) continue;
    // Blue-leading pixels are the navy ink (the gold accent is red-leading).
    if ((out[o + 2] ?? 0) >= (out[o] ?? 0)) {
      out[o] = 250;
      out[o + 1] = 249;
      out[o + 2] = 246;
    }
  }

  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } });
}

/** The app icon: the clinic's mark in white, centred on its own navy panel. */
async function buildAppIcons(markPipeline, size) {
  const markWidth = Math.round(size * 0.58);
  const mark = await markPipeline
    .resize({ width: markWidth, fit: "inside" })
    .png()
    .toBuffer({ resolveWithObject: true });

  const tile = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" rx="${Math.round(size * 0.22)}" fill="#0B2342"/>
    <rect x="1" y="1" width="${size - 2}" height="${size - 2}" rx="${Math.round(size * 0.22) - 1}"
          fill="none" stroke="#C2A06B" stroke-opacity="0.35" stroke-width="2"/>
  </svg>`;

  return sharp(Buffer.from(tile))
    .composite([
      {
        input: mark.data,
        left: Math.round((size - mark.info.width) / 2),
        top: Math.round((size - mark.info.height) / 2),
      },
    ])
    .png()
    .toBuffer();
}

async function buildBrand() {
  const source = firstMatch(INPUT.brand);
  if (!source) return;

  ensureDir(BRAND_DIR);

  const lockup = await whitenToAlpha(source, BRAND_CROPS.lockup);
  const mark = await whitenToAlpha(source, BRAND_CROPS.mark);

  await lockup.clone().png().toFile(join(BRAND_DIR, "logo-light.png"));
  const lockupDark = await toWarmWhite(lockup.clone());
  await lockupDark.clone().png().toFile(join(BRAND_DIR, "logo-dark.png"));
  await mark.clone().png().toFile(join(BRAND_DIR, "mark-light.png"));
  const markDark = await toWarmWhite(mark.clone());
  await markDark.clone().png().toFile(join(BRAND_DIR, "mark-dark.png"));

  // Favicon + home-screen icon straight from the same artwork.
  await sharp(await buildAppIcons(markDark.clone(), 512)).toFile(join(APP_DIR, "icon.png"));
  await sharp(await buildAppIcons(markDark.clone(), 180)).toFile(join(APP_DIR, "apple-icon.png"));

  for (const file of ["logo-light.png", "logo-dark.png", "mark-light.png", "mark-dark.png"]) {
    report("Brand artwork", join(BRAND_DIR, file));
  }
  for (const file of ["icon.png", "apple-icon.png"]) {
    report("App icon", join(APP_DIR, file));
  }

  manifest.brand = {
    logoLight: "/brand/logo-light.png",
    logoDark: "/brand/logo-dark.png",
    markLight: "/brand/mark-light.png",
    markDark: "/brand/mark-dark.png",
  };
}

/* -------------------------------------------------------------------- main -- */

async function main() {
  if (!existsSync(SOURCE_DIR)) {
    console.log(
      `\nNo ${basename(SOURCE_DIR)}/ folder found.\n\n` +
        "Create it and add the clinic's original files, for example:\n" +
        "  media-source/doctor/radio-station.jpg\n" +
        "  media-source/appearances/nabd-el-seha.jpg\n" +
        "  media-source/results/case-01.jpg … case-04.jpg\n" +
        "  media-source/facility/reception.jpg\n\n" +
        "Then run `npm run media:setup` again.\n",
    );
    return;
  }

  await buildBrand();
  await buildDoctorPortrait();
  await buildDoctorSecondary();
  await buildAppearanceStill();
  await buildResults();
  await buildFacility();

  if (results.length === 0) {
    console.log("\nNo usable source files were found in media-source/.\n");
    return;
  }

  console.log("\nGenerated:\n");
  for (const item of results) {
    console.log(`  ✓ ${item.label.padEnd(20)} ${item.path.replace(ROOT + "/", "")}${item.note ? `  (${item.note})` : ""}`);
  }

  printManifestSnippet();

  console.log("\nThen run `npm run check` and `npm run build`.\n");
}

main().catch((error) => {
  console.error("\nmedia:setup failed:", error.message, "\n");
  process.exitCode = 1;
});
