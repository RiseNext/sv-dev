import type { Project } from '@/types/content';

/* =============================================================================
   PROJECTS — the single source of truth.

   Cards, the /projects catalogue, every /projects/<slug> detail page, the
   homepage Featured Projects strip and the sitemap all read from this array.
   Adding an object here publishes a project. Nothing about a project is
   written down anywhere else.

   ─── SOURCING RULE ────────────────────────────────────────────────────────
   Every string below is taken from the client's project brochures. Where a
   brochure does not state something, the field is ABSENT rather than guessed,
   and the detail template drops that section. No prices, plot dimensions,
   RERA/DTCP numbers, distances, possession dates, plot counts or customer
   figures appear anywhere, because none were supplied.

   ─── ⚠️  OPEN ITEMS FOR THE CLIENT ────────────────────────────────────────
   1. IMAGES. Every `image` below points at a generated placeholder title card,
      not a photograph. The brochure assets have not been supplied yet. For
      each project, drop the real files in and swap the `src`:
        heroImage     → public/images/projects/<slug>/hero.jpg
        layoutImage   → the plot layout / master plan scan
        locationMap   → the location map scan
        gallery[]     → site, plantation and cottage photography
      `layoutImage`, `locationMap`, `gallery` and `brochureImages` are
      deliberately omitted until real files exist — those sections then appear
      on their own.

   2. BRAND NAME CONFLICT — needs a decision. `content/site.ts` names the
      company "SV Developers" and the only real asset in the repo is
      public/images/logo/sv-developers-mark.jpg. The brief and the live site
      (srrdevelopers.in) say "SRR Developers Pvt. Ltd." The two have NOT been
      silently reconciled. Every heading and SEO title renders from
      `site.name`, so correcting it is a one-line change in site.ts.

   3. SV APARTMENT is attributed to Sri Virinchi Infra Developers Pvt. Ltd. on
      its brochure — a different developer. It is kept in the catalogue but
      carries its own `developer` field, so it is attributed separately rather
      than absorbed. Delete the record if it should not appear publicly.

   4. SRI NIVASAM's brochure is described as the "SV Developers / Sri Nivasam"
      brochure, which is consistent with site.ts but not with item 2 above.
      Resolving item 2 resolves this.

   5. MISSING TRANSCRIPTIONS. Two brochure items were referred to but not
      quoted, so they are not recorded here: Sri Vanam Phase 2's plot area
      figure, and Siri Vanam's Project Highlights / Location Highlights lists.
      Send the values and they drop straight into the fields below.

   6. `status` is optional and is set on no project, because no brochure
      states one. The card badge shows the CATEGORY instead. Set `status` only
      once the client confirms live sales status per project.
   ========================================================================== */

