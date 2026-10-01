import type { FeatureItem, ImageRef, ProximityItem } from '@/types/content';

/* =============================================================================
   PAGE COPY — placeholder throughout.

   ⚠️  Two categories must be replaced by someone who can verify them:
   1. [BRACKETED] values — approval numbers, dimensions, addresses, URLs.
   2. Drive times in `proximity` — illustrative. Measure them; proximity is the
      claim most likely to be challenged on a land page.

   `testimonials` used to be a third category and is GONE — see the note where
   it stood. Reviews are CMS data now, and no invented review exists anywhere in
   this repository.
   ========================================================================== */

/* ---------- Shared media -------------------------------------------------- */

export const media = {
  hero: {
    src: '/images/hero.svg',
    alt: '',
    width: 2400,
    height: 1350,
  } satisfies ImageRef,
  heroPortrait: '/images/hero-portrait.svg',
  /* `masterPlan` and `plotSizes` were removed with /master-plan, and their two
     placeholder SVGs deleted from public/images — the page was their only
     reader.

     🔶 `locationMap` IS NOW UNUSED. <Corridor> was its last reader and the map
     container was removed from that section on request. Nothing renders this
     entry or /images/location-thumb.svg any more — both can be deleted, and
     doing so takes the repo one SVG closer to dropping `dangerouslyAllowSVG`
     from next.config.mjs (see the note there). Left in place for now rather
     than deleted on assumption, since the map may yet come back. */
  locationMap: {
    src: '/images/location-thumb.svg',
    alt: 'Map thumbnail showing the location of the layout.',
    width: 520,
    height: 300,
  } satisfies ImageRef,
};

/* ---------- Home ---------------------------------------------------------- */

export const home = {
  hero: {
    /* No `eyebrow` here, unlike every other page's hero: the home hero's
       eyebrow ("Approved plots · [LOCALITY]") was removed on request, and it
       was an unresolved [LOCALITY] placeholder that had never been filled.

       Split so the hero can set the second half in italic. Read together they
       are one sentence; nothing else depends on the halves. */
    title: 'Land you can build on',
    titleAccent: 'the week you buy it.',
    lead: 'Every SV Developers plot is clear-titled, fully developed and ready to register — roads laid, water and power at the boundary, compound wall standing before the first sale.',
    primaryCta: { label: 'Book a site visit', href: '/contact' },
    /* `secondaryCta` — "See the master plan" — is gone with /master-plan. It
       had already stopped being rendered by the hero before that; removing the
       route is simply what made it worth deleting rather than noting. */
    /* The rotating `ticker` that used to live here was removed with the Ticker
       itself. It was the STATIC FALLBACK for the CMS's `site.heroTicker`, so
       the two only made sense together — keeping it would have left dead copy
       standing in for a field that no longer renders. */
    stats: [
      { label: 'Years building', value: '[00]+' },
      { label: 'Plots handed over', value: '[000]+' },
      { label: 'Layouts completed', value: '[0]' },
      { label: 'Registration', value: 'Immediate' },
    ],
  },
  /* The `intro` block that used to sit here — the "Why SV Developers /
     Finished infrastructure, not a promise of it" statement — was removed with
     the section it fed. It had exactly one reader (the home page), so leaving
     it would have stranded a heading and a paragraph nothing renders. */
  /* The `steps` array that used to sit here — the five-stage purchase walkthrough
     — was removed with the "How buying works" section it fed. It had exactly one
     reader, and leaving it would have stranded five paragraphs of copy (including
     an unverified `[00] working days` placeholder) that nothing rendered. */
  benefits: [
    {
      icon: 'document',
      title: 'Clear, single-owner title',
      body: 'Every layout is bought outright from a single owner and comes with a complete document set for your lawyer to check.',
    },
    {
      icon: 'shield',
      title: 'Approved layouts',
      body: 'Sanctioned by [APPROVING AUTHORITY]. Approval numbers are printed on the plan and given to you in writing.',
    },
    {
      icon: 'route',
      title: 'Corridor frontage',
      body: 'Direct access from the [ROAD NAME] corridor, [00] km from the [CITY] outer ring.',
    },
    {
      icon: 'fence',
      title: 'Gated and walled first',
      body: 'The compound wall, gate and security cabin are complete before any plot is released.',
    },
    {
      icon: 'bank',
      title: 'Bank finance available',
      body: 'Approved for plot loans from [LENDER NAMES], with paperwork handled in-house.',
    },
    {
      icon: 'key',
      title: 'Registration in days',
      body: 'Sub-registrar appointments are typically completed within [00] working days of booking.',
    },
  ] satisfies readonly FeatureItem[],
} as const;

