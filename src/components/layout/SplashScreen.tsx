'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type AnimationEvent, type CSSProperties } from 'react';
import { LOGO_FALLBACK } from '@/components/layout/Logo';
import type { ImageRef } from '@/types/content';

/* =============================================================================
   THE FIRST-LOAD SPLASH — the emblem on the logo's own emerald, with a gold
   ring drawn round it that lights a sunburst as it passes (the sun and the
   gold ring are both lifted from the mark), then the rule-and-diamond from
   under "DEVELOPERS". When the page is ready the whole screen lifts away on a
   curved edge — the same wave the site's bands are cut with.

   ─── WHEN IT SHOWS ───────────────────────────────────────────────────────
   Once per DOCUMENT load. It lives in the root layout, which survives
   client-side navigation, so moving between pages never shows it again —
   only a fresh visit, a new tab or a reload does.

   ─── IT CAN NEVER TRAP THE PAGE ──────────────────────────────────────────
   · It leaves when the intro has played AND the window has loaded, but never
     later than MAX_MS, however slow the network.
   · Without JavaScript it is not shown at all (the <noscript> rule in
     layout.tsx), and if the script stalls, a CSS animation fades it out
     at 7s on its own (`splash-failsafe` in globals.css).
   · It is aria-hidden: assistive technology reads the page underneath from
     the first moment.

   The timings here and the keyframes in globals.css are one design: change
   them together. */

/** The intro — ring drawn, rays lit, rule drawn — has finished by now. */
const INTRO_MS = 1600;
/** With reduced motion there is no intro to wait for, just a brief hold. */
const REDUCED_MS = 700;
/** The hard ceiling. A slow page is revealed as it is rather than held. */
const MAX_MS = 4500;
/** `splash-lift` in globals.css: 120ms delay + 950ms. */
const LIFT_MS = 1070;

/* The ring is drawn over RING_MS from 12 o'clock, clockwise, on a
   sine in-out curve. Each ray lights at the moment the ring's tip passes it:
   the curve inverted at the ray's angle, so they stay in step despite the
   easing. Then a glint runs round them, 90ms a ray (the 2160ms loop of
   `splash-glint` is 24 × 90). */
const RING_DELAY = 300;
const RING_MS = 1000;
const RAY_COUNT = 24;
const RAY_FROM = 75;

const RAYS = Array.from({ length: RAY_COUNT }, (_, i) => ({
  angle: (360 * i) / RAY_COUNT,
  length: i % 2 === 0 ? 11 : 6,
  draw: Math.round(RING_DELAY + (RING_MS * Math.acos(1 - (2 * i) / RAY_COUNT)) / Math.PI),
  glint: RING_DELAY + RING_MS + i * 90,
}));

type Phase = 'intro' | 'hold' | 'leaving' | 'gone';

