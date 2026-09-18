# SV Developers — Frontend Rebuild PRD

**Status:** ✅ Implemented 18 September 2026 · **Owner:** RiseNext
**Reference design:** https://www.lassie.ai/ (measured 18 Sep 2026, Chrome 152, 1440×900 and 390×780)
**Decision this document asks for:** approval to delete the current frontend and rebuild it from scratch against the design system specified in Part 3.

---

## Build status

Everything in Part 3 and Part 4 is built and verified against the production build. What differs from the spec, and why:

| Spec | Built | Why |
|---|---|---|
| 10px root font-size (`62.5%`) | 16px root, same rendered px sizes | Keeps Tailwind's own spacing scale correct; the measured type sizes are reproduced by one fluid clamp per step instead of three breakpoint overrides |
| Video hero | Type-only hero, video mode ready | No footage exists yet. `<Hero media={{src, poster}} />` switches it on — see §3.5 |
| Dotted map of practices | Corridor map plate + measured proximity list | We have one corridor and five projects, not 2,500 pins |
| Story video pill | Testimonial cards, no video | No consented buyer footage; the placeholder quotes render visibly inert |
| Pale blue footer band | Pale gold band (`#f0e8d2`) | SV gold is the brand's one accent (open question 6 resolved this way) |

Verified: 18 static routes build clean, `tsc --noEmit` passes, no horizontal overflow at 320–1920px on any route, GSAP loads on demand only where a section pins, Lenis and ScrollTrigger both no-op under `prefers-reduced-motion`.

---

## 0. Scope and ground rules

### 0.1 What we are doing

Rebuilding the SV Developers marketing site's **frontend** from zero — new design system, new components, new page layouts — using lassie.ai's visual and interaction language as the reference. The **content, routes and data model of the current site are kept** (Part 1); everything that renders them is replaced.

### 0.2 What we are not doing

Not copying lassie.ai's assets. We replicate *patterns* — floating pill navigation, full-bleed cinematic hero, serif/grotesk/mono type system, scroll-pinned sections, rounded media cards, oversized wordmark footer — and rebuild them with our own code, our own photography and video, our own copy, and a licence-clean font stack. Specifically excluded: their logo/flower mark, their ABC Marist licence, their video and photography, their copy, their illustration set. This keeps the work on the right side of the line while delivering the same feel.

### 0.3 Non-negotiables carried over from the current build

These are existing project standards and they survive the rebuild:

| Standard | Requirement |
|---|---|
| Accessibility | WCAG 2.1 AA. Body text ≥ 4.5:1, non-text UI ≥ 3:1, visible focus on everything focusable, 44px touch targets, `prefers-reduced-motion` honoured |
| Placeholders | Unverified facts stay in `[SQUARE BRACKETS]`; bracketed hrefs render inert (`lib/href.ts`). No invented approval numbers, prices, drive times or testimonials |
| Fonts | Self-hosted, no network call at build or run time |
| SEO | Per-route metadata, sitemap, robots, JSON-LD. `robots: noindex` stays until real copy lands |
| Content | Single source of truth in `src/content/*`; adding a project object publishes a project |

---

## 1. Current website — the inventory we keep

Next.js 15.5.25 (App Router) · React 19.1.1 · TypeScript 5.9 · CSS Modules + design tokens · no UI dependencies · ~6,700 lines.

### 1.1 Routes

| Route | Purpose | Keep? |
|---|---|---|
| `/` | Home — hero, why-us, featured projects, master plan, amenities, location, reviews, CTA | Yes, re-laid-out |
| `/about` | Company story, values, approvals, stats | Yes |
| `/projects` | Catalogue of all projects, filterable by category | Yes |
| `/projects/[slug]` | Project detail — 5 projects live | Yes |
| `/blog` | Article index | Yes |
| `/contact` | Enquiry form, phone, WhatsApp, office hours, map | Yes |
| `/master-plan` | Layout plan with lightbox + plot sizes | Yes — folded into project detail, kept as a route |
| `/amenities` | Specification list | Yes — same treatment |
| `/location` | Proximity list, corridor context | Yes — same treatment |
| `/not-found` | 404 | Yes |

### 1.2 Content model (`src/content`, `src/types/content.ts`) — unchanged

