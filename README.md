# SV Developers

Multi-page marketing site for a residential land developer. Next.js 15 (App Router), React 19, TypeScript in strict mode, Tailwind v4, GSAP ScrollTrigger and Lenis. No UI framework, no state library.

The frontend was rebuilt from scratch in September 2026 against the design language specified in [docs/PRD-redesign.md](docs/PRD-redesign.md) — floating pill navigation, a full-bleed hero, an editorial serif/grotesk/mono type system, scroll-pinned sections and an oversized-wordmark footer. The content layer (`src/content`, `src/types`, `src/lib`) survived that rebuild unchanged.

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
    layout/               PillNav, Footer, Logo, SkipLink, SmoothScroll (Lenis)
    sections/             page-level blocks: Hero, Ticker, EnquiryPill, Statement,
                          MediaSequence, PinnedProof, ProjectCard, ProjectCatalogue,
                          ProjectDetail, FeatureList, StepList, Corridor, Testimonials,
                          ContactForm, ClosingCta, PageHero
    ui/                   primitives: Button, Icon, Media, Accordion, Lightbox, Reveal
  content/                site.ts (brand/nav) · pages.ts (page copy) · projects.ts (records)
  hooks/                  useMediaQuery
  lib/                    cx, href, seo
  styles/                 globals.css (tokens + base + utilities) · fonts/
  types/                  shared content types