export function SplashScreen({ logo, tagline }: { logo?: ImageRef; tagline?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  /* 'intro' is what the server renders. 'hold' says the script is running,
     and only then does globals.css pause the page's entrance animations
     behind the splash — so if the script never runs they are never paused. */
  const [phase, setPhase] = useState<Phase>('intro');

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    setPhase('hold');

    /* How long the splash has ALREADY been on screen. It is painted from the
       server HTML, well before this runs, so counting from here would add the
       hydration time on top. Its own failsafe animation started at that
       first paint, and its clock is exactly the time since. */
    const clock = node
      .getAnimations?.()
      .find((animation) => (animation as CSSAnimation).animationName === 'splash-failsafe');
    const shown = typeof clock?.currentTime === 'number' ? clock.currentTime : 0;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const leave = () => setPhase((current) => (current === 'leaving' || current === 'gone' ? current : 'leaving'));

    let introDone = false;
    let loaded = document.readyState === 'complete';
    const maybeLeave = () => {
      if (introDone && loaded) leave();
    };
    const onLoad = () => {
      loaded = true;
      maybeLeave();
    };

    const intro = window.setTimeout(
      () => {
        introDone = true;
        maybeLeave();
      },
      Math.max(0, (reduce ? REDUCED_MS : INTRO_MS) - shown),
    );
    const ceiling = window.setTimeout(leave, Math.max(0, MAX_MS - shown));
    window.addEventListener('load', onLoad);

    /* The page must not scroll away underneath. Not the body scroll lock the
       menu uses: that hides the scrollbar, and on a desktop the page would
       jump sideways by its width just as it is revealed. Swallowing the
       gestures on the splash itself — before they bubble to the window,
       where Lenis listens — leaves the layout alone. */
    const swallow = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
    };
    node.addEventListener('wheel', swallow, { passive: false });
    node.addEventListener('touchmove', swallow, { passive: false });

    return () => {
      window.clearTimeout(intro);
      window.clearTimeout(ceiling);
      window.removeEventListener('load', onLoad);
      node.removeEventListener('wheel', swallow);
      node.removeEventListener('touchmove', swallow);
    };
  }, []);

  /* `animationend` normally unmounts it; this is the backstop. */
  useEffect(() => {
    if (phase !== 'leaving') return;
    const timer = window.setTimeout(() => setPhase('gone'), LIFT_MS + 250);
    return () => window.clearTimeout(timer);
  }, [phase]);

  if (phase === 'gone') return null;

  const onAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.animationName === 'splash-lift' || event.animationName === 'splash-failsafe') {
      setPhase('gone');
    }
  };

  const mark = logo ?? LOGO_FALLBACK;

  return (
    <div ref={ref} aria-hidden="true" data-phase={phase} className="splash" onAnimationEnd={onAnimationEnd}>
      <div className="splash-content">
        <div className="splash-stage">
          <svg className="splash-halo" viewBox="-100 -100 200 200" focusable="false">
            <defs>
              <linearGradient
                id="splash-gold"
                gradientUnits="userSpaceOnUse"
                x1="-70"
                y1="-70"
                x2="70"
                y2="70"
              >
                <stop offset="0" stopColor="#f3e3bd" />
                <stop offset="0.45" stopColor="#d4b98c" />
                <stop offset="0.75" stopColor="#b38e5a" />
                <stop offset="1" stopColor="#e6cf9f" />
              </linearGradient>
            </defs>
            <circle className="splash-track" r="68" />
            {/* rotate(-90): an SVG circle starts drawing at 3 o'clock. */}
            <circle className="splash-ring" r="68" transform="rotate(-90)" />
            {RAYS.map((ray) => (
              <line
                key={ray.angle}
                className="splash-ray"
                x1="0"
                y1={-RAY_FROM}
                x2="0"
                y2={-(RAY_FROM + ray.length)}
                transform={`rotate(${ray.angle})`}
                style={
                  {
                    '--len': `${ray.length}`,
                    '--draw': `${ray.draw}ms`,
                    '--glint': `${ray.glint}ms`,
                  } as CSSProperties
                }
              />
            ))}
          </svg>

          <div className="splash-medallion">
            {/* The committed mark is a square JPEG with its gold ring at 71% of
                the width, centred (measured). Zoomed 1.34× the ring lands just
                inside the medallion's edge, a coin rather than a badge with a
                white margin. A CMS upload has unknown geometry, so it is
                contained instead of cropped. */}
            <Image
              src={mark.src}
              alt=""
              fill
              sizes="(min-width: 48rem) 21rem, 13rem"
              quality={90}
              priority
              className={logo ? 'object-contain p-[12%]' : 'scale-[1.34] object-cover'}
            />
          </div>
        </div>

        <div className="splash-rule">
          <span className="splash-rule-line" />
          <span className="splash-rule-diamond" />
          <span className="splash-rule-line" />
        </div>

        {tagline ? <p className="splash-tagline">{tagline}</p> : null}
      </div>
    </div>
  );
}
