/* =============================================================================
   THE FIXTURE CMS — the public API shapes, frozen.

   🔴 WHY THIS EXISTS RATHER THAN POINTING THE TESTS AT PRODUCTION. Two reasons,
   and the first one is not negotiable:

     1. THE TESTS MUST NOT DEPEND ON PRODUCTION CMS CONTENT, and they must never
        WRITE to it. The brief is explicit: no production test enquiries, no
        altered CMS records. A read-only suite against live data would still be
        a suite that turns red the moment an administrator edits a post.

     2. PRODUCTION CANNOT EXPRESS THE CASES UNDER TEST. Checked against
        `/api/v1` on 13 Oct 2026, the live CMS returns ONE hero video and no
        `heroMedia` at all — so a four-slide mixed image/video hero, a text-only
        article and a post whose video URL will not parse are all unreachable
        there. Those are precisely the behaviours this change is about.

   ─── EVERY ROW HERE IS EITHER REAL OR OBVIOUSLY SYNTHETIC ─────────────────
   ⚠️ NO FABRICATED BUSINESS CONTENT. The site settings, the testimonials and
   the two real posts are COPIED VERBATIM from the live API, including their
   typos and trailing spaces, so the fixtures exercise the real shapes. The
   extra blog rows added for coverage are named `fixture-*` and say in their own
   body that they are test fixtures — they could not be mistaken for copy, and
   they never reach a browser outside this suite.

   The media URLs are the real Cloudinary assets. They are public, immutable
   delivery URLs and the suite only ever GETs them, which is what makes the
   image and video slides actually load rather than 404 into the error state.
   ========================================================================== */

/* The real Cloudinary assets, named so the fixtures below read as intent
   rather than as a wall of UUIDs. */
const IMG_LAYOUT =
  'https://res.cloudinary.com/lcjjdvym/image/upload/media/81f5f283-1b9c-4b29-9f18-8e74a98f3bf9.png';
const IMG_SQUARE =
  'https://res.cloudinary.com/lcjjdvym/image/upload/media/ffb7c61c-5714-42fc-b9c2-ddf423a35180.jpg';
const VIDEO_MP4 =
  'https://res.cloudinary.com/lcjjdvym/video/upload/videos/61b5336b-b4df-4f32-81fa-adcf63f158da.mp4';
const VIDEO_POSTER =
  'https://res.cloudinary.com/lcjjdvym/image/upload/media/2e1304c5-b0e1-4512-b8ec-92ad1643a4dc.jpg';

/* 🔴 EXACTLY THE SEQUENCE FROM THE BRIEF — image, video, image, video — so the
   hero test is asserting the documented example rather than a shape invented to
   make the assertions easy. `kind` is a stored discriminant, never derived; see
   `src/types/heroMedia.ts`. */
export const HERO_MEDIA = [
  { kind: 'image', src: IMG_LAYOUT, alt: 'Sri Vanam layout plan', width: 851, height: 915, title: 'Layout plan' },
  { kind: 'video', src: VIDEO_MP4, poster: VIDEO_POSTER, title: 'Site walkthrough' },
  { kind: 'image', src: IMG_SQUARE, alt: 'Project elevation', width: 1080, height: 1080, title: 'Elevation' },
  { kind: 'video', src: VIDEO_MP4, poster: VIDEO_POSTER, title: 'Drone pass' },
];

/* Verbatim from the live `/site-settings`, plus `heroMedia`. `whatsapp` is the
   real number and the pill's WhatsApp branch is asserted on the HREF it builds
   — the suite never opens it, so no message is ever sent. */
export const SITE_SETTINGS = {
  name: 'SV Developers',
  legalName: 'SV Developers',
  url: 'https://sv-dev-phi.vercel.app',
  email: 'svdevelopersofficial@gmail.com',
  phone: '7799774169',
  whatsapp: '7799774169',
  address: [
    'Savvys Tulip Cheruku Plaza, 4th Floor, New Samathapuri Colony, Nagole Junction, Kothapet, Hyderabad - 500035',
  ],
  copyrightText: '© 2026 SV Developers. All rights reserved.',
  mapUrl: 'https://maps.app.goo.gl/w3D22nXkWyivwBdr8',
  officeHours: '9:30 to 6:30',
  heroVideos: [{ src: VIDEO_MP4, poster: VIDEO_POSTER, title: 'heropage' }],
  heroMedia: HERO_MEDIA,
};