- `site.ts` — name, tagline, description, email, phone, WhatsApp, address, map URL, office hours, `nav`, `social`, `footerNav`
- `pages.ts` — `media`, `home` (hero, intro, benefits), `about`, `amenities`, `location`, `masterPlan`, `testimonials`, `faq`
- `projects.ts` — 5 `Project` records: `slug`, `name`, `category`, `status`, `tagline`, `summary`, `highlights`, `approvals`, `amenities`, `proximity`, optional `masterPlan`, `locationMap`, `plotSizes`
- `blog.ts` — article records
- Types: `NavLink`, `FeatureItem`, `ProximityItem`, `Testimonial`, `ImageRef`, `ProjectStatus`, `ProjectCategory`, `Project`

**The five projects:** Sri City Aler Town (Premium Villa Plots, Aler/Warangal highway) · Sri Vanam Phase 2 (Farm Villa Plots, red sandalwood) · Siri Vanam (Farm Villa Plots, Gummadavelli) · Sri Nivasam (Swarnagiri, highway-facing) · SV Apartment (2BHK, Genome Valley).

### 1.3 What gets deleted

Everything under `src/components`, `src/styles`, and every `page.tsx` body. `src/content`, `src/types`, `src/lib`, `src/app/sitemap.ts`, `src/app/robots.ts` are ported with minimal edits. The maroon token ramp, the Fraunces/Jakarta pairing, the `Section`/`Container`/`PageHero`/`StatRow` component family and the CSS-module-per-component structure do not survive.

### 1.4 Known defects the rebuild must not reproduce

1. Hero was a left-aligned text block over a placeholder SVG with a scrim — three layers of maintenance for a picture that said nothing.
2. Content column capped at 1200px left dead bands at ≥1440px, and pushed the header logo far off the screen edge.
3. Every section was the same rhythm: eyebrow → title → lead → grid. No change of pace down the page.
4. Dark bands were the only device for contrast between sections.

---

## 2. Reference design — measured extraction from lassie.ai

All numbers below are measured, not estimated. Root font size is **10px** (`html { font-size: 62.5% }`), so `1rem = 10px` throughout their CSS; values here are given in px.

### 2.1 Stack

| Layer | What they use | What we use |
|---|---|---|
| Framework | Next.js App Router, RSC, `next/image`, `next/font/local` | Same (we are already on it) |
| CSS | Tailwind v4 with a token layer (`@theme`) | Tailwind v4 **or** CSS Modules + tokens — see §4.2 |
| Smooth scroll | Lenis (`html.lenis`) | Lenis |
| Scroll animation | GSAP ScrollTrigger with pinning (3 `pin-spacer` blocks on the homepage) | GSAP ScrollTrigger |
| Media | 6 `<video>` elements on the homepage, autoplay/muted/loop, `object-fit: cover`, poster images via `next/image` | Same pattern |

### 2.2 Colour

| Token | Value | Role |
|---|---|---|
| `background-primary` | `#f9f8f5` (stone-100) | Page background — warm off-white, never pure white |
| `background-secondary` / `surface-primary` | `#ffffff` | Cards, FAQ rows, nav pills |
| `text-primary` | `#1a1613` (black-800) | Headings and body — warm near-black, never `#000` |
| `text-secondary` | `#666666` | Captions, labels, secondary copy |
| `core-black` | `#070503` | Buttons |
| Accent band | `#ddf3f9` / `#c3eaf4` (blue-100/200) | One pale band at the very bottom of the page |
| Nav pill group | `rgba(227, 221, 207, 0.4)` + `1px` white @10% border + `backdrop-filter: blur(13px)` | Floating nav container |

The whole site is neutral. Colour appears **once** — the pale blue footer band. Everything else is warm greys, white cards and photography.

### 2.3 Typography

Three families, three jobs:

| Family | Their font | Job | Our substitute |
|---|---|---|---|
| Display | ABC Marist (commercial, Dinamo) — weight 350, italic used for emphasis | All headings, pull quotes, stat numbers | **Instrument Serif** or **Newsreader** (both OFL) — see §3.2 |
| Body/UI | DM Sans | Body, nav, buttons, labels | DM Sans (OFL) — use directly |
| Mono | DM Mono | Eyebrows, chips, timestamps, copyright, data | DM Mono (OFL) — use directly |