```

Three layers only — `ui` knows nothing about the site, `sections` compose `ui`, `app` composes `sections`.

**Two files cover most edits:** `styles/globals.css` for how it looks, `content/*.ts` for what it says. Nothing else hard-codes a colour or a string.

### Styling

Tailwind v4, configured entirely in `src/styles/globals.css` — there is no `tailwind.config.js`. Every token lives in the `@theme` block and generates its own utility (`text-heading-xl`, `bg-surface`, `rounded-media`, `pt-section`), so changing the site's look means editing one block at the top of one file.

Two breakpoints exist: `tablet` (1024px) and `desktop` (1280px). Tailwind's defaults are cleared with `--breakpoint-*: initial` so nobody can reach for a breakpoint that is not part of the system.

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

- **Instrument Serif** — display, roman + italic, 43 KB
- **DM Sans** — body and UI, 62 KB
- **DM Mono** — labels, eyebrows and data, 29 KB

144 KB total, `font-display: swap`, with `adjustFontFallback` set so the fallback metrics match and the swap does not shift layout. To change the pairing, drop new `.woff2` files into `src/styles/fonts` and update the three `localFont()` calls in `app/layout.tsx` — nothing else references a font name.

Instrument Serif stands in for the reference design's ABC Marist, which is a commercial Dinamo face. If the exact face is ever licensed, it is a one-file swap.

**The italic is structural, not decorative.** An `<em>` inside a display heading is the second line of the headline — "Land you can build on *the week you buy it.*" — and `globals.css` styles it as such. Do not use `<em>` for mid-sentence emphasis inside a heading.

The type scale is fluid (`clamp()`) and each step is tuned to land on the reference design's measured sizes at 390px and 1440px, then stop: `heading-xl` runs 50px → 87px → 104px and goes no further.

---

## Colour and contrast

The palette is neutral by design: a warm off-white page, warm near-black type, white cards, and gold used **once per page**. There are no dark bands — contrast comes from photography and from white cards sitting on the off-white field.

| Token | Value | Carries type at |
|---|---|---|
| `--color-bg` | `#f9f8f5` | page background |
| `--color-surface` | `#ffffff` | cards, pills, FAQ rows |
| `--color-ink` | `#1a1613` | 15.6:1 on bg |
| `--color-ink-soft` | `#5f5953` | 6.9:1 on bg — secondary copy |
| `--color-ink-faint` | `#8a827a` | 3.6:1 — mono labels only, never body text |
| `--color-core-black` | `#070503` | 19.6:1 with white — buttons |
| `--color-gold` | `#c9a227` | fill only; 7.4:1 behind near-black |
| `--color-gold-ink` | `#7c5f1f` | 5.98:1 on white — the only gold that carries text |

If you change a colour, re-check the pair. Gold text on a light background is the trap this palette was built to avoid.

---

## The logo

The supplied file is a circular gold-and-green emblem on an **opaque white JPEG**. Two consequences drove the treatment in `components/layout/Logo.tsx`:

- Dropped onto the dark header it would render as a white rectangle, so it is clipped to a **white circular badge** — which reads as a deliberate design element rather than a stray box.
- At 40px the word "DEVELOPERS" inside the emblem is unreadable, so the badge is paired with a **text wordmark** that carries the legibility.

**Worth doing:** supply the logo as an **SVG or a transparent PNG**. That would allow the mark to sit directly on the dark bar without the white disc, and would cut it from 146 KB to a few KB. The source file is kept at `public/images/logo/` alongside the working copy.

---

## Accessibility

Verified in-browser against the production build over Chrome DevTools Protocol — **7 routes × 7 viewport widths (320 → 1920px)**:

- **No horizontal overflow** at any route or width (`scrollWidth == clientWidth` everywhere)
- **Exactly one `h1`** per route
- **Target sizes**: every standalone control clears 32px (WCAG 2.5.8 AA requires 24×24); primary navigation, buttons and form controls are held to 44px
- **Keyboard**: skip link first, a 2px focus ring on every stop, `:focus-visible` matching throughout
- **Mobile panel**: focus cycles inside it, Escape closes it, focus returns to the trigger, `aria-expanded` flips, body scroll lock releases
- **Dropdown** opens on click rather than hover, so it works on touch; Escape closes it
- **Active route** marked with `aria-current="page"` and a visible underline
- **FAQ accordion** is a `<button>` + `aria-expanded` + labelled region, one panel open at a time
- **Hero ticker** renders every line into the DOM for assistive technology and stops cycling under reduced motion — a rotating claim is a WCAG 2.2.2 problem
- `prefers-reduced-motion` honoured globally, in CSS *and* in the Lenis and GSAP components; a `<noscript>` rule keeps every revealed section visible without JS

Not yet done: an automated axe/Lighthouse pass, real-device touch testing, and Safari/iOS.

---

## Conventions worth knowing

- **GSAP is imported on demand.** `PinnedProof.tsx` `await import()`s GSAP and ScrollTrigger inside its effect, so ~70 KB stays out of the entry bundle for every page that does not animate on scroll.
- **Never use ScrollTrigger's `pin: true`.** It pins by wrapping the element in a `pin-spacer` div it injects, which reparents a node React owns; React then throws `NotFoundError: Failed to execute 'removeChild'` the moment you navigate away from that page. `PinnedProof.tsx` pins with CSS `position: sticky` and leaves ScrollTrigger doing only the scrubbing.
- **Motion is opt-out at the source.** Lenis never starts and ScrollTrigger never registers when `prefers-reduced-motion: reduce` is set — the checks live in the components, not only in CSS.
- **The hero has two modes.** `<Hero />` renders type on the off-white field; `<Hero media={{src, poster}} />` switches to full-bleed video with white type and a scrim. The type-only mode is the designed fallback until footage exists, not a broken state.
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
6. **Shoot the hero video and the site photography.** This design carries photography where the old one carried nothing: a 15–25s silent hero loop (≤3 MB, plus a poster frame), three infrastructure clips, and 8–12 stills for the project cards and the pinned proof band. Until they exist the hero runs in its type-only mode and `public/images/` holds neutral "IMAGE PENDING" placeholders. Pass `media` to `<Hero />` in `app/page.tsx` to switch it on. Once no SVGs remain, delete the three `dangerouslyAllowSVG` lines from `next.config.mjs`.
7. **Decide where the hero's phone capture goes.** `EnquiryPill.tsx` opens WhatsApp via `site.whatsapp` once that value is real; while it is a `[BRACKETED]` placeholder it routes to `/contact` with the number prefilled.
8. **Supply the logo as SVG or transparent PNG** (see above).
9. **Add a 1200×630 OG image** and reference it in `lib/seo.ts`.
10. **Remove the indexing block**: `robots: { index: false }` in `app/layout.tsx` and the `disallow` in `app/robots.ts`.
11. **Add an embedded map** to `/location` — lazy-loaded; third-party map embeds are the heaviest thing that can land on a page like this, and the audience is on mid-range Android.
12. **Run an accessibility audit** and test on a real device.