/* THE FIVE BLOG CASES THE BRIEF NAMES, one row each.

   The first two are the live posts, copied exactly — note that BOTH carry a
   video and one carries an `externalUrl`, which is the production state that
   produced the reported bug. The last three are the cases production does not
   currently contain. */
export const BLOG_POSTS = [
  {
    slug: 'tes',
    title: 'test2 ',
    excerpt:
      "Hey Listen, So I want you to make changes in frontend don't alter the codebase of backend. \nFirst feature I want you to make a feature where hero page can have both images and video but need to",
    publishedAt: '2026-10-13T11:30:00.000Z',
    cover: { src: IMG_LAYOUT, alt: 'sri_vanam_layout', width: 851, height: 915 },
    video: { youtubeUrl: 'https://www.youtube.com/shorts/679G8cwqqXk' },
    externalUrl: 'https://www.geeksforgeeks.org/dsa/introduction-of-object-oriented-programming/',
    body: ['A fixture body on an EXTERNAL post. Before this change it was never rendered.'],
  },
  {
    slug: 't1',
    title: 'test ',
    excerpt: 'Testing ',
    publishedAt: '2026-10-13T11:30:00.000Z',
    cover: { src: IMG_SQUARE, alt: 'test', width: 1080, height: 1080 },
    video: { youtubeUrl: 'https://www.youtube.com/watch?v=SYyvx6GE2UI&list=RDSYyvx6GE2UI&start_radio=1' },
    body: ['A fixture body on a video post.'],
  },
  {
    /* TEXT ONLY — no cover, no video. Must render NO play button and NO media
       box at all. */
    slug: 'fixture-text-only',
    title: 'Fixture: a text-only article',
    excerpt: 'A test fixture with no cover image and no video. It must not show a play button.',
    publishedAt: '2026-10-10T00:00:00.000Z',
    topic: 'Fixture',
    body: [
      'This is an automated test fixture, not published content.',
      'It exists to prove that an article with no video renders no play control.',
    ],
  },
  {
    /* IMAGE ONLY — a cover and nothing else. Must render the cover and NO play
       button. This is the case a "has a thumbnail => show play" inference would
       get wrong, which is why the brief calls it out separately. */
    slug: 'fixture-image-only',
    title: 'Fixture: an image-only article',
    excerpt: 'A test fixture with a cover image but no video. It must not show a play button.',
    publishedAt: '2026-10-09T00:00:00.000Z',
    topic: 'Fixture',
    cover: { src: IMG_SQUARE, alt: 'Fixture cover', width: 1080, height: 1080 },
    body: ['This is an automated test fixture, not published content.'],
  },
  {
    /* 🔴 THE REGRESSION ROW. A `video` object whose URL is not a YouTube link —
       the half-filled record that produced a play button promising a player the
       detail page would then decline to mount. `duration` is set too, so the
       badge's gate is covered by the same row. */
    slug: 'fixture-unplayable-video',
    title: 'Fixture: an unplayable video URL',
    excerpt: 'A test fixture whose video URL cannot be parsed. It must not show a play button.',
    publishedAt: '2026-10-08T00:00:00.000Z',
    topic: 'Fixture',
    cover: { src: IMG_LAYOUT, alt: 'Fixture cover', width: 851, height: 915 },
    video: { youtubeUrl: 'https://www.linkedin.com/feed/update/not-a-youtube-link', duration: '4:20' },
    body: ['This is an automated test fixture, not published content.'],
  },
];

/* Verbatim from the live `/testimonials` — two consented, published rows.
   ⚠️ NO INVENTED REVIEW TEXT. These are the real ones or there are none. */
export const TESTIMONIALS = [
  {
    id: '9c330ea4-d9ef-4326-9a55-9549b5ef67ce',
    name: 'Test',
    body: 'Testing purpose ',
    role: 'Sri City Alear Town ',
    rating: 5,
  },
  {
    id: '435c83fa-dc09-4c73-8b2f-afb664e1e256',
    name: 'rajesh',
    body: 'As an investor, I rely on SRR Developers for my real estate ventures. Top 1 Real Estate Company,Their\ndeep market insights and clear understanding of land acquisition and property development have made\nevery investment successful. Highly recommended for long-term real estate investments!"\n',
    role: 'investor',
  },
];
