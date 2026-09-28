'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cx } from '@/lib/cx';
import type { VideoRef } from '@/types/content';

/* =============================================================================
   HERO VIDEO STAGE — the bordered pane the hero type sits on.

   ONE COMPONENT, TWO LAYOUTS, chosen by how many videos the CMS returns:
     · exactly one  → a still pane. No controls are rendered at all, because a
                      carousel with one slide is furniture that does nothing.
     · more than one → the same pane, plus a crossfade and a control cluster.
   The frame, the wash and the type treatment are IDENTICAL across both, so
   adding a second video changes what moves, never how the hero looks.

   ─── NOTHING IS LAID OVER THE FOOTAGE ─────────────────────────────────────
   🔶 REMOVED ON REQUEST, 28 Sep 2026: this carried a dark vertical gradient
   over the video — a scrim — to hold the white headline up. It is gone, and
   with it the last thing standing between the visitor and the footage. The
   video now plays at full brightness and full clarity: no tint, no blur.

   THE TYPE IS STILL WHITE, and its legibility now comes from a TEXT SHADOW set
   in Hero.tsx. That is the important distinction: a shadow darkens the handful
   of pixels behind the letterforms, where a scrim darkened the entire frame.
   If a pale clip ever makes the headline hard to read, deepen that shadow —
   the tint is not coming back.

   ─── THE PANE OPENS FULL SCREEN ───────────────────────────────────────────
   Its width, height, border and radius are NOT set here. They are interpolated
   in globals.css from `--hero-p`, which the effect below writes onto the
   section as you scroll: 0 covering the whole screen, 1 settled into the
   bordered pane. What stays here is everything that does not change between
   those two states — the footage, the type, the controls, the padding.

   ─── HEIGHT IS CONTENT-DRIVEN, NOT ASPECT-DRIVEN ──────────────────────────
   No `aspect-[16/9]` on the frame, in either state. An aspect ratio fixes the
   height from the WIDTH, so on a narrow phone the pane becomes short exactly
   as the headline wraps to four lines, and the type either overflows or has to
   shrink. Padding plus a `min-height` FLOOR lets the pane grow to whatever the
   type needs at every width, which is what makes this survive translation, a
   longer headline, or a 320px screen. The video fills whatever height results
   via `object-cover`.
   ========================================================================== */

/** Long enough to read the headline and watch a few seconds of footage. */
const ADVANCE_MS = 7000;

/* The frame. A two-layer lift, same family as the nav's glass: a tight contact
   shadow and a wide deep ambient. The hairline that went with it is in
   globals.css, because it has to fade in as the pane settles — at full bleed a
   white hairline is a seam along the edge of the screen. */
const FRAME_SHADOW =
  'shadow-[0_2px_6px_rgba(43,34,23,0.06),0_24px_60px_-24px_rgba(43,34,23,0.28)]';

/* How much of the pin's travel the shrink uses, leaving the rest as a settled
   hold before the section releases. Derived from the section's own height, so
   `--hero-run` in globals.css stays the single place the distance is set. */
const SETTLE_AT = 0.7;

