'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cx } from '@/lib/cx';
import type { VideoRef } from '@/types/content';

/* =============================================================================
   HERO VIDEO STAGE — the dark wave on the right of the hero.

   The design template's hero is type on the cream field with a sweeping dark
   green wave on the right. Here the CMS hero video plays INSIDE that wave: the
   footage is clipped to the curve, tinted toward the forest green so it still
   reads as the template's dark shape, and crossed by the template's thin gold
   line. With no video in the CMS it is the template exactly — a solid forest
   wave with the gold line.

   ─── THE SHAPE ────────────────────────────────────────────────────────────
   Two clip paths in `objectBoundingBox` units (0–1 of the box, so they
   stretch to whatever size the box is):
     · from 1024px — a tall S-curve on the right, leaving the top-left cream
       for the headline
     · below 1024px — a band under the headline with a single curved top edge
   The ids are fixed rather than generated: there is one hero per page, and a
   Tailwind class must be a literal string to be generated at all.

   ─── ONE OR MORE VIDEOS ───────────────────────────────────────────────────
   Several videos crossfade every 7s, only the visible one plays, and a pause
   control appears (WCAG 2.2.2). Hover and focus pause the rotation too. Under
   `prefers-reduced-motion` nothing plays — the poster frame stands in.
   ========================================================================== */

const ADVANCE_MS = 7000;

export function HeroVideoStage({
  videos,
  className,
}: {
  videos: readonly VideoRef[];
  className?: string;
}) {
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const multi = videos.length > 1;
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hoverPaused, setHoverPaused] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const advancing = multi && !reduceMotion && !userPaused && !hoverPaused;

  /* ONLY THE VISIBLE VIDEO PLAYS. Decoding every clip for one visible pane is
     the most expensive thing a hero can do on a phone. */
  useEffect(() => {
    videoRefs.current.forEach((el, i) => {
      if (!el) return;
      if (i !== index || reduceMotion) {
        el.pause();
        if (i !== index) el.currentTime = 0;
        return;
      }
      /* `play()` rejects when autoplay is refused (iOS Low Power Mode): the
         poster stays up and the hero is still complete. */
      void el.play().catch(() => {});
    });
  }, [index, reduceMotion, videos.length]);

  useEffect(() => {
    if (!advancing) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % videos.length), ADVANCE_MS);
    return () => clearInterval(timer);
  }, [advancing, videos.length]);

  const label = useCallback(
    (video: VideoRef, i: number) => video.title ?? `Video ${i + 1} of ${videos.length}`,
    [videos.length],
  );

  return (
    <div
      className={cx(
        'on-dark pointer-events-auto isolate overflow-hidden bg-forest',
        '[clip-path:url(#hero-wave-band)] tablet:[clip-path:url(#hero-wave-side)]',
        className,
      )}
      onPointerEnter={() => setHoverPaused(true)}
      onPointerLeave={() => setHoverPaused(false)}
      onFocusCapture={() => setHoverPaused(true)}
      onBlurCapture={() => setHoverPaused(false)}
    >
      {/* The two shapes. A zero-size SVG only carries the definitions. */}
      <svg aria-hidden="true" width="0" height="0" className="absolute">
        <defs>
          <clipPath id="hero-wave-side" clipPathUnits="objectBoundingBox">
            <path d="M1,0 L1,1 L0.04,1 C0.2,1 0.3,0.86 0.42,0.62 C0.56,0.34 0.74,0.06 1,0 Z" />
          </clipPath>
          <clipPath id="hero-wave-band" clipPathUnits="objectBoundingBox">
            <path d="M0,0.2 C0.22,0.02 0.5,0.02 0.72,0.14 C0.84,0.2 0.93,0.2 1,0.12 L1,1 L0,1 Z" />
          </clipPath>
        </defs>
      </svg>

      {videos.map((video, i) => (
        <video
          key={video.src}
          ref={(el) => {
            videoRefs.current[i] = el;
          }}
          src={video.src}
          poster={video.poster}
          muted
          loop
          playsInline
          preload={i === index ? 'auto' : 'metadata'}
          aria-hidden="true"
          tabIndex={-1}
          className={cx(
            'absolute inset-0 -z-10 size-full object-cover',
            'transition-opacity duration-700 ease-out-soft motion-reduce:transition-none',
            i === index ? 'opacity-100' : 'opacity-0',
          )}
        />
      ))}

      {/* Tints the footage toward the forest green, so the wave still reads as
          the template's dark shape and not as a photo cut out of the page. */}
      {videos.length > 0 ? (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-forest/50" />
      ) : null}

      {/* The template's thin gold line, following the curve inside the wave. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 size-full"
      >
        <path
          d="M14,100 C30,96 38,80 48,62 C60,40 76,16 100,10"
          fill="none"
          stroke="url(#hero-wave-gold)"
          strokeWidth="1.2"
          vectorEffect="non-scaling-stroke"
          className="max-tablet:hidden"
        />
        <path
          d="M0,44 C24,26 50,26 72,38 C84,44 93,44 100,36"
          fill="none"
          stroke="url(#hero-wave-gold)"
          strokeWidth="1.2"
          vectorEffect="non-scaling-stroke"
          className="tablet:hidden"
        />
        <defs>
          <linearGradient id="hero-wave-gold" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#d4b98c" stopOpacity="0.15" />
            <stop offset="0.5" stopColor="#d4b98c" stopOpacity="0.85" />
            <stop offset="1" stopColor="#d4b98c" stopOpacity="0.35" />
          </linearGradient>
        </defs>
      </svg>

      {multi ? (
        <div
          className={cx(
            'theme-light absolute bottom-5 right-5 flex items-center gap-1 rounded-pill border border-white/50 bg-surface/85 p-1.5',
            'backdrop-blur-[13px]',
          )}
          role="group"
          aria-label="Hero video controls"
        >
          {!reduceMotion ? (
            <button
              type="button"
              onClick={() => setUserPaused((paused) => !paused)}
              aria-pressed={userPaused}
              className="inline-flex size-8 items-center justify-center rounded-pill text-ink transition-colors hover:bg-white/60"
            >
              <span className="visually-hidden">{userPaused ? 'Play hero videos' : 'Pause hero videos'}</span>
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
                  'block size-2 rounded-full transition-all duration-300 ease-out-soft motion-reduce:transition-none',
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
