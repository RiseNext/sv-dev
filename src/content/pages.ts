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

/* ⚠️ A REAL, NAMED INDIVIDUAL — not placeholder copy like the rest of this
   file. Nothing in `leadershipPeople` may be invented or embellished: every
   clause is the company's own wording. If a role or a figure changes, change it
   here; do not guess at it.

   🔶 ONE PROFILE, DOWN FROM TWO. Mr. Rajendra Prasad Reddy's entry was removed
   on the owner's instruction (8 Oct 2026) and Mrs. Sahitya Reddy's role changed
   from Managing Director to Chairman at the same time. THE `story.body`
   PARAGRAPH BELOW MOVED WITH IT — it named him as Chairman, so leaving it would
   have put two different Chairmen on one page. The two are a pair: a profile
   cannot be removed here without checking that paragraph.

   🔴 THE SUPPLIED BIO SAID "As the Managing Director of her company". It reads
   "Chairman" here. That is NOT a transcription slip — the owner's instruction
   to make her Chairman came one message before the bio, and the bio is the
   company's existing About-page text, written under the old title. Printing it
   verbatim would have put the role label "Chairman" directly above a sentence
   calling her Managing Director, on the same card. If the old title was the
   intended one, this word and `role` below both flip back together.

   🔴 "Mrs." IS THE SECOND DEVIATION FROM THE SUPPLIED TEXT, on the owner's
   instruction (9 Oct 2026): the bio arrived reading "Ms." throughout. It is
   changed in ALL THREE places the honorific appears — `name` and `body` here,
   and the "We are led by Chairman" line in `story.body` below — because two of
   them sit on the same page and one page cannot address her two ways.

   Those two words aside, every clause is verbatim. */
type Leader = {
  name: string;
  role: string;
  body: string;
  /** A portrait, shown beside the bio. ABSENT ON PURPOSE: none has been
   *  supplied yet, so <AboutPage> reserves the slot instead of collapsing it.
   *  Add the image here and the slot fills with no layout change. */
  photo?: ImageRef;
};

const leadershipPeople: readonly Leader[] = [
  {
    name: 'Mrs. Sahitya Reddy',
    role: 'Chairman',
    body: 'Mrs. Sahitya Reddy is a dynamic and successful woman entrepreneur with extensive experience across various industries. As the Chairman of her company, she leads the Marketing, Vendor Management, and HR functions, driving strategic growth and operational efficiency. Her leadership skills, vision, and ability to manage multiple facets of the business have significantly contributed to the company’s success.',
  },
];

/* 🔴 THE COMPANY NAME IS DELIBERATELY ABSENT FROM THIS COPY.
   The source wording names "SRR Developers Pvt. Ltd."; the CMS returns
   "SV Developers" for `site.name`, and that is what the nav, the footer and
   every SEO title render. Hardcoding either name here would put two different
   companies on one page, so the sentences are written to carry the meaning
   without the name and let the site's own branding say who it is.

   README, "Before you go live", item 1 is this exact unresolved question.
   Once the name is settled, the name can go back into the first sentence. */
export const about = {
  hero: {
    eyebrow: 'About us',
    title: 'A plot business built on finishing things',
    lead: 'One of the leading and well-established real estate companies based in Hyderabad, developing residential plots, open plots and gated communities.',
  },
  story: {
    eyebrow: 'Welcome',
    title: 'We sell what is already built',
    body: [
      'We are one of the leading and well-established real estate companies based in Hyderabad — a dedicated and innovative property development company specialising in farm lands, villa plots, residential plots, gated communities and luxury real estate.',
      /* Named Mr. Rajendra Prasad Reddy as Chairman until 8 Oct 2026. His
         profile came out of `leadership` below, so his name came out of here
         too — and the title moved with it, since Mrs. Sahitya Reddy is now
         Chairman. The honorific changed on 9 Oct 2026 with the other two —
         see the note on `leadershipPeople`. Nothing else in the sentence
         changed. */
      'We are led by Chairman Mrs. Sahitya Reddy, offering premium real estate solutions, land investments, residential properties, investment opportunities and high-end villas.',
      'The company is known for its focus on quality construction, transparency, customer satisfaction, and a strong commitment to developing sustainable properties in the real estate market.',
      'At the core of our success is strong partnerships and unwavering support, empowering us to deliver exceptional results for our clients and build lasting value in every project.',
    ],
  },
  /* The leadership of the company. There was no slot for it in this layout, so
     <AboutPage> renders it in a surface card matching the office block below —
     the bio on the left, a portrait slot on the right.

     The people themselves are `leadershipPeople`, declared at the top of this
     file: it is the one block here holding statements about a real, named
     person, and the warnings that govern it belong where the data is. */
  leadership: {
    eyebrow: 'Our team',
    /* No longer "across finance, delivery and marketing". Those were the two
       remits between them; with one profile left, the functions named here are
       the ones the page can still show someone accountable for. */
    lead: 'Leading the business across marketing, vendor management and HR.',
    people: leadershipPeople,
  },
  /* Mission, vision and values, replacing four invented "rules we do not bend".
     Those four were written for this site rather than supplied by the company;
     these three are the company's own words. */
  values: [
    {
      icon: 'compass',
      title: 'Mission',
      body: 'To achieve corporate excellence in all aspects of our functioning and deliver the best to the customers through innovation, creativity, expertise, experience and exceeding client’s expectations in all aspects.',
    },
    {
      icon: 'city',
      title: 'Vision',
      body: 'To transform open plots into valuable, sustainable real estate investments, creating thriving gated communities and luxury properties.',
    },
    {
      icon: 'shield',
      title: 'Values',
      body: 'We prioritise integrity, quality and innovation in developing residential plots, open plots and gated communities.',
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