Measured scale (`rem` values are ×10 for px):

| Class | Mobile | ≥1024px | ≥1280px | Line-height | Tracking |
|---|---|---|---|---|---|
| `heading-xl` | `clamp(50px, 12.69vw, 64px)` | `clamp(74px, 7.22vw, 76.9px)` | `clamp(76.9px, 6.01vw, 104px)` | 0.95 | −0.02em |
| `heading-lg` | `clamp(36px, 9.13vw, 40px)` | `clamp(56px, 5.46vw, 66px)` | `clamp(51.8px, 4.05vw, 70px)` | 1.05 | −0.01em |
| `heading-md` | `clamp(24px, 6.09vw, 32px)` | `clamp(32px, 3.1vw, 42px)` | `clamp(29.6px, 2.31vw, 40px)` | 1.1 | 0 |
| `heading-sm` | `clamp(21px, 5.33vw, 28px)` | `clamp(28px, 2.73vw, 30px)` | `clamp(22.2px, 1.73vw, 30px)` | 1.1 | −0.2px |
| `heading-xs` | `clamp(16px, 4.06vw, 17px)` | `clamp(17px, 1.66vw, 19px)` | `19px` | 1.3 | 0 |
| `body-lg` | 16px / 16px | 18px / 18px | 20px / 20px | — | +0.01em |
| `body-md` | 14px / 18px | 16px / 20px | 17px / 24px | — | 0 |
| `body-sm` | 13px / 18px | 14px / 20px | 15px | — | +0.005em |

Observed on the homepage at 1440px: h1 **87px** (heading-xl), h2 **58px** (heading-lg), sub-head **25px** (heading-sm), lead **17px** (body-md), mono caption **10–14px**.

**The signature move:** headline line 1 roman, line 2 *italic* — "You're a doctor. / *Not a machine.*" Display weight is light (350), never bold. That lightness at 87px is most of the character.

### 2.4 Layout, spacing, radii

- Breakpoints: **1024px** (tablet) and **1280px** (desktop). Two, not five.
- Section padding is large and asymmetric: measured `padding-top` of **270px** on the first content section (`pt-[27rem]` at desktop), 160px/160px on the FAQ band, 200px/96px on the steps band.
- Gutter: 16px at mobile (`px-[1.6rem]`).
- Radii: **12px** (nav pills, buttons), **16px** (nav container, cards), **24px** (media cards), and a large top-corner radius on the footer band.
- Content column is not a single fixed max-width: full-bleed media, a centred ~540px column for FAQ, a ~780–820px media card, and a 12-column feel for the footer.

### 2.5 Navigation — the floating pill bar

Measured: `position: fixed; top: 16px`, horizontally centred (`left: 50%; translateX(-50%)`), height **44px**, width fits content (266px with two links).

- Outer container: `border-radius: 16px`, `background: rgba(227,221,207,0.4)`, `border: 1px solid rgba(255,255,255,0.1)`, `backdrop-filter: blur(13px)`.
- Inside it, each item is a **white pill**, `border-radius: 12px`, 44px tall: brand pill (mark + wordmark) then one pill per link.
- A **second, separate group** floats at `top: 16px; right: 16px` with the auth/conversion actions ("Login" ghost pill, "Demo" white pill).
- It stays fixed over everything, including the video hero, and does not change on scroll — no shrink, no background swap, no border.
- **Mobile (<1024px):** two pills only — brand pill and a "Menu" pill. Everything else collapses behind it.

### 2.6 Homepage section-by-section (measured heights at 1440px, total document 17,095px)

