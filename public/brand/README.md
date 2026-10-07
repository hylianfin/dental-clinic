# Brand assets

Drop the clinic's logo files in this folder. The site renders the built-in
navy/gold mark until files are supplied, and switches to the real artwork the
moment the paths below are set — no component changes are needed.

## Expected files

| File | Variant | Used on |
|---|---|---|
| `logo-light.png` | navy wordmark + gold, transparent background | header, footer, admin sign-in, admin sidebar |
| `logo-dark.png` | white wordmark + gold, transparent background | dark sections |
| `mark-light.png` | icon only, navy + gold | square/tight spaces, app icon |
| `mark-dark.png` | icon only, white + gold | square spaces on navy |

A single transparent PNG or SVG at the widest useful size (e.g. 800 px wide) is
enough; the component scales it and sets `unoptimized` so no re-encoding occurs.

## Wire them up

Open `src/content/media.ts` and set:

```ts
export const brand: BrandAssets = {
  logoLight: "/brand/logo-light.png",
  logoDark: "/brand/logo-dark.png",
  markLight: "/brand/mark-light.png",
  markDark: "/brand/mark-dark.png",
};
```

One component (`src/components/brand/Logo.tsx`) is used by the header, mobile
navigation, footer, admin sign-in screen and the admin sidebar, so the brand
updates everywhere at once.

## Favicon / app icon

`src/app/icon.svg` (favicon), `src/app/favicon.ico` (16/32/48 px) and
`src/app/apple-icon.png` (180 px) are generated from the built-in mark. To use
the clinic's own icon, replace all three files and keep the same names — Next.js
serves them automatically.

## Where the current mark comes from

`src/components/brand/mark.ts` holds the geometry (tooth + champagne-gold smile
arc on a deep-navy rounded square) and is the single source for both the React
component and the icon files. It is a designed placeholder, clearly labelled as
such in the dashboard readiness report — replace it with the real logo when the
artwork is available.

Clinic and patient photography goes in `public/media/` (see
`public/media/README.md`).