export function HeroVideoStage({
  videos,
  children,
}: {
  videos: readonly VideoRef[];
  children: ReactNode;
}) {
  /* Returns false on the server and for the first paint, then syncs. That
     default is the safe one here: auto-advance is started from an effect, so it
     can never fire before the query has resolved. */
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const multi = videos.length > 1;
  const [index, setIndex] = useState(0);
  /* Set by the user via the control, and separately by hover/focus. Kept apart
     so moving the pointer away does not silently undo an explicit pause. */
  const [userPaused, setUserPaused] = useState(false);
  const [hoverPaused, setHoverPaused] = useState(false);

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const paneRef = useRef<HTMLDivElement>(null);

  const advancing = multi && !reduceMotion && !userPaused && !hoverPaused;

  /* THE SCROLL-SHRINK. Writes `--hero-p` onto the SECTION, not onto the pane:
     the sticky wrapper's gutter and nav clearance are interpolated from the
     same number, and a custom property set on the section inherits down to
     both. See globals.css for the geometry it drives.

     Nothing here is React state. A `setState` per scroll frame would re-render
     the whole stage — videos, controls and all — sixty times a second to move
     one number; writing the property straight onto the node moves it without
     React in the loop at all. */
  useEffect(() => {
    const section = paneRef.current?.closest<HTMLElement>('[data-hero-scroll]');
    if (!section) return;
    /* Reduced motion keeps the settled pane, which globals.css already sets.
       Bailing out before the first write is what leaves it in charge — an
       inline property here would beat the media query. */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      /* The pin's travel: everything the section is taller than one screen. */
      const travel = section.offsetHeight - window.innerHeight;
      if (travel <= 0) {
        section.style.setProperty('--hero-p', '1');
        return;
      }
      const scrolled = Math.min(Math.max(-section.getBoundingClientRect().top, 0), travel);
      const progress = Math.min(scrolled / (travel * SETTLE_AT), 1);
      section.style.setProperty('--hero-p', progress.toFixed(4));
    };

    /* Coalesced to one write per frame: scroll fires far more often than the
       screen refreshes, and Lenis drives it from its own rAF loop. */
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      section.style.removeProperty('--hero-p');
    };
  }, []);

  /* ONLY THE VISIBLE VIDEO PLAYS. Leaving all of them running decodes N video
     streams for one visible pane — the single most expensive thing a hero can
     do on a phone — and it is invisible while it happens, so nothing about the
     page suggests why scrolling has gone rough. */
  useEffect(() => {
    videoRefs.current.forEach((el, i) => {
      if (!el) return;

      if (i !== index) {
        el.pause();
        /* Rewound so a returning slide starts from its opening frame rather
           than resuming mid-shot, which reads as a glitch on a loop. */
        el.currentTime = 0;
        return;
      }

      if (reduceMotion) {
        el.pause();
        return;
      }

      /* `play()` REJECTS rather than throws — a browser is entitled to refuse
         autoplay, and on iOS Low Power Mode it always does. Swallowing it is
         correct: the poster frame stays up and the hero is still complete. An
         unhandled rejection here would surface as a console error on a page
         that is working as designed. */
      void el.play().catch(() => {});
    });
  }, [index, reduceMotion, videos.length]);

  useEffect(() => {
    if (!advancing) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % videos.length);
    }, ADVANCE_MS);
    return () => clearInterval(timer);
  }, [advancing, videos.length]);

  const label = useCallback(
    (video: VideoRef, i: number) => video.title ?? `Video ${i + 1} of ${videos.length}`,
    [videos.length],
  );

  return (
    <div
      ref={paneRef}
      className={cx(
        'relative isolate w-full overflow-hidden',
        /* `on-dark` switches focus rings to white — see globals.css. Without it
           the keyboard outline is `--color-core-black` on the footage, i.e.
           invisible, which is a real failure and not a cosmetic one. */
        'on-dark',
        /* Width, the height floor, the border and the radius all live in this
           class in globals.css, because every one of them is interpolated
           between the full-screen and settled states. */
        'hero-pane',
        FRAME_SHADOW,
        /* `justify-end`, not `justify-center`: the glass panel sits LOW in the
           frame on request — centred across, down at the bottom. The pane's
           own bottom padding is what holds it off the edge, so it keeps the
           same clearance at every breakpoint and at every point of the shrink.

           The controls, when there are any, are absolutely placed at
           `bottom-4/6` — inside that padding, so they land under the panel
           rather than behind it. */
        'flex flex-col items-center justify-end',
        'px-5 py-16 mid:px-8 mid:py-20 tablet:px-12 tablet:py-28',
      )}
      /* Hover and focus pause the rotation, so a slide cannot change out from
         under someone reading it or tabbing through the controls.

         🔶 WORTH KNOWING once a SECOND hero video exists. The CMS ships one
         today, so `multi` is false and none of this runs. But the pane now
         covers the whole screen on arrival, and "the pointer is over the pane"
         therefore means "the pointer is anywhere on the page" until it
         settles — so on a desktop the rotation would sit paused through the
         opening. If a second video is added and the first never hands over,
         that is the cause: gate this on `--hero-p` being past the settle
         point rather than on hover alone. */
      onPointerEnter={() => setHoverPaused(true)}
      onPointerLeave={() => setHoverPaused(false)}
      onFocusCapture={() => setHoverPaused(true)}
      onBlurCapture={() => setHoverPaused(false)}
    >
      {/* ---------- Layer 1: the footage ---------- */}
      {videos.map((video, i) => (
        <video
          key={video.src}
          ref={(el) => {
            videoRefs.current[i] = el;
          }}
          src={video.src}
          poster={video.poster}
          /* `muted` and `playsInline` are not preferences — every browser
             refuses to autoplay without both. `loop` because a single clip
             ending on a frozen frame is worse than no video. */
          muted
          loop
          playsInline
          /* The active clip is worth bytes; the rest fetch enough to have a
             first frame ready for the crossfade and no more. */
          preload={i === index ? 'auto' : 'metadata'}
          /* Decorative: the headline carries the meaning, and the controls
             below are separately labelled. */
          aria-hidden="true"
          tabIndex={-1}
          className={cx(
            'absolute inset-0 -z-10 size-full object-cover',
            /* Crossfade rather than slide: opacity is composited, so the
               transition never touches layout on a full-bleed element. */
            'transition-opacity duration-700 ease-out-soft motion-reduce:transition-none',
            i === index ? 'opacity-100' : 'opacity-0',
          )}
        />
      ))}

      {/* ---------- Layer 2: the type ----------
          There is no layer between this and the footage any more. The scrim
          that used to sit here is gone on request — see the header note. */}
      <div className="relative flex w-full flex-col items-center">{children}</div>

      {/* ---------- Layer 3: controls, only when they have a job ---------- */}
      {multi ? (
        <div
          className={cx(
            'absolute bottom-4 left-1/2 -translate-x-1/2 tablet:bottom-6',
            'flex items-center gap-1 rounded-pill border border-white/50 bg-surface/80 p-1.5',
            'backdrop-blur-[13px]',
          )}
          role="group"
          aria-label="Hero video controls"
        >
          {/* WCAG 2.2.2 (Pause, Stop, Hide): content that moves or auto-updates
              for more than five seconds needs a way to stop it. Both the
              rotation AND the footage qualify, so this is required, not a
              nicety. Hidden under `prefers-reduced-motion` because nothing is
              moving there to pause. */}
          {!reduceMotion ? (
            <button
              type="button"
              onClick={() => setUserPaused((paused) => !paused)}
              aria-pressed={userPaused}
              className="inline-flex size-8 items-center justify-center rounded-pill text-ink transition-colors hover:bg-white/60"
            >
              <span className="visually-hidden">
                {userPaused ? 'Play hero videos' : 'Pause hero videos'}
              </span>
              <Icon name={userPaused ? 'play' : 'pause'} size={14} />
            </button>
          ) : null}

          {videos.map((video, i) => (
            <button
              key={video.src}
              type="button"
              onClick={() => setIndex(i)}
              aria-current={i === index ? 'true' : undefined}
              className="inline-flex size-8 items-center justify-center rounded-pill"
            >
              <span className="visually-hidden">{label(video, i)}</span>
              <span
                aria-hidden="true"
                className={cx(
                  'block size-2 rounded-full transition-all duration-300 ease-out-soft',
                  'motion-reduce:transition-none',
                  i === index ? 'w-5 bg-ink' : 'bg-ink/30',
                )}
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