| # | Band | Height | What it is |
|---|---|---|---|
| 1 | Hero | 1000px (`h-svh`) | Full-bleed autoplay video, no overlay gradient. Centred 87px serif headline (roman + italic). Below it a 17px line and a rotating mono status ticker ("Confirmed 42 appointments" → "Posted $12,430 in payments" → …). Pinned to the bottom edge: a white **email-capture pill** (input + dark "Get started" button) |
| 2 | Statement | 3388px, `pt: 270px` | Centred brand mark, then a 58px serif headline with an italic fragment, then a 25px sub-head. Below: large rounded media cards (video, ~820×517) with floating white UI cards overlaid, and small muted captions parked in the left margin that swap as you scroll |
| 3 | Scroll-pinned proof | 3200px of scroll, 1000px pinned | Section pins; a 58px serif stat ("9% / of posting is handled autonomously") holds centre while photo tiles and product UI cards fly in from the edges and drift out. Pure GSAP ScrollTrigger |
| 4 | Trust / locations | 6000px of scroll | Dotted US map, clusters of brand marks for each practice. Headline "Trusted by 2,500+ doctors nationwide". A white rounded testimonial card (photo left, serif quote right, mono attribution chip) and a dark "Watch Dr. Kwon's story" pill with a video thumbnail |
| 5 | How it works | 947px | Centred heading, then a plain list of steps: 20px sans title + muted body, no cards, no icons |
| 6 | FAQ | 1078px | Centred ~540px column of white rounded rows, chevron on the right, one open at a time |
| 7 | Closing CTA | 764px | Full-width rounded-corner photograph band with a centred serif line and a dark "Get started" pill |
| 8 | Footer | — | Left: 58px serif statement + black "Get started" pill. Right: three link columns (Company / Socials / Legal) with muted mono headers. Centre: brand mark + mono copyright. Below: a pale blue band carrying an oversized wordmark, clipped by the page's rounded bottom corners |

### 2.7 Interaction and motion

- **Lenis** smooth scrolling on `html` — the single biggest contributor to the "expensive" feel.
- **GSAP ScrollTrigger** pinning for sections 3 and 4; elements enter on scroll progress, not on a timer.
- Media is **video-first**: hero, feature cards and story cards are all silent looping video with image posters.
- Copy animates in as blocks, never letter-by-letter. Nothing bounces. Durations are long and eased.
- `prefers-reduced-motion: reduce` is respected in their CSS.

### 2.8 Sub-pages

- **`/stories`** — full-bleed video hero with a row of rounded video cards floating over it, each with a mono duration badge and a caption below; a centred serif title + location line at the bottom. A gallery, not a blog.
- **`/company`** — no hero image. Off-white field, 87px serif headline ("Reimagining the / doctor's office."), a 20px serif sub-line, and long-form sections below. Proof that the system works without photography.

---

## 3. The SV Developers build

### 3.1 Translation table — their pattern → our page

| Reference pattern | SV Developers equivalent |
|---|---|
| Video hero, "You're a doctor. / *Not a machine.*" | Drone/ground footage of a finished layout — roads, compound wall, avenue plantation. Headline: "Land you can build on. / *The week you buy it.*" |
| Rotating mono status ticker | Rotating live proof: "DTCP & RERA approved" → "Spot registration" → "30ft BT roads laid" → "Clear title" |
| Email-capture pill at the hero's bottom edge | **Phone-capture pill** — "Your mobile number" + "Book a site visit". Phone beats email for plot enquiries in this market |
| Statement section with product UI cards | "What is already built" — footage of roads, drainage, water lines, street lights, with floating spec chips (30ft BT roads, underground drainage, drip irrigation) |
| Scroll-pinned stat ("9% of posting…") | Scroll-pinned proof: "[000]+ plots handed over / [0] layouts completed" with plot photos flying past |
| Dotted US map with practice clusters | **Corridor map** — Hyderabad ORR → Ghatkesar → Bhuvanagiri → Aler → Warangal, with our five projects marked, and the proximity list attached |
| Testimonial card + "Watch the story" pill | Buyer testimonial card + "Walk the layout" video pill (real, consented quotes only — current placeholders must be replaced or the section ships empty) |
| "How Lassie works" steps | "How buying works" — enquire → site visit → documents to your lawyer → booking → registration in [00] days |
| FAQ accordion | FAQ accordion, same treatment, content from `pages.ts` |
| Closing CTA over a photograph | Closing CTA over layout photography: "Come and walk the plot" + "Book a site visit" |
| Oversized wordmark footer on a colour band | "SV DEVELOPERS" oversized in the footer band |

### 3.2 Design tokens (the spec to build)

**Type** — root at 62.5% (`1rem = 10px`), fluid clamps copied structurally from §2.3:

```
--font-display: 'Instrument Serif'   /* light weight, italic available — the ABC Marist stand-in */
--font-body:    'DM Sans'
--font-mono:    'DM Mono'
```

