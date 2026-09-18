# SV Developers

Multi-page marketing site for a residential land developer. Next.js 15 (App Router), React 19, TypeScript in strict mode, CSS Modules. No UI framework, no CSS framework, no state library.

```bash
npm install
npm run dev        # http://localhost:3000  (Turbopack)
npm run build      # production build
npm start          # serve the production build
npm run typecheck  # tsc --noEmit
```

**Building while a dev server is running.** Both write to `.next`, and the collision surfaces as a misleading `ENOENT: … pages-manifest.json` during "Collecting page data" — the compile itself succeeded. Point the build at its own directory instead:

```bash
NEXT_DIST_DIR=.next-verify npm run build     # bash
$env:NEXT_DIST_DIR='.next-verify'; npm run build   # PowerShell
```

---

## Routes

Every route is statically prerendered at build time — 18 pages including the five project details.

| Route | Purpose |
|---|---|
| `/` | Summary, with a link to the page behind each section |
| `/about` | Company, approach, values, approvals |
| `/projects` | The project catalogue |
| `/projects/[slug]` | One page per project, generated from `content/projects.ts` |
| `/blog` | Articles index |
| `/amenities` | The seven infrastructure specifications |
| `/master-plan` | Approved drawing with zoomable lightbox + plot sizes |
| `/location` | Proximity list, directions, corridor growth |
| `/contact` | Enquiry form, contact details, FAQ |
| `not-found` | 404 that routes people to the projects |
| `/robots.txt`, `/sitemap.xml` | Generated from the content layer |

Adding a project to `src/content/projects.ts` creates its detail route, its dropdown entry and its sitemap record automatically.

---

## Folder structure

```
src/
  app/                    one folder per route; page.tsx + optional page.module.css
    layout.tsx            fonts, metadata, header/footer/FAB shell
    robots.ts sitemap.ts  generated from the content layer
  components/
    layout/               Header, Footer, Logo, PageHero, SkipLink, ContactFab, SocialLinks
    sections/             page-level blocks: HomeHero, MediaFeature, ProjectGrid,
                          Testimonials, ContactForm, FaqList, CtaBanner
    ui/                   primitives: Section, Button, Icon, SectionHeading, FeatureGrid,
                          IconList, ProximityList, StatRow, RatingStars, Lightbox,
                          Breadcrumbs, Reveal
  content/                site.ts (brand/nav) · pages.ts (page copy) · projects.ts (records)
  hooks/                  useMediaQuery, useScrolled
  lib/                    cx, href, seo, stagger
  styles/                 tokens.css · base.css · utilities.css · globals.css · fonts/
  types/                  shared content types
```

Every component owns its `.module.css` next to it. Three layers only — `ui` knows nothing about the site, `sections` compose `ui`, `app` composes `sections`.

**Two files cover most edits:** `styles/tokens.css` for how it looks, `content/*.ts` for what it says. Nothing else hard-codes a colour or a string.

---

## Performance

The original setup was slow for a specific, measurable reason, and the fix is worth keeping in mind before adding anything back.

| | Before | After |
|---|---|---|
| `next dev` ready | 10.4s | **1.5s** |
| First page compile (cold) | 22.5s | **2.2s** |
| Subsequent route compile | — | ~250ms |
| Warm production build | ~56s compile | **2.5s compile / ~16s total** |
| First Load JS | 109 kB | 102–114 kB |

Two causes, both removed:

1. **`next/font/google` fetched fonts over the network at compile time.** The dev log showed `Request timed out after 3000ms / Retrying 1/3…` twice on every cold compile. Fonts are now **self-hosted** from `src/styles/fonts` via `next/font/local`, so the build never touches the network and works offline.
2. **Webpack dev.** `npm run dev` now runs Turbopack.

Dependencies are deliberately minimal: `next`, `react`, `react-dom`, plus TypeScript and types. 7 direct, 24 total. If something wants to add a UI library, weigh it against these numbers first.

---

## Typography

Self-hosted variable fonts, latin subset, weights 400–700 from a single file each:

- **Fraunces** — display serif, 66 KB
- **Plus Jakarta Sans** — body and UI, 27 KB

93 KB total, `font-display: swap`, with `adjustFontFallback` set so the fallback metrics match and the swap does not shift layout. To change the pairing, drop new `.woff2` files into `src/styles/fonts` and update the two `localFont()` calls in `app/layout.tsx` — nothing else references a font name.

The type scale is fluid (`clamp()`) and every step **tops out at a 1440px viewport**. That cap is deliberate: display type that keeps growing on a 1920 or 2560 monitor reads as shouting, and an oversized `h1` pushes the hero's lead and CTA below the fold.

---

## Colour and contrast

The previous palette failed **7 WCAG AA pairs**, including the most important one on the site: the primary CTA was white on gold at **3.12:1**, against a 4.5:1 requirement. Every section eyebrow failed too, at 2.55–3.12:1.

The palette was rebuilt and validated by computation before being written into `tokens.css`. All 28 pairs pass:

