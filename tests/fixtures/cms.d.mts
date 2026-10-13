/* =============================================================================
   TYPES FOR THE FIXTURE CMS.

   🔴 WHY THE FIXTURES ARE `.mjs` WITH A `.d.mts` BESIDE THEM, rather than a
   plain `.ts` file. `tests/server.mjs` is run by NODE DIRECTLY — it is
   Playwright's `webServer` command, and it starts before anything has been
   compiled — so the module it imports has to be real JavaScript. Meanwhile
   `tsconfig.json` sets `allowJs: false`, so the specs importing that same
   module need declarations or `npm run typecheck` fails.

   The alternative, duplicating the fixtures into a `.ts` copy for the specs, is
   how the two quietly stop agreeing. One source of data, one file of types.

   These mirror the PUBLIC API contract in `src/types/` — deliberately as
   structural shapes rather than by importing those types, because the fixtures
   are allowed to be a SUBSET (the list endpoint omits `body`) and importing the
   real types would force the fixture file to satisfy fields the API does not
   send on every route.
   ========================================================================== */

export type FixtureHeroItem =
  | { kind: 'image'; src: string; alt: string; width: number; height: number; title?: string }
  | { kind: 'video'; src: string; poster?: string; title?: string }
  | { kind: 'youtube'; youtubeUrl: string; poster: string; title?: string };

export type FixtureImage = { src: string; alt: string; width: number; height: number };

export type FixturePost = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  topic?: string;
  author?: string;
  cover?: FixtureImage;
  video?: { youtubeUrl: string; duration?: string };
  externalUrl?: string;
  body?: string[];
};

export type FixtureTestimonial = {
  id: string;
  name: string;
  body: string;
  role: string;
  rating?: number;
};

export type FixtureSiteSettings = {
  name: string;
  legalName: string;
  url: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string[];
  copyrightText: string;
  mapUrl?: string;
  officeHours?: string;
  heroVideos?: { src: string; poster?: string; title?: string }[];
  heroMedia?: FixtureHeroItem[];
};

export declare const HERO_MEDIA: FixtureHeroItem[];
export declare const SITE_SETTINGS: FixtureSiteSettings;
export declare const BLOG_POSTS: FixturePost[];
export declare const TESTIMONIALS: FixtureTestimonial[];
