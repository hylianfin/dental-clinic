import type { Config } from "tailwindcss";

/**
 * Design system — Dr. Bouamara Dental Clinic
 * ------------------------------------------
 * Identity, taken from the clinic's own logo:
 *   deep navy  +  refined dental blue  +  white / warm white  +  champagne gold.
 *
 * There is deliberately NO green in this palette.
 *
 * Token rules that keep the palette accessible (verified with WCAG contrast
 * maths against both #FFFFFF and the warm white #FAFAF8):
 *  - `ink.*`   deep navy. `ink-900` is the primary text/background navy
 *              (15.8:1 on white); `ink-400` is the lightest tone still safe for
 *              small text (5.0:1).
 *  - `brand.*` dental blue. `brand-700` is the link/accent blue (7.6:1).
 *  - `gold.DEFAULT` (#C2A06B) is DECORATIVE ONLY (borders, rules, icons, and
 *              text on navy where it reaches 6.4:1). On white it is only 2.4:1.
 *  - `gold.ink` (#8A6D3A) is the accessible gold for TEXT on light backgrounds
 *              (4.85:1).
 */
export default {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        /**
         * Deep navy — dark sections, footer, admin sidebar, primary text.
         * The low end of the scale doubles as "text on navy" tones.
         */
        ink: {
          DEFAULT: "#0B2342",
          50: "#F2F7FB",
          100: "#E1EBF3",
          200: "#C6D8E8",
          300: "#9CBAD3",
          400: "#4A7396",
          500: "#3D6C99",
          600: "#2A5580",
          700: "#1A3E68",
          800: "#123054",
          900: "#0B2342",
          950: "#06152B",
        },
        /** Refined dental blue — links, primary actions, accents. */
        brand: {
          DEFAULT: "#1A5788",
          50: "#EFF7FD",
          100: "#DCEDFB",
          200: "#B9DAF5",
          300: "#8CC1EC",
          400: "#57A2DE",
          500: "#2E86C8",
          600: "#1F6CA8",
          700: "#1A5788",
          800: "#17466C",
          900: "#143A57",
          950: "#0B2338",
        },
        /** Champagne gold — accents only (matches the logo's gold curve). */
        gold: {
          DEFAULT: "#C2A06B",
          soft: "#D8BC8B",
          light: "#EBDCC0",
          ink: "#8A6D3A",
          deep: "#6F5527",
        },
        /** Warm white canvas. */
        cream: {
          DEFAULT: "#FAFAF8",
          50: "#FDFDFC",
          100: "#FAFAF8",
          200: "#F4F4F1",
          300: "#E8E8E3",
        },
      },
      fontFamily: {
        display: ["Cormorant Garamond", "Georgia", "serif"],
        heading: ["Cormorant Garamond", "Georgia", "serif"],
        sans: ["Montserrat", "system-ui", "sans-serif"],
        body: ["Montserrat", "system-ui", "sans-serif"],
        ui: ["Montserrat", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-sm": ["2.25rem", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
        "display-md": ["3rem", { lineHeight: "1.1", letterSpacing: "-0.015em" }],
        "display-lg": ["3.75rem", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-xl": ["4.5rem", { lineHeight: "1.02", letterSpacing: "-0.02em" }],
      },
      letterSpacing: {
        eyebrow: "0.18em",
      },
      /**
       * Tailwind v3 only ships multiples of 5 in its opacity scale, which makes
       * values like `border-ink-900/8` fail to compile. Filling in 0–100 keeps
       * the design tokens expressive without arbitrary-value brackets.
       */
      opacity: Object.fromEntries(
        Array.from({ length: 101 }, (_, index) => [String(index), String(index / 100)]),
      ),
      spacing: {
        section: "5rem",
        "section-lg": "7rem",
      },
      maxWidth: {
        prose: "68ch",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(10, 42, 46, 0.04), 0 8px 24px -12px rgba(10, 42, 46, 0.12)",
        card: "0 2px 4px rgba(10, 42, 46, 0.03), 0 18px 40px -24px rgba(10, 42, 46, 0.22)",
        lift: "0 8px 16px -8px rgba(10, 42, 46, 0.16), 0 32px 64px -32px rgba(10, 42, 46, 0.28)",
        ring: "0 0 0 1px rgba(194, 160, 107, 0.45)",
      },
      borderRadius: {
        card: "1rem",
        pill: "999px",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.97)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-up": "fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        "scale-in": "scaleIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        shimmer: "shimmer 2.4s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