> **Decided 18 Sep 2026: Instrument Serif.** Closest free match to ABC Marist — high contrast, light weight, true italic, OFL, self-hostable. Newsreader and a paid ABC Marist licence were the alternatives considered.

**Colour** — the neutral base is kept as measured; SV's gold becomes the single accent, replacing their pale blue:

```
--bg-primary:   #f9f8f5   /* warm off-white page */
--bg-surface:   #ffffff   /* cards, pills, FAQ rows */
--text-primary: #1a1613   /* warm near-black */
--text-secondary:#666666
--core-black:   #070503   /* buttons */
--accent:       #c9a227   /* gold — footer band, chips, one-per-page use only */
--accent-ink:   #7c5f1f   /* gold that is legal on white, 5.98:1 */
```

No maroon. No dark-green ramp. No dark section bands — contrast comes from photography and from the white cards, exactly as in the reference.

**Space and shape:** breakpoints 1024 / 1280 only. Radii 12 / 16 / 24 / 40px. Section padding `clamp(96px, 12vw, 270px)` top, `clamp(64px, 8vw, 160px)` bottom. Gutter `clamp(16px, 2vw, 32px)`.

### 3.3 Component inventory (rebuild list)

**Layout:** `PillNav` (desktop centre group + right action group + mobile menu sheet) · `Footer` (statement + columns + wordmark band) · `SmoothScroll` (Lenis provider) · `SkipLink`

**Primitives:** `Button` (dark / white / ghost pill, 12px radius, 44px min) · `Pill` · `MonoLabel` · `Card` (white, 16px) · `MediaCard` (24px, video with poster) · `Chip` · `Accordion` · `Lightbox`

**Sections:** `VideoHero` (video + headline + ticker + capture pill) · `StatementBlock` (centred serif + italic fragment) · `PinnedProof` (GSAP) · `MarginCaptions` (sticky left captions beside media) · `CorridorMap` · `TestimonialCard` · `StepList` · `FaqAccordion` · `ClosingCta` · `ProjectCard` / `ProjectGrid` · `ProximityList` · `SpecList`

**Hooks/lib:** `useScrollTrigger`, `useReducedMotion`, `useMediaQuery`, `cx`, `href`, `seo`

### 3.4 Page layouts

**`/` Home** — VideoHero → StatementBlock ("What we hand over is already built") with MarginCaptions + MediaCards → PinnedProof (track record) → Featured projects (3 ProjectCards, rounded media, mono category label) → CorridorMap + proximity → Testimonials → StepList (how buying works) → FAQ → ClosingCta → Footer.

**`/about`** — no-image hero in the `/company` mould (87px serif on off-white) → story in long serif/sans columns → values as a plain step list → approvals as mono-labelled rows → team/founder block → ClosingCta.

**`/projects`** — short text hero → category filter as mono pills → grid of ProjectCards (3-up desktop, 1-up mobile), each: 24px-radius media, status chip, name in serif, tagline in sans, mono category → ClosingCta.

**`/projects/[slug]`** — VideoHero variant scoped to the project (or photo if no footage) → summary statement → highlights as MarginCaptions beside media → approvals → amenities grid → master plan with Lightbox → location map + proximity → FAQ (project-specific if present) → ClosingCta. Optional fields still drop their section entirely.

**`/blog`** — stories-page treatment: rounded cards in a loose row, mono date badge, serif title; full-width feature card for the latest post.

**`/contact`** — split: left, the form on white with 12px-radius inputs; right, phone/WhatsApp/office-hours/address as mono-labelled rows plus the map. Phone-capture pill repeated in the footer of the page.

**`/master-plan`, `/amenities`, `/location`** — single-purpose pages in the `/company` mould: text hero, one media block, one list, ClosingCta.

**`/not-found`** — off-white field, serif line, one pill back to `/`.

### 3.5 The dependency that decides whether this works

**This design is 70% photography and video.** The reference site carries 6 videos on its homepage alone. Today SV Developers has five placeholder SVGs (`hero.svg`, `master-plan.svg`, `plot-sizes.svg`, `location-thumb.svg`, `hero-portrait.svg`) and no photography.

Minimum asset list to ship the homepage as specified:

1. Hero video — 15–25s silent loop, drone approach over a finished layout, ≤3MB H.264/AV1, plus a poster frame.
2. Three infrastructure clips (roads, drainage/water, street lights + plantation), 8–12s each.
3. 8–12 stills of completed layouts for the pinned proof and project cards.
4. One buyer-story video + consented quotes, or the testimonial section ships without quotes.
5. Real master plan drawings per project (existing SVGs are placeholders).

Without items 1–3 the hero falls back to the `/company` treatment — type on off-white — which is a real, tested fallback, not a failure state. **Recommendation: build the fallback first, wire the video in when footage lands.**

---

## 4. Build plan

### 4.1 Order

1. **Wipe and scaffold** — delete `src/components`, `src/styles`, page bodies. Keep `src/content`, `src/types`, `src/lib`, `robots.ts`, `sitemap.ts`. Fresh token layer, fresh `layout.tsx`.
2. **Fonts** — self-host Instrument Serif (roman + italic), DM Sans, DM Mono as variable woff2 under `src/styles/fonts`, wired through `next/font/local`.
3. **Primitives + PillNav + Footer** — the chrome, on a blank page, proven at 390 / 1024 / 1440 / 1920.
4. **Home** — in section order, fallback (no video) first.
5. **Motion** — Lenis, then GSAP ScrollTrigger for the two pinned sections, behind `prefers-reduced-motion`.
6. **Remaining routes** — projects, project detail, about, contact, blog, the three single-purpose pages, 404.
7. **Pass** — a11y audit, Lighthouse, contrast validation, placeholder sweep.

### 4.2 Dependencies to add

`tailwindcss` v4, `gsap` (ScrollTrigger), `lenis`.

> **Decided 18 Sep 2026: Tailwind v4**, matching the reference stack. Tokens live in an `@theme` layer (colour, type scale, radii, breakpoints) and every utility resolves to one of them — the token file stays the single place the site is re-skinned. CSS Modules are dropped; a component keeps a module only where a utility string would become unreadable (keyframes, pinned-section rules).

### 4.3 Budgets and acceptance

| Metric | Target |
|---|---|
| LCP (4G, mobile) | < 2.5s — poster image is the LCP element, video loads after |
| Hero video | ≤ 3MB, `preload="none"` on mobile, poster always |
| Fonts | ≤ 150KB total, latin subset, self-hosted |
| CLS | < 0.05 — every media box has explicit dimensions |
| Lighthouse a11y | 100 |
| Horizontal scroll | Zero at 320 / 390 / 768 / 1024 / 1440 / 1920 |
| Reduced motion | Lenis and ScrollTrigger disabled; all content visible statically |
| Contrast | Every pair AA-validated and recorded in the token file |

### 4.4 Out of scope

Backend, CMS, lead capture persistence (the phone-capture pill posts to the existing contact route), analytics, multilingual (Telugu) — flag for phase 2.

---

## 5. Decisions and open questions

**Decided (18 Sep 2026)**

1. ~~Display font~~ → **Instrument Serif** (§3.2)
2. ~~Tailwind v4 or CSS Modules~~ → **Tailwind v4** (§4.2)

**Still open — each has a stated default so the build is not blocked**

3. **Video** — is footage available? *Default: build the type-only `/company`-style fallback first and retrofit video when it lands.*
4. **Phone-capture pill** — where does the number go: WhatsApp deep link, the existing contact form handler, or a CRM? *Default: WhatsApp deep link, since `site.whatsapp` already exists.*
5. **Testimonials** — do we have real, consented quotes? *Default: section ships without quotes rather than with the written placeholders.*
6. **Accent colour** — SV gold as the single accent (assumed in §3.2), or fully neutral like the reference with photography carrying all the colour?

---

## Appendix — evidence

Measurements taken with Chrome DevTools Protocol against the live site: computed styles, bounding boxes, CSS custom properties, and scroll-position screenshots at 1440×900 and 390×780. Raw CSS bundles (`33kijvutmv7fh.css`, `2pwuu5ye94ciu.css`), the probe output JSON and 15 reference screenshots are in the session scratchpad and can be re-captured with the scripts in `scratchpad/cdp.mjs` and `scratchpad/slice.mjs`.
