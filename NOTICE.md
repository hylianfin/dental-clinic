# Notices and attribution

## Upstream template

This project is derived from the **WhitePearl** dental clinic template:

- Source: https://github.com/Ruhanpaco/whitepearl-dental
- Copyright (c) 2025 R.paco
- Licensed under the MIT License (see [`LICENSE`](./LICENSE))

The MIT License permits commercial use, modification and redistribution. It
requires that the copyright notice and permission notice be retained — this file
and the `LICENSE` file satisfy that requirement. **Do not delete them.**

What was kept from the template: the App Router page skeleton, the Tailwind
setup, `next/image` usage and some layout patterns.

What is new in this repository: the visual identity and design system, all
content and copy, the booking engine, the Supabase schema and RLS policies, the
authentication layer, the admin dashboard, and the documentation.

## Removed third-party assets

The upstream template bundled 22 photographs. Metadata inspection showed they
were not original work and were not covered by the template's MIT licence:

| File(s) | Evidence |
|---|---|
| `periodontal.jpg` | `Copyright (c) 2022 Alex Mit/Shutterstock. No use without permission.` |
| `sealants.jpg` | `photoshop:Credit="Alex Mit - stock.adobe.com"` |
| `whitening.jpg` | `dc:rights: "Kurhan - stock.adobe.com"` |
| `hero-bg.jpg` | `dc:creator`/`dc:rights: "3inSpirit"` (Adobe Camera Raw lineage) |
| `bridges.jpg`, `smile-design.jpg`, `wisdom.jpg` | Canva-exported documents |
| others | Photoshop/Adobe Stock provenance |

These files were **deleted** from this repository. An MIT licence on a template
cannot grant rights to third-party stock photography, and one file carried an
explicit prohibition on use.

If imagery is reintroduced, it must be owned or licensed by the clinic, with
receipts retained. See [`public/media/README.md`](./public/media/README.md).

## Content disclaimer

All clinic-facing content currently in this repository is placeholder material.
It contains no invented practitioners, qualifications, accreditations, awards,
statistics or patient reviews, and makes no medical or outcome claims. Replace
it with clinic-approved wording before launch.
