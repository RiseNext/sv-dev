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

   ─── THE SCRIM IS DARK, AND THE FOOTAGE IS LEFT SHARP ─────────────────────
   This was a white wash over a blurred video, and it buried the footage: the
   point of a hero video is that you can see it. So the blur is gone entirely
   and the scrim is a DIM rather than a wash — the video reads at full clarity
   and the type sits on darkened footage instead of behind frosted glass.

   THE TYPE IS THEREFORE WHITE, not `text-ink`. That is forced, not stylistic:
   near-black type on a darkened video is unreadable at any scrim strength that
   still lets the footage show.

   IT IS A VERTICAL GRADIENT, NOT A FLAT TINT, and that is what keeps it
   reading as texture rather than as a grey sheet someone dropped on the video.
   Darkest at the top and bottom edges — which is where the headline and the
   controls sit — and at its lightest across the middle, where the footage is
   allowed to come through almost untouched.

   🔶 THE ONE THING TO WATCH: the footage is admin-supplied, so its brightness
   is not ours to control. These stops hold white type against the bright, dusty
   daylight clip currently in the preview folder; a near-white shot (overcast
   sky, sand) would need them stronger. If a future upload makes the headline
   hard to read, RAISE THE ALPHAS HERE — do not darken the type, which would
   fail against the next clip in the carousel.

   ─── HEIGHT IS CONTENT-DRIVEN, NOT ASPECT-DRIVEN ──────────────────────────
   No `aspect-[16/9]` on the frame. An aspect ratio fixes the height from the
   WIDTH, so on a narrow phone the pane becomes short exactly as the headline
   wraps to four lines, and the type either overflows or has to shrink. Padding
   plus a `min-h` lets the pane grow to whatever the type needs at every width,
   which is what makes this survive translation, a longer headline, or a 320px
   screen. The video fills whatever height results via `object-cover`.
   ========================================================================== */

/** Long enough to read the headline and watch a few seconds of footage. */
const ADVANCE_MS = 7000;

/* The scrim. ONE UNBROKEN STRING — Tailwind scans source text for whole class
   names, so an arbitrary value split across a `+` join silently generates no
   rule at all.

   Stops are `--color-ink` (#1a1613), the site's warm near-black, NOT pure
   black: a neutral #000 tint over warm daylight footage turns it grey and
   lifeless, while the warm ink keeps the dust and the light in the shot. */
const SCRIM =
  'bg-[linear-gradient(to_bottom,rgba(26,22,19,0.62)_0%,rgba(26,22,19,0.44)_28%,rgba(26,22,19,0.34)_50%,rgba(26,22,19,0.46)_74%,rgba(26,22,19,0.7)_100%)]';

/* The frame. A hairline plus a two-layer lift, same family as the nav's glass:
   a tight contact shadow and a wide deep ambient. */
const FRAME_SHADOW =
  'shadow-[0_2px_6px_rgba(26,22,19,0.06),0_24px_60px_-24px_rgba(26,22,19,0.28)]';

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

  const advancing = multi && !reduceMotion && !userPaused && !hoverPaused;

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
      className={cx(
        'relative isolate w-full overflow-hidden',
        /* `on-dark` switches focus rings to white — see globals.css. Without it
           the keyboard outline is `--color-core-black` on darkened footage,
           i.e. invisible, which is a real failure and not a cosmetic one. */
        'on-dark',
        /* Smaller radius on a phone: 24px on a pane only a few hundred pixels
           wide eats visibly into the corners of the type inside it. */
        'rounded-card tablet:rounded-media',
        /* Down from white/55, which was tuned against a pale wash. At that
           strength a hairline over darkened footage reads as a bright seam. */
        'border border-white/20',
        FRAME_SHADOW,
        /* Content-driven height with a floor — see the header note on why this
           is not an aspect ratio. */
        'min-h-[30rem] tablet:min-h-[34rem]',
        'flex flex-col items-center justify-center',
        'px-5 py-16 mid:px-8 mid:py-20 tablet:px-12 tablet:py-28',
      )}
      /* Hover and focus pause the rotation, so a slide cannot change out from
         under someone reading it or tabbing through the controls. */
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

      {/* ---------- Layer 2: the scrim ----------
          NO `backdrop-blur` here, deliberately. It used to carry a 3px blur,
          which softened the footage into a texture — the opposite of the point
          of a hero video. Tinting alone keeps every frame sharp, and it is also
          the cheaper layer: `backdrop-filter` over a playing video forces the
          compositor to re-sample and re-blur its backdrop EVERY FRAME, which is
          the one thing on this page that could cost real frame rate on a
          phone. */}
      <div aria-hidden="true" className={cx('pointer-events-none absolute inset-0 -z-10', SCRIM)} />

      {/* ---------- Layer 3: the type ---------- */}
      <div className="relative flex w-full flex-col items-center">{children}</div>

      {/* ---------- Layer 4: controls, only when they have a job ---------- */}
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
