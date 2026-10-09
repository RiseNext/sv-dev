import 'server-only';
import type { BlogPost, BlogPostCard } from '@/types/blog';

/* =============================================================================
   🔶 TEMPORARY — DELETE THIS FILE WHEN THE BACKEND SHIPS `/blog-posts`.

   The blog's real source is the CMS. That endpoint does not exist yet, so with
   `fallback: []` in the data layer there is no way to SEE the blog design at
   all — /blog would render its empty state and nothing could be judged. This
   file hands the page a handful of records in the CMS's exact shape, purely so
   the layout, the card states and the article page can be reviewed while the
   backend work is outstanding.

   🔴 DEVELOPMENT ONLY, AND THAT GUARD IS THE POINT. Returning `[]` outside
   development makes it IMPOSSIBLE for this placeholder copy to appear on the
   live site, rather than merely unlikely — which matters more here than it did
   for the hero's test clips, because this is written prose that would read as
   genuine published articles.

   ⚠️ WHAT THE COPY DELIBERATELY DOES NOT DO. Not one line here claims an
   approval, a price, a return, a timeline or a completed sale. The site's
   honesty rule applies to placeholder text too — dev-only or not, invented
   marketing claims are the one kind of filler that is dangerous to leave lying
   around in a repository, because the next person to read it cannot tell it
   was invented.

   The five records cover every state the design has to hold, which is the
   other reason they are hand-written rather than random:

     1. article, with a cover        — the feature card at the top
     2. video, with a cover          — the normal video card
     3. video, NO cover              — the i.ytimg.com fallback path
     4. article, NO cover            — the type-only card
     5. external link                — the card that leaves the site

   REMOVAL, when the endpoint lands: delete this file and the two
   `?? preview…` fallbacks — one in `src/app/blog/page.tsx`, one in
   `src/app/blog/[slug]/page.tsx`. Three edits, and the CMS wins automatically
   before any of them, because a non-empty API response takes precedence.
   ========================================================================== */

/* The existing placeholder title cards in `public/images/projects`. Local
   files, so they need no `remotePatterns` entry and cost nothing to serve —
   and when real photography arrives none of this exists any more anyway.
   The dimensions are the box next/image reserves, not a measurement. */
const PLACEHOLDER = { width: 1600, height: 1000 } as const;

const POSTS: readonly BlogPost[] = [
  {
    slug: 'what-to-check-before-you-buy-a-plot',
    title: 'What to check before you buy a plot',
    excerpt:
      'The paperwork a buyer can verify without help from anyone selling to them — and the order to do it in.',
    publishedAt: '2026-09-28',
    topic: 'Buying guide',
    author: 'SV Developers',
    cover: {
      src: '/images/projects/sri-city-aler-town.svg',
      alt: 'Placeholder title card for Sri City Aler Town',
      ...PLACEHOLDER,
    },
    body: [
      'Most of what decides whether a plot is a good purchase is written down somewhere a buyer can read for themselves. The difficulty is not access. It is knowing which document answers which question, and in what order to ask.',
      'Start with the title. Ask who owned the land before the present owner, and for how long. A chain that goes back two or three owners over several decades is a different proposition from one that changed hands twice in the last year.',
      'Then the layout approval. An approved layout has a number, and that number can be checked against the sanctioning authority rather than against a brochure. Ask for the number, not for a photograph of a plan.',
      'Last, walk the site. A plot that exists on paper and a plot with a road to it are not the same asset, and the difference is visible in ten minutes on the ground.',
    ],
  },
  {
    slug: 'walking-the-roads-at-siri-vanam',
    title: 'Walking the roads at Siri Vanam',
    excerpt:
      'A slow walk down the internal roads, from the entrance arch to the far boundary, with nothing cut out.',
    publishedAt: '2026-09-14',
    topic: 'Site update',
    /* A well-formed watch URL. The id is deliberately not a real video, but
       nothing ever asks YouTube about it: this record HAS a cover, so the
       cover wins and the thumbnail is never requested. That is the normal
       video card — and the state the backend should aim for on every one. */
    video: { youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcZ', duration: '8:12' },
    cover: {
      src: '/images/projects/siri-vanam-gummadavelli.svg',
      alt: 'Placeholder title card for Siri Vanam',
      ...PLACEHOLDER,
    },
    body: [
      'Filmed on a weekday morning in September, in one take, at walking pace. The camera starts at the entrance and ends at the far boundary.',
    ],
  },
  {
    slug: 'how-spot-registration-works',
    title: 'How spot registration actually works',
    excerpt:
      'What happens on the day, who has to be present, and which documents are signed in which order.',
    publishedAt: '2026-08-30',
    topic: 'Buying guide',
    /* NO COVER, and an id that is well-formed but resolves to nothing. This is
       the record that walks the whole i.ytimg.com fallback chain —
       maxresdefault 404s, hqdefault 404s, the <img> unmounts — and leaves the
       sand panel with the play glyph on it. That is the state an admin
       produces by pasting a link and skipping the cover field, so it is the
       one worth being able to look at. */
    video: { youtubeUrl: 'https://youtu.be/zzzzzzzzzzz' },
    body: [
      'Registration is a short appointment that people arrive at underprepared, and the delay is almost always a missing document rather than anything to do with the land.',
      'This walks through the sequence as it happens at the sub-registrar office, and what to bring so the appointment takes an hour instead of a morning.',
    ],
  },
  {
    slug: 'red-sandalwood-in-year-one',
    title: 'Red sandalwood in the first year',
    excerpt:
      'What a newly planted sapling needs through its first summer, and what it does not need at all.',
    publishedAt: '2026-08-11',
    topic: 'Plantation',
    author: 'SV Developers',
    body: [
      'A red sandalwood sapling spends its first year putting down root rather than putting up height, which is why a plantation can look static for twelve months and then move quickly.',
      'Water matters most through the first summer. After that the tree is largely self-sufficient on this soil, and the common mistake is continuing to treat a three-year-old tree like a sapling.',
      'Nothing here is a yield projection. How a stand performs over a decade depends on soil, spacing and rainfall that vary plot to plot.',
    ],
  },
  {
    slug: 'where-to-check-a-rera-registration',
    title: 'Where to check a RERA registration yourself',
    excerpt:
      'The Telangana RERA portal lets anyone look up a registration number directly. It takes about a minute.',
    publishedAt: '2026-07-22',
    topic: 'Buying guide',
    /* A real, public, relevant destination rather than an invented one: the
       state portal a buyer would actually be sent to. Nothing about this card
       claims a registration of our own — it is a how-to. */
    externalUrl: 'https://rera.telangana.gov.in/',
  },
];

/** The index's source in development. Cards only — same subset the list
 *  endpoint will return, so the preview cannot accidentally rely on a field
 *  the real list does not carry. */
export function previewBlogPosts(): readonly BlogPostCard[] {
  if (process.env.NODE_ENV !== 'development') return [];

  return POSTS.map(({ slug, title, excerpt, publishedAt, topic, author, cover, video, externalUrl }) => ({
    slug,
    title,
    excerpt,
    publishedAt,
    topic,
    author,
    cover,
    video,
    externalUrl,
  }));
}

/** One preview post, for `/blog/[slug]` in development. Returns `null` outside
 *  development, so the route's `notFound()` behaves exactly as it will in
 *  production. */
export function previewBlogPost(slug: string): BlogPost | null {
  if (process.env.NODE_ENV !== 'development') return null;
  return POSTS.find((post) => post.slug === slug) ?? null;
}
