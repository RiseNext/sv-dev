'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { youtubeThumbnails } from '@/lib/blog';
import { cx } from '@/lib/cx';

/* =============================================================================
   YOUTUBE'S OWN THUMBNAIL — the fallback when the CMS has no `cover`.

   🔴 A PLAIN `<img>`, AND IT HAS TO BE. These files come from `i.ytimg.com`,
   which is NOT in `next.config.mjs` `images.remotePatterns` and is not being
   added — widening the image allowlist to a third-party host, for a fallback
   that only fires when an admin skipped the cover field, is a worse trade than
   losing next/image's resizing on these few cards. next/image would throw
   "hostname is not configured" and fail the build, not the card.

   So: no srcset, no AVIF, no blur placeholder. `loading="lazy"` and explicit
   dimensions are what is left to stop it costing layout shift, and the parent
   supplies the aspect ratio so the box is reserved either way.

   ─── TWO FAILURES, BECAUSE YOUTUBE HAS TWO WAYS OF NOT HAVING A PICTURE ───
   · `maxresdefault.jpg` (1280×720) EXISTS ONLY for videos uploaded at HD or
     better. For everything else it is a 404, which fires `onError`, and the
     component drops to `hqdefault.jpg` (480×360) — which exists for every
     video ever published.
   · 🔴 THE OTHER FAILURE IS A 200, AND IT IS THE COMMON ONE. For an id that
     resolves to nothing, YouTube does not 404: it answers 200 with its grey
     "no thumbnail" placeholder, a 120×90 image. Measured, not assumed — a
     request for a well-formed but unused id came back exactly that. `onError`
     can never catch it, so it is caught by WIDTH on load. 120px is a width no
     real thumbnail has, which makes it a reliable tell.

   Both failures degrade the SAME way — one step down, maxres → hq → nothing.
   The grey placeholder deliberately does NOT jump straight to nothing: a real
   video that happens to answer 200-grey for `maxres` still has a perfectly
   good `hqdefault`, and skipping it would throw away the picture we came for.

   🔴 AND THE HANDLERS ALONE ARE NOT ENOUGH — THIS IS THE BUG THAT WAS ACTUALLY
   SHIPPING. This is a client component, so its <img> is in the server-rendered
   HTML and the browser starts fetching it as that HTML streams in. A small
   image routinely FINISHES before React hydrates, and a `load` or `error` that
   fired before the handler was attached is simply never delivered — the grey
   120×90 placeholder then sits on the card forever. So the settled case is
   re-checked on mount, from the element itself, which is the only source that
   remembers what already happened. `key={step}` guarantees each step gets a
   fresh element rather than a reused one still reporting the previous src.

   When both routes fail the component renders NOTHING and lets the parent's
   own panel show through — which is why the caller layers this OVER a
   background rather than inside an empty box. An absent thumbnail then reads
   as a deliberate type-only card instead of a broken image glyph.
   ========================================================================== */

/** The width YouTube's grey placeholder is served at. Anything this narrow is
 *  not a real thumbnail. */
const PLACEHOLDER_WIDTH = 120;

type Step = 'maxres' | 'hq' | 'gone';

export function YouTubeThumb({
  videoId,
  className,
}: {
  videoId: string;
  className?: string;
}) {
  const [step, setStep] = useState<Step>('maxres');
  const ref = useRef<HTMLImageElement>(null);

  /** One step down, whatever the reason. */
  const degrade = useCallback(() => {
    setStep((current) => (current === 'maxres' ? 'hq' : 'gone'));
  }, []);

  /* The already-settled case — see the note above. `complete` is true only
     once the browser has finished with this src, and `naturalWidth === 0`
     then means it failed. Runs per step, because the replacement image can
     settle before hydration too. */
  useEffect(() => {
    const img = ref.current;
    if (!img || !img.complete) return;
    if (img.naturalWidth === 0 || img.naturalWidth <= PLACEHOLDER_WIDTH) degrade();
  }, [step, degrade]);

  if (step === 'gone') return null;

  const thumbnails = youtubeThumbnails(videoId);
  const src = step === 'maxres' ? thumbnails.maxres : thumbnails.hq;

  return (
    /* `alt=""` — DECORATIVE, DELIBERATELY. Every caller puts the post's title
       in a heading immediately beside this, so describing the picture would
       announce the same thing twice to a screen reader. There is also no
       admin-supplied alt text to use: YouTube does not publish one, and
       inventing "Thumbnail for <title>" is the duplication, not a fix for it. */
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      key={step}
      ref={ref}
      src={src}
      alt=""
      width={1280}
      height={720}
      loading="lazy"
      decoding="async"
      /* Referrer is trimmed to the origin. YouTube serves the image either
         way, and the full path of the page being read does not need to go to
         a third party. */
      referrerPolicy="origin"
      onError={degrade}
      onLoad={(event) => {
        if (event.currentTarget.naturalWidth <= PLACEHOLDER_WIDTH) degrade();
      }}
      className={cx('h-full w-full object-cover', className)}
    />
  );
}