export const projects: readonly Project[] = [
  /* ---------------------------------------------------------------------- */
  {
    slug: 'sri-city-aler-town',
    name: 'Sri City Aler Town',
    category: 'Premium Villa Plots',
    locality: 'Aler, Warangal Highway',
    tagline: 'Premium villa plots on the Warangal highway',
    summary:
      'A DTCP and RERA approved villa plot layout of 6 Acres 22.50 Guntas at Aler, laid out on 30 feet BT roads behind a grand entrance arch.',
    description: [
      'Sri City Aler Town is a premium residential villa plot layout on the Warangal highway at Aler. The brochure records a total extent of 6 Acres 22.50 Guntas.',
      'The layout is DTCP and RERA approved with clear title and spot registration, and is planned to 100% Vaasthu. Internal development covers 30 feet BT roads, paved paths, avenue plantation, underground water pipeline, underground drainage, electric poles with street lighting and a kids play area.',
    ],
    stats: [
      { label: 'Total area', value: '6 Acres 22.50 Guntas' },
      { label: 'Approval', value: 'DTCP & RERA' },
      { label: 'Roads', value: '30 ft BT' },
      { label: 'Vaasthu', value: '100%' },
    ],
    area: '6 Acres 22.50 Guntas',
    roadDetails: '30 feet BT roads',
    highlights: [
      { icon: 'city', title: 'Premium residential villa plots' },
      { icon: 'compass', title: '100% Vaasthu' },
      { icon: 'wall', title: 'Grand entrance arch' },
      { icon: 'road', title: '30 feet BT roads' },
    ],
    approvals: [
      { icon: 'shield', title: 'DTCP & RERA approved layout' },
      { icon: 'document', title: 'Clear title' },
      { icon: 'key', title: 'Spot registration' },
    ],
    amenities: [
      { icon: 'tree', title: 'Avenue plantation' },
      { icon: 'route', title: 'Paved paths' },
      { icon: 'droplet', title: 'Underground pipeline for water' },
      { icon: 'drain', title: 'Underground drainage' },
      { icon: 'lamp', title: 'Electric poles with street lights' },
      { icon: 'school', title: 'Kids play area' },
    ],
    /* Named on the brochure's location map. No distance is printed alongside
       them, so none is stated here. */
    locationHighlights: [
      { icon: 'temple', title: 'Yadagirigutta' },
      { icon: 'city', title: 'Bhuvanagiri' },
      { icon: 'city', title: 'Ghatkesar' },
      { icon: 'route', title: 'Outer Ring Road' },
      { icon: 'temple', title: 'Kessara Temple' },
      { icon: 'city', title: 'Warangal' },
      { icon: 'city', title: 'Jangoan' },
      { icon: 'school', title: 'Educational institutions nearby' },
      { icon: 'city', title: 'Established residential projects nearby' },
      { icon: 'briefcase', title: 'On the growth corridor' },
    ],
    image: {
      src: '/images/projects/sri-city-aler-town.svg',
      alt: 'Sri City Aler Town — premium villa plots at Aler on the Warangal highway.',
      width: 1200,
      height: 800,
    },
    featured: true,
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: 'sri-vanam-phase-2',
    name: 'Sri Vanam Phase 2',
    category: 'Farm Villa Plots',
    locality: 'Aler',
    tagline: 'Farm villa plots with red sandalwood plantation',
    summary:
      'Phase 2 of the Sri Vanam farm villa plot development at Aler, planted with red sandalwood on drip irrigation and maintained for 12 years.',
    description: [
      'Sri Vanam Phase 2 is a farm villa plot development at Aler. Each plot forms part of a red sandalwood plantation served by drip irrigation, within a pollution free zone.',
      'The layout carries clear title and spot registration, is planned to 100% Vaastu, and is enclosed by a precast compound wall with 24/7 security and 30 ft wide roads. The developer maintains the plantation for 12 years.',
    ],
    stats: [
      { label: 'Phase', value: 'Phase 2' },
      { label: 'Roads', value: '30 ft wide' },
      { label: 'Maintenance', value: '12 years' },
      { label: 'Security', value: '24/7' },
    ],
    roadDetails: '30 ft wide roads',
    highlights: [
      { icon: 'tree', title: 'Red sandalwood plantation' },
      { icon: 'droplet', title: 'Drip irrigation' },
      { icon: 'compass', title: '100% Vaastu' },
      { icon: 'check', title: '12 years maintenance' },
    ],
    approvals: [
      { icon: 'document', title: 'Clear title' },
      { icon: 'key', title: 'Spot registration' },
    ],
    amenities: [
      { icon: 'shield', title: '24/7 security' },
      { icon: 'road', title: '30 ft wide roads' },
      { icon: 'wall', title: 'Entire layout with precast compound' },
      { icon: 'school', title: 'Children play area' },
      { icon: 'tree', title: 'Pollution free zone' },
    ],
    /* The brochure prints distances against these. They are NOT reproduced
       here because the figures were not supplied — add them to `proximity`
       rather than guessing. */
    locationHighlights: [
      { icon: 'train', title: 'Alair Railway Station' },
      { icon: 'city', title: 'Alair City' },
      { icon: 'route', title: 'Warangal Highway' },
      { icon: 'temple', title: 'Kolanupaka Jain Temple' },
      { icon: 'temple', title: 'Yadadri Temple' },
      { icon: 'city', title: 'Bhongir Fort' },
      { icon: 'hospital', title: 'AIIMS Hospital' },
      { icon: 'route', title: 'ORR' },
      { icon: 'route', title: 'UPPA(L) X Road' },
    ],
    image: {
      src: '/images/projects/sri-vanam-phase-2.svg',
      alt: 'Sri Vanam Phase 2 — farm villa plots with red sandalwood plantation at Aler.',
      width: 1200,
      height: 800,
    },
    featured: true,
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: 'siri-vanam-gummadavelli',
    /* A SEPARATE project from Sri Vanam Phase 2 — same farm villa format,
       different brochure, different village. Do not merge the two. */
    name: 'Siri Vanam',
    category: 'Farm Villa Plots',
    locality: 'Gummadavelli, Jeedikal, Aler',
    tagline: 'Farm villa plots with mahogany and mango plantation',
    summary:
      'Farm villa plots at Gummadavelli, Jeedikal, Aler, planted with mahogany and mango trees, with cottages and spot registration.',
    description: [
      'Siri Vanam is a farm villa plot development at Gummadavelli, Jeedikal, near Aler.',
      'The brochure features the plantation of mahogany and mango trees across the layout, the cottage built on site, and spot registration.',
    ],
    highlights: [
      { icon: 'tree', title: 'Mahogany trees' },
      { icon: 'tree', title: 'Mango trees' },
      { icon: 'city', title: 'Cottage' },
      { icon: 'key', title: 'Spot registration' },
    ],
    /* The brochure carries Project Highlights and Location Highlights lists
       that have not been transcribed yet. They belong in `amenities` and
       `locationHighlights`; both sections stay hidden until then. */
    image: {
      src: '/images/projects/siri-vanam-gummadavelli.svg',
      alt: 'Siri Vanam — farm villa plots with mahogany and mango plantation at Gummadavelli, Jeedikal, Aler.',
      width: 1200,
      height: 800,
    },
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: 'sri-nivasam-swarnagiri',
    name: 'Sri Nivasam',
    category: 'Residential Plots',
    locality: 'Swarnagiri Temple, Bhongir',
    tagline: 'Hyderabad – Warangal Highway facing venture',
    summary:
      'An HMDA and RERA approved residential layout beside Swarnagiri Temple at Bhongir, facing the Hyderabad–Warangal NH 163, with bank loans available.',
    description: [
      'Sri Nivasam is a Hyderabad – Warangal Highway facing venture beside the Swarnagiri Temple at Bhongir. The layout is HMDA and RERA approved, with clear title, spot registration and 100% Vaasthu planning.',
      "Development covers 60' and 30' wide BT roads with stone kerbing and footpath, a grand entrance arch, underground drainage with septic tank, electricity with street lights, an overhead water tank with water lines, avenue plantation, a landscaping park, a children's play area and a precast compound wall around the entire layout. Bank loans are available.",
    ],
    stats: [
      { label: 'Approval', value: 'HMDA & RERA' },
      { label: 'Roads', value: "60' & 30' BT" },
      { label: 'Frontage', value: 'NH 163' },
      { label: 'Bank loan', value: 'Available' },
    ],
    roadDetails: "60' & 30' wide BT roads",
    highlights: [
      { icon: 'route', title: 'Hyderabad – Warangal Highway facing' },
      { icon: 'compass', title: '100% Vaasthu' },
      { icon: 'wall', title: 'Grand entrance arch' },
      { icon: 'bank', title: 'Bank loan available' },
    ],
    approvals: [
      { icon: 'shield', title: 'HMDA & RERA approved layout' },
      { icon: 'document', title: 'Clear title' },
      { icon: 'key', title: 'Spot registration' },
      { icon: 'bank', title: 'Bank loan available' },
    ],
    amenities: [
      { icon: 'road', title: "60' & 30' wide BT roads" },
      { icon: 'ruler', title: 'Kerbing with stone & footpath' },
      /* The brochure lists "Underground Drainage" and "Underground drainage
         with septic tank" separately; recorded once, in the fuller wording. */
      { icon: 'drain', title: 'Underground drainage with septic tank' },
      { icon: 'lamp', title: 'Electricity with street lights' },
      { icon: 'droplet', title: 'Overhead water tank with water lines' },
      { icon: 'tree', title: 'Avenue plantation' },
      { icon: 'tree', title: 'Beautiful landscaping park' },
      { icon: 'school', title: "Children's play area" },
      { icon: 'wall', title: 'Entire layout with precast compound wall' },
    ],
    locationHighlights: [
      { icon: 'route', title: 'Hyderabad–Warangal NH 163 facing venture' },
      { icon: 'temple', title: 'Beside Swarnagiri Temple' },
      { icon: 'route', title: 'Nearby Regional Ring Road (RRR)' },
      { icon: 'train', title: 'Connected by roadways and railways' },
      { icon: 'city', title: 'Bhongir Town' },
      { icon: 'hospital', title: 'AIIMS Hospital at Bibinagar' },
      { icon: 'route', title: 'Ghatkesar ORR' },
      { icon: 'temple', title: 'Surendrapuri' },
      { icon: 'temple', title: 'Yadadri Temple' },
      { icon: 'route', title: 'Uppal Ring Road' },
      { icon: 'school', title: 'Schools, colleges, hospitals and restaurants' },
    ],
    image: {
      src: '/images/projects/sri-nivasam-swarnagiri.svg',
      alt: 'Sri Nivasam — residential plots beside Swarnagiri Temple, Bhongir, facing the Hyderabad–Warangal highway.',
      width: 1200,
      height: 800,
    },
    featured: true,
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: 'sv-apartment-genome-valley',
    name: 'SV Apartment',
    category: 'Apartments',
    locality: 'Genome Valley, near Shamirpet, Hyderabad',
    /* Attributed to a different company on its brochure. See open item 3 in
       the header — this is why it is not folded in with the others. */
    developer: 'Sri Virinchi Infra Developers Pvt. Ltd.',
    tagline: '2 BHK deluxe flats at Genome Valley',
    summary:
      'An HMDA approved apartment of 2 BHK deluxe flats at Genome Valley near Shamirpet, with four-side roads, full ventilation and 24 hour security.',
    description: [
      'SV Apartment is an HMDA approved apartment project at Genome Valley, near Shamirpet, Hyderabad, developed by Sri Virinchi Infra Developers Pvt. Ltd.',
      'The building offers 2 BHK deluxe flats, planned 100% Vaastu compliant, with roads on four sides and full ventilation, 24 hour security with CCTV surveillance, and clear title with spot registration. The brochure notes high demand for rentals in the area.',
    ],
    stats: [
      { label: 'Configuration', value: '2 BHK deluxe' },
      { label: 'Approval', value: 'HMDA' },
      { label: 'Vaastu', value: '100%' },
      { label: 'Security', value: '24 hrs + CCTV' },
    ],
    highlights: [
      { icon: 'city', title: '2 BHK deluxe flats' },
      { icon: 'compass', title: '100% Vaastu compliant' },
      { icon: 'road', title: '4-side roads & full ventilation' },
      { icon: 'briefcase', title: 'High demand for rentals' },
    ],
    approvals: [
      { icon: 'shield', title: 'HMDA approved apartment' },
      { icon: 'document', title: 'Clear title' },
      { icon: 'key', title: 'Spot registration' },
    ],
    amenities: [{ icon: 'shield', title: '24 hrs security & CCTV surveillance' }],
    image: {
      src: '/images/projects/sv-apartment-genome-valley.svg',
      alt: 'SV Apartment — 2 BHK deluxe flats at Genome Valley near Shamirpet, Hyderabad.',
      width: 1200,
      height: 800,
    },
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

/** Catalogue order for the category filter. Only categories that at least one
 *  project actually carries are rendered — a category is never shown empty. */
export const categoryOrder = [
  'Premium Villa Plots',
  'Farm Villa Plots',
  'Residential Plots',
  'Apartments',
] as const;

/** Categories present in the data, in catalogue order. */
export function usedCategories() {
  return categoryOrder.filter((category) =>
    projects.some((project) => project.category === category),
  );
}

/** Homepage strip. Falls back to the first three if nothing is flagged. */
export const featuredProjects = projects.filter((project) => project.featured).length
  ? projects.filter((project) => project.featured)
  : projects.slice(0, 3);