/* ---------- About --------------------------------------------------------- */

export const about = {
  hero: {
    eyebrow: 'About us',
    title: 'A plot business built on finishing things',
    lead: 'SV Developers has been laying out and selling residential plots on the [ROAD NAME] corridor since [YEAR].',
  },
  story: {
    eyebrow: 'Our approach',
    title: 'We sell what is already built',
    body: [
      'SV Developers was started in [YEAR] by [FOUNDER NAME] after a decade of [BACKGROUND]. The premise has not changed since: buy land outright, complete the infrastructure, then sell.',
      'That order costs more upfront and takes longer to bring to market. It also means a buyer can walk the road to their own plot on the day they book, which is the only thing that reliably separates a real layout from a drawing.',
      'We have completed [0] layouts and handed over more than [000] plots. Every one of them is still standing and still maintained — the completed projects page exists so you can go and look.',
    ],
  },
  values: [
    {
      icon: 'document',
      title: 'Documents first',
      body: 'Full document set handed over at booking, not at registration. Take it to your own lawyer.',
    },
    {
      icon: 'check',
      title: 'No hidden charges',
      body: 'One price per square foot. Development charges, corner charges and maintenance deposits are quoted upfront.',
    },
    {
      icon: 'wall',
      title: 'Built before sold',
      body: 'Roads, drains, water, power and the boundary wall are complete before the first plot is released.',
    },
    {
      icon: 'key',
      title: 'Handover that lasts',
      body: 'Layouts are transferred to a residents’ association with a maintenance corpus, not abandoned.',
    },
  ] satisfies readonly FeatureItem[],
  approvals: {
    eyebrow: 'Approvals',
    title: 'What we can show you in writing',
    lead: 'Ask for any of these at a site visit and you will be given a copy the same day.',
    items: [
      { icon: 'document', title: 'Layout approval — [APPROVAL NO.], [AUTHORITY]' },
      { icon: 'document', title: 'RERA registration — [RERA REG. NO.]' },
      { icon: 'document', title: 'Encumbrance certificate for the past [00] years' },
      { icon: 'document', title: 'Title deed and parent documents' },
      { icon: 'document', title: 'Approved layout plan with plot numbering' },
      { icon: 'document', title: 'Conversion / land-use order — [ORDER NO.]' },
    ] satisfies readonly FeatureItem[],
  },
} as const;

/* ---------- Amenities and master plan: REMOVED -----------------------------
   The `amenities` and `masterPlan` blocks stood here — seven specification
   items, the maintenance note, the approved-layout notes and the plot-size
   copy. They went with /amenities and /master-plan on 28 Sep 2026, and the
   route comment in content/site.ts says why.

   🔴 NOT MOVED, DELETED. A project's own specifications, plan and amenities
   come from the CMS (`project.amenities`, `project.layoutImage`) and render in
   <ProjectDetail>. None of this copy fed those, and all of it was
   [BRACKETED] placeholder awaiting numbers that now only ever arrive per
   project. Restoring the pages means writing the copy again, not un-deleting
   it — take it from git history at 216c453 if that day comes. */

/* ---------- Location ------------------------------------------------------- */

/* 🔶 NOTHING READS THIS ANY MORE. It survived the /location deletion because
   <Corridor> on the home page still read `intro.eyebrow`, `hero.lead` and
   `proximity`; that section was removed on request and Corridor.tsx deleted,
   so this block now has no reader at all.

   It is kept rather than deleted because those eight drive times are the only
   place the corridor claims are written down anywhere in the repo, and they
   are [BRACKETED] placeholders someone still has to measure. Delete the whole
   export once that is settled elsewhere — nothing will break.

   `growth` — the "Why this corridor" feature list — did go: /location was its
   only reader. */
