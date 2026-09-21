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
  masterPlan: {
    src: '/images/master-plan.svg',
    alt: 'Master plan showing plot numbering, the internal road network and open spaces.',
    width: 1500,
    height: 1000,
  } satisfies ImageRef,
  plotSizes: {
    src: '/images/plot-sizes.svg',
    alt: 'Diagram of the available plot sizes and orientations.',
    width: 1024,
    height: 1024,
  } satisfies ImageRef,
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
    eyebrow: 'Approved plots · [LOCALITY]',
    /* Split so the hero can set the second half in italic. Read together they
       are one sentence; nothing else depends on the halves. */
    title: 'Land you can build on',
    titleAccent: 'the week you buy it.',
    lead: 'Every SV Developers plot is clear-titled, fully developed and ready to register — roads laid, water and power at the boundary, compound wall standing before the first sale.',
    primaryCta: { label: 'Book a site visit', href: '/contact' },
    secondaryCta: { label: 'See the master plan', href: '/master-plan' },
    /* Cycled one at a time under the headline. Each line restates something
       the project brochures already claim — nothing new is asserted here. */
    ticker: [
      { icon: 'shield', text: 'DTCP and RERA approved layouts' },
      { icon: 'document', text: 'Clear, single-owner title' },
      { icon: 'key', text: 'Spot registration' },
      { icon: 'road', text: 'BT roads, drains and street lighting complete' },
      { icon: 'bank', text: 'Bank plot loans available' },
    ],
    stats: [
      { label: 'Years building', value: '[00]+' },
      { label: 'Plots handed over', value: '[000]+' },
      { label: 'Layouts completed', value: '[0]' },
      { label: 'Registration', value: 'Immediate' },
    ],
  },
  intro: {
    eyebrow: 'Why SV Developers',
    title: 'Finished infrastructure,',
    titleAccent: 'not a promise of it',
    lead: 'Most layouts on this corridor sell a drawing. We release plots only once the work in that drawing is on the ground and can be walked.',
  },
  /* How a purchase actually runs, start to finish. Bracketed figures are
     unverified and must be confirmed before this page is indexed. */
  steps: [
    {
      title: 'Tell us what you are looking for',
      body: 'Plot size, budget and which corridor. We send back what is actually available, not a brochure.',
    },
    {
      title: 'Walk the layout',
      body: 'Site visits run seven days a week. You see the roads, drains, lighting and boundary wall as they stand that day.',
    },
    {
      title: 'Take the documents to your own lawyer',
      body: 'The full set at booking: approved layout plan, title deed and parent documents, encumbrance certificate, conversion order.',
    },
    {
      title: 'Book the plot',
      body: 'One price per square yard, with development, corner and maintenance charges quoted upfront. Plot loans arranged in-house where needed.',
    },
    {
      title: 'Register',
      body: 'Sub-registrar appointments are typically completed within [00] working days of booking.',
    },
  ],
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

/* ---------- Amenities ------------------------------------------------------ */

export const amenities = {
  hero: {
    eyebrow: 'Amenities',
    title: 'What is already built',
    lead: 'Seven pieces of infrastructure, all complete before the first plot in a layout is released for sale.',
  },
  specifications: [
    {
      icon: 'road',
      title: 'Blacktop internal roads',
      body: '[00] ft main roads and [00] ft internal roads, fully laid and surfaced before handover.',
    },
    {
      icon: 'droplet',
      title: 'Underground water lines',
      body: 'Drawn to every plot boundary from a dedicated overhead tank inside the layout.',
    },
    {
      icon: 'bolt',
      title: 'Underground electricity',
      body: 'No overhead cabling anywhere. Transformer and feeder commissioned before release.',
    },
    {
      icon: 'drain',
      title: 'Storm-water drainage',
      body: 'Covered drains on both sides of every road, graded to the natural fall of the site.',
    },
    {
      icon: 'lamp',
      title: 'Street lighting',
      body: 'LED street lights at [00] m intervals across the full internal road network.',
    },
    {
      icon: 'tree',
      title: 'Landscaped open space',
      body: 'Avenue planting along each road, plus a central park with a children’s play area.',
    },
    {
      icon: 'fence',
      title: 'Compound wall and gate',
      body: 'Continuous boundary wall with a single controlled entry and a security cabin.',
    },
  ] satisfies readonly FeatureItem[],
  maintenance: {
    eyebrow: 'After handover',
    title: 'Who maintains it once you own it',
    body: [
      'Each layout is handed to a residents’ association once [00]% of plots are sold, together with a maintenance corpus funded from the sale price.',
      'Until that point, SV Developers maintains the roads, lighting, landscaping and security at its own cost. There is no interim maintenance charge.',
    ],
  },
} as const;

/* ---------- Master plan ---------------------------------------------------- */

export const masterPlan = {
  hero: {
    eyebrow: 'Master plan',
    title: 'The approved layout',
    lead: 'Plot numbering, the internal road network and open-space allocation for the full development.',
  },
  downloadHref: '[MASTER_PLAN_PDF_URL]',
  notes: [
    { icon: 'ruler', title: 'Plot sizes from [000] to [0000] sq ft' },
    { icon: 'compass', title: 'East- and north-facing orientations available' },
    { icon: 'road', title: '[00] ft main road, [00] ft internal roads' },
    { icon: 'tree', title: '[00]% of the extent reserved as open space' },
  ] satisfies readonly FeatureItem[],
  plotSizes: {
    eyebrow: 'Plot sizes',
    title: 'Four standard sizes',
    lead: 'Dimensions shown are indicative. Exact measurements are confirmed on the approved plan at booking.',
  },
} as const;

/* ---------- Location ------------------------------------------------------- */

export const location = {
  hero: {
    eyebrow: 'Location',
    title: 'On the corridor, not beyond it',
    /* Deliberately general: this is a site-wide page, and each project now
       carries its own location section built from its own brochure. */
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
  growth: {
    eyebrow: 'Why this corridor',
    title: 'What is driving demand here',
    items: [
      { icon: 'briefcase', title: '[EMPLOYER NAME] campus under construction, [00] km away' },
      { icon: 'route', title: '[ROAD NAME] widening to [00] lanes, sanctioned [YEAR]' },
      { icon: 'train', title: '[TRANSIT PROJECT] proposed station at [LOCATION]' },
      { icon: 'city', title: '[00]% growth in registered transactions since [YEAR]' },
    ] satisfies readonly FeatureItem[],
  },
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

export const ctaBanner = {
  title: 'Come and walk the layout',
  body: 'Site visits run seven days a week. We will send directions and have someone meet you at the gate.',
  primary: { label: 'Book a site visit', href: '/contact' },
  secondary: { label: 'View the master plan', href: '/master-plan' },
} as const;
