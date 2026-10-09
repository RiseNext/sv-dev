import type { BlogPostCard, BlogPostKind } from '@/types/blog';

/* =============================================================================
   BLOG HELPERS — pure, and deliberately NOT `server-only`.

   The index's filter pills and the video player are client components, so
   everything here has to run in both places. Nothing in this file touches the
   network, the filesystem or `process.env`.
   ========================================================================== */

/* YouTube ids are 11 characters of URL-safe base64. Anchored, because this
   same pattern is used to VALIDATE an extracted segment — unanchored it would
   happily match the first 11 characters of anything longer. */
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

/* 🔴 AN EXACT SET, NOT `endsWith('youtube.com')`. A suffix test also matches
   `notyoutube.com`, and the whole job of this function is deciding whether an
   admin-supplied string is a YouTube link. The id it returns is interpolated
   into an embed URL, so the one thing that must not happen is lifting an
   "id" out of a host nobody vetted. */
const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtube-nocookie.com',
]);

/* The path prefixes that carry the id as the NEXT segment. `/v/` is the old
   flash-era form and costs one array entry to keep working. */
const ID_PATH_PREFIXES = new Set(['shorts', 'embed', 'live', 'v']);

/**
 * The video id inside whatever the admin pasted, or `null`.
 *
 * Accepts every form a share button produces — `watch?v=`, `youtu.be/`,
 * `/shorts/`, `/embed/`, `/live/`, with or without `&t=`, `?si=` and the rest
 * of the tracking tail. A bare id is accepted too, since someone will
 * eventually paste one.
 *
 * 🔴 RETURNS `null` RATHER THAN THROWING OR GUESSING. An unparseable value
 * means the card degrades to a plain outbound link to whatever was pasted,
 * which is a visible, fixable mistake. A guessed id would render an embed of
 * the wrong video — or of nothing — and look like a frontend bug.
 */
export function youtubeId(input: string | undefined): string | null {
  if (typeof input !== 'string') return null;
  const raw = input.trim();
  if (!raw) return null;
  if (YOUTUBE_ID.test(raw)) return raw;

  let url: URL;
  try {
    /* A pasted `youtu.be/abc` with no scheme is common enough to handle, and
       `new URL` rejects it outright. */
    url = new URL(/^[a-z]+:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, '').toLowerCase();

  /* youtu.be puts the id in the first path segment and nothing else. */
  if (host === 'youtu.be') {
    const id = url.pathname.split('/').filter(Boolean)[0];
    return id && YOUTUBE_ID.test(id) ? id : null;
  }

  if (!YOUTUBE_HOSTS.has(host)) return null;

  const v = url.searchParams.get('v');
  if (v && YOUTUBE_ID.test(v)) return v;

  const [prefix, id] = url.pathname.split('/').filter(Boolean);
  if (prefix && id && ID_PATH_PREFIXES.has(prefix) && YOUTUBE_ID.test(id)) return id;

  return null;
}

/** The canonical watch page, for the "Watch on YouTube" link. Rebuilt from the
 *  id rather than passing the pasted URL through, so a tracking tail on the
 *  admin's clipboard does not end up in our markup. */
export function youtubeWatchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

/**
 * The privacy-preserving embed, loaded ONLY after a click — see
 * `VideoPlayer.tsx`.
 *
 * `youtube-nocookie.com` sets no tracking cookie until playback begins, and
 * `autoplay=1` is correct here precisely BECAUSE the iframe is mounted by a
 * click: the gesture that started it is the visitor's, so nothing autoplays at
 * a visitor who did not ask. `rel=0` keeps the end-screen suggestions within
 * the same channel instead of sending them to a competitor's plot listing.
 */
export function youtubeEmbedUrl(id: string): string {
  const params = new URLSearchParams({
    autoplay: '1',
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

/**
 * YouTube's own thumbnail, in the two sizes worth asking for.
 *
 * 🔴 THESE ARE SERVED FROM `i.ytimg.com`, WHICH IS NOT IN `next.config.mjs`
 * `images.remotePatterns` — AND IS NOT BEING ADDED. Anything rendering one of
 * these MUST use a plain `<img>`, never next/image, or the build throws
 * "hostname is not configured". That is a deliberate trade: the alternative is
 * widening the image allowlist to a third-party host for a fallback that only
 * fires when the CMS has no `cover`.
 *
 * `maxres` (1280×720) exists only for videos uploaded at HD or better;
 * `hq` (480×360) exists for every video ever published. So the caller starts
 * at `maxres` and swaps to `hq` on error — see `YouTubeThumb.tsx`.
 */
export function youtubeThumbnails(id: string): { maxres: string; hq: string } {
  return {
    maxres: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
    hq: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
  };
}

/** Derived from the record, never read from a field — so the badge on the card
 *  and the player on the page cannot disagree about what a post is. */
export function postKind(post: Pick<BlogPostCard, 'video'>): BlogPostKind {
  return post.video ? 'video' : 'article';
}

/**
 * Where a card goes. `externalUrl` is the whole rule — see the note on that
 * field in `types/blog.ts`.
 *
 * A bracketed placeholder is returned AS-IS on purpose: every caller renders
 * an outbound destination through `anchorProps()`, which makes `[SOME_URL]`
 * inert and visibly struck through. Resolving it to the internal page here
 * would hide an unfinished record instead of showing it.
 */
export function postHref(post: Pick<BlogPostCard, 'slug' | 'externalUrl'>): string {
  const external = post.externalUrl?.trim();
  return external ? external : `/blog/${post.slug}`;
}

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

/**
 * The mono date badge, and the machine-readable value beside it.
 *
 * 🔴 FORMATTED BY HAND RATHER THAN WITH `toLocaleDateString`, and that is not
 * a preference. The index is a client component, so this runs once on the
 * server during SSR and again in the browser during hydration — and Node's
 * bundled ICU and the browser's do not always produce the same string for the
 * same locale, which React reports as a hydration mismatch. Twelve short month
 * names cannot drift.
 *
 * `Date.UTC` reading, not local-time reading: a bare `2026-10-08` is parsed as
 * UTC midnight, and a server an hour behind the visitor would otherwise print
 * the 7th.
 *
 * Returns `null` for anything unparseable, and every caller then drops the
 * badge. An invalid date is a CMS mistake worth noticing, not worth rendering
 * as "NaN NaN".
 */
export function formatPostDate(publishedAt: string | undefined): { label: string; iso: string } | null {
  if (typeof publishedAt !== 'string' || !publishedAt.trim()) return null;

  const date = new Date(publishedAt);
  if (Number.isNaN(date.getTime())) return null;

  const month = MONTHS[date.getUTCMonth()];
  if (!month) return null;

  return {
    label: `${date.getUTCDate()} ${month} ${date.getUTCFullYear()}`,
    /* The date half of the ISO string — `<time dateTime>` accepts a plain
       date, and the time of day is not something a post's badge claims. */
    iso: date.toISOString().slice(0, 10),
  };
}