export const location = {
  hero: {
    eyebrow: 'Location',
    title: 'On the corridor, not beyond it',
    /* Deliberately general: each project carries its own location section built
       from its own brochure, and this is the one line that has to be true of
       all of them at once. */
    lead: 'Our projects sit along the Warangal highway corridor at Aler and Bhongir, and at Genome Valley near Shamirpet. Each project page lists the landmarks and connectivity named on its brochure.',
  },
  intro: {
    eyebrow: 'Connectivity',
    title: 'Everything within a half-hour drive',
    lead: 'Roadway access, employment, schools and healthcare are all already built out around the site — this is not a corridor waiting for infrastructure to arrive.',
  },
  proximity: [
    { icon: 'route', measure: '5 min', place: 'to [HIGHWAY / ORR junction]' },
    { icon: 'bus', measure: '8 min', place: 'to [BUS TERMINAL]' },
    { icon: 'school', measure: '10 min', place: 'to [SCHOOL NAME]' },
    { icon: 'shop', measure: '12 min', place: 'to [SHOPPING CENTRE]' },
    { icon: 'hospital', measure: '15 min', place: 'to [MULTI-SPECIALITY HOSPITAL]' },
    { icon: 'briefcase', measure: '20 min', place: 'to [IT PARK / SEZ]' },
    { icon: 'train', measure: '22 min', place: 'to [RAILWAY STATION]' },
    { icon: 'temple', measure: '25 min', place: 'to [TEMPLE / LANDMARK]' },
    { icon: 'city', measure: '30 min', place: 'to [CITY CENTRE]' },
    { icon: 'plane', measure: '45 min', place: 'to [INTERNATIONAL AIRPORT]' },
    { icon: 'road', measure: '[00] km', place: 'of frontage on [ROAD NAME]' },
  ] satisfies readonly ProximityItem[],
} as const;

/* ---------- Testimonials --------------------------------------------------- */

/* 🔴 DELETED, NOT MOVED. Three invented reviews with `[CLIENT NAME n]`
   attributions used to live here. They were already unreachable — `app/page.tsx`
   reads testimonials from the CMS via `getTestimonials()` — so they were
   fabricated review text sitting in the repository with nothing but an import
   away from being published.

   Testimonials are entered through Payload Admin, and the CMS returns only rows
   that are BOTH published AND consented (enforced at the form, at the API and
   by a database CHECK constraint). Until a real, consented review exists the
   section renders nothing, which is the correct outcome. */

/* ---------- Contact -------------------------------------------------------- */

export const contact = {
  hero: {
    eyebrow: 'Contact',
    title: 'Book a site visit',
    lead: 'Leave a number and we will call back with directions, current availability and pricing.',
  },
  formNote:
    'We will only use your number to talk to you about this project. [LINK TO PRIVACY POLICY]',
  faq: [
    {
      q: 'Can I visit without booking?',
      a: 'Yes. The site office is open [OFFICE HOURS], seven days a week. Booking ahead means someone is free to walk the layout with you.',
    },
    {
      q: 'What documents will I be given?',
      a: 'The full set at booking: approved layout plan, title deed and parent documents, encumbrance certificate, and the conversion order. Take them to your own lawyer.',
    },
    {
      q: 'Is bank finance available?',
      a: 'Plot loans are available from [LENDER NAMES]. We prepare the lender’s document set in-house; sanction remains the bank’s decision.',
    },
    {
      q: 'How long does registration take?',
      a: 'Typically [00] working days from booking, subject to sub-registrar appointment availability.',
    },
    {
      q: 'What are the additional charges?',
      a: 'Development charges, corner plot charges where applicable, and a one-time maintenance deposit. All are quoted upfront, before booking.',
    },
  ],
} as const;

/* ---------- Cross-page CTA ------------------------------------------------- */

/* 🔴 DELETED. `ctaBanner` held "Come and walk the layout" / "Site visits run
   seven days a week…" / "Book a site visit", and fed the ClosingCta band on the
   home, about and projects pages. The band was removed on request from every
   page that carried it, along with the matching sand band on the project detail
   pages, so both the component and this copy are gone rather than left behind
   as an unused export that reads like live content.

   The same ask still reaches people from the nav bar, the hero enquiry pill,
   each project's enquiry card and /contact. */