- Body text ≥ 4.5:1 on every surface it appears on
- Button labels ≥ 5.17:1 — primary is white on the deep brand tone (13.89:1); gold is a **fill and decoration colour only**
- `--color-accent-ink` (#7C5F1F) is the only gold allowed to carry text on a light surface — 5.98:1 on white
- Input borders 3.52:1 and focus rings ≥ 3:1, meeting the non-text requirement of WCAG 1.4.11

If you change a colour, re-check the pair. Gold text on a light background is the trap this palette was built to avoid.

---

## The logo

The supplied file is a circular gold-and-green emblem on an **opaque white JPEG**. Two consequences drove the treatment in `components/layout/Logo.tsx`:

- Dropped onto the dark header it would render as a white rectangle, so it is clipped to a **white circular badge** — which reads as a deliberate design element rather than a stray box.
- At 40px the word "DEVELOPERS" inside the emblem is unreadable, so the badge is paired with a **text wordmark** that carries the legibility.

**Worth doing:** supply the logo as an **SVG or a transparent PNG**. That would allow the mark to sit directly on the dark bar without the white disc, and would cut it from 146 KB to a few KB. The source file is kept at `public/images/logo/` alongside the working copy.

---

## Accessibility

Verified in-browser against the production build — **11 routes × 12 viewport widths (320 → 2560px), 132 combinations**:

- **No horizontal overflow** at any route or width, including 320px with the 11-item proximity list
- **Exactly one `h1`** per route
- **Target sizes**: every standalone control clears 32px (WCAG 2.5.8 AA requires 24×24); primary navigation, buttons and form controls are held to 44px
- **Keyboard**: skip link first, a 2px focus ring on every stop, `:focus-visible` matching throughout
- **Mobile panel**: focus cycles inside it, Escape closes it, focus returns to the trigger, `aria-expanded` flips, body scroll lock releases
- **Dropdown** opens on click rather than hover, so it works on touch; Escape closes it
- **Active route** marked with `aria-current="page"` and a visible underline
- Native `<details>` for the FAQ and the footer accordions — keyboard-operable before JavaScript loads
- `prefers-reduced-motion` honoured globally; a `<noscript>` rule keeps every revealed section visible without JS

Not yet done: an automated axe/Lighthouse pass, real-device touch testing, and Safari/iOS.

---

## Conventions worth knowing

- **`auto-fill`, not `auto-fit`, in card grids.** `auto-fit` collapses empty tracks, so a section holding one project stretches that card across the container and blows its image up to banner size. This was a real bug on `/projects`.
- **`stagger()` lives in `lib/`, not in `Reveal.tsx`.** `Reveal.tsx` is a `'use client'` module, and a plain function exported from one cannot be *called* by a server component. The build fails loudly if this is broken again.
- **Bracketed placeholders are inert.** Anything written as `[LIKE_THIS]` in `content/` renders through `lib/href.ts` as a non-focusable, struck-through link, so an unresolved destination can never ship looking like a working one.
- **Semantic level and visual size are independent.** Heading sizes come from component classes, not from the tag, so an `h2` can look small without anyone reaching for an `h4`.
- **Fluid spacing over breakpoints.** Section padding and gaps are `clamp()`-based; there are four breakpoints in the whole codebase, not the six a page builder would hand you.

---

## Before you go live

Ordered by how badly it hurts to miss.

1. **Decide the company name.** `content/site.ts` says "SV Developers" and the only real brand asset in the repo is `sv-developers-mark.jpg`, but the brief and the live site say "SRR Developers Pvt. Ltd." These have deliberately not been reconciled by guesswork. Every heading and SEO title renders from `site.name`, so it is a one-line fix once decided. The full list of open content questions is at the top of `content/projects.ts`.
2. **Replace every `[BRACKETED]` value in `src/content/`.** Anything in square brackets is a factual claim with legal or regulatory weight — approval numbers, RERA registration, plot dimensions, addresses, phone numbers, URLs.
3. **Replace the testimonials or delete the section.** The three quotes in `content/pages.ts` are written placeholders with bracketed attributions. Publishing invented reviews under real-sounding names is a fabricated record.
4. **Measure the drive times.** The 11 proximity figures are illustrative. Proximity is the primary persuasion device on a land page and the claim most likely to be challenged.
5. **Wire up the form.** It validates, then states plainly that it is not connected — it does *not* fake a success message. Point it at a real handler in `components/sections/ContactForm.tsx`.
6. **Replace the placeholder art** in `public/images/` with real photography and the real approved plan. Serve AVIF/WebP, target ≤200 KB per full-bleed image, and add the portrait hero crop that the `<picture>` in `HomeHero.tsx` already expects. Once no SVGs remain, delete the three `dangerouslyAllowSVG` lines from `next.config.mjs`.
7. **Supply the logo as SVG or transparent PNG** (see above).
8. **Add a 1200×630 OG image** and reference it in `lib/seo.ts`.
9. **Remove the indexing block**: `robots: { index: false }` in `app/layout.tsx` and the `disallow` in `app/robots.ts`.
10. **Add an embedded map** to `/location` — lazy-loaded; third-party map embeds are the heaviest thing that can land on a page like this, and the audience is on mid-range Android.
11. **Run an accessibility audit** and test on a real device.
