'use client';

import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { Icon } from '@/components/ui/Icon';
import { ProjectCard, type ProjectCardData } from '@/components/sections/ProjectCard';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cx } from '@/lib/cx';

/* =============================================================================
   PROJECT CAROUSEL — "Our projects" on the home page.

   Moves one card to the left every few seconds and loops forever:
   1 → 2 → 3 → 4 → 1 → … Three cards in view from 1024px, two from 640px, one
   on a phone.

   ─── ANY NUMBER OF PROJECTS ───────────────────────────────────────────────
   Nothing here knows how many projects there are. The list comes from the
   CMS; publish a fifth and it simply joins the loop. The loop runs only when
   there are MORE projects than fit in view — with three projects on a
   desktop there is nothing to reveal, so it sits still.

   ─── THE SEAMLESS WRAP ────────────────────────────────────────────────────
   The track is the real cards followed by COPIES of the first three. Stepping
   past the last real card slides onto those copies — which look exactly like
   the start of the list — and once that slide has finished, the track jumps
   back to the real first card with the transition switched off. The jump
   lands on an identical picture, so the eye sees one continuous loop. The
   copies are `inert` and `aria-hidden`: never focusable, never announced.

   ─── NO MEASURING ─────────────────────────────────────────────────────────
   Card width and the step are CSS: `--per-view` and `--gap` are set per
   breakpoint on the wrapper, each card is (100% − gaps) / per-view wide, and
   the track moves by `index × (100% + gap) / per-view` — percentages of the
   track's own width. Resizing the window needs no JavaScript at all.

   ─── WHEN IT MOVES, AND WHEN IT DOES NOT ─────────────────────────────────
   Auto-advance runs only while ALL of these hold:
     · there are more projects than fit in view
     · the visitor has not pressed pause (WCAG 2.2.2 — anything that moves on
       its own for more than five seconds needs a way to stop it)
     · the pointer is not over it and focus is not inside it, so a card never
       slides away from someone reading it or tabbing through it
     · it is on screen, and the browser tab is visible
     · `prefers-reduced-motion` is off
   The dots (one per project) and swiping work in every case.

   ─── WITHOUT JAVASCRIPT ───────────────────────────────────────────────────
   The server renders a plain row that scrolls sideways with snap points, and
   no copies. The carousel takes over after hydration, so a failed script
   leaves every project reachable rather than stuck behind a clipped edge.
   ========================================================================== */

/** How long each position is held before moving on. */
const HOLD_MS = 4000;
/** Must match `duration-700` on the track. */
const SLIDE_MS = 700;
/** Copies appended for the wrap — the most cards ever in view at once. */
const MAX_PER_VIEW = 3;
/** A swipe shorter than this is a tap, not a swipe. */
const SWIPE_PX = 40;

export function ProjectCarousel({ projects }: { projects: readonly ProjectCardData[] }) {
  const n = projects.length;

  const [enhanced, setEnhanced] = useState(false);
  useEffect(() => setEnhanced(true), []);

  const isMid = useMediaQuery('(min-width: 40rem)');
  const isWide = useMediaQuery('(min-width: 64rem)');
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const perView = isWide ? 3 : isMid ? 2 : 1;
  const loop = enhanced && n > perView;

  /* 0…n-1 are the real cards; n is the first copy, which looks identical to 0. */
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);

  const [userPaused, setUserPaused] = useState(false);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [pageHidden, setPageHidden] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const swipeRef = useRef<{ x: number; y: number } | null>(null);
  const frameRef = useRef(0);

  const playing =
    loop && !reduceMotion && !userPaused && !hoverPaused && !focusPaused && onScreen && !pageHidden;

  /* Back to the start if the loop switches off (a wider window now fits every
     project, or a project was removed). */
  useEffect(() => {
    if (!loop) {
      setAnimate(false);
      setIndex(0);
    }
  }, [loop]);

  /* Transitions go back on two frames after a silent jump, so the jump itself
     is committed to screen without animating. */
  useEffect(() => {
    if (animate) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = requestAnimationFrame(() => setAnimate(true));
    });
    return () => cancelAnimationFrame(frameRef.current);
  }, [animate]);

  /* THE WRAP. Having slid onto the copies (index ≥ n), wait for the slide to
     finish, then jump silently to the matching real card. A timer rather than
     `transitionend`, because a backgrounded tab may never deliver that event
     and the track would be stranded on the copies. */
  useEffect(() => {
    if (index < n) return;
    const timer = setTimeout(() => {
      setAnimate(false);
      setIndex((i) => i - n);
    }, SLIDE_MS + 60);
    return () => clearTimeout(timer);
  }, [index, n]);

  const next = useCallback(() => {
    if (!loop) return;
    /* Still on the copies, mid-wrap: the jump back is due any moment. */
    setIndex((i) => (i >= n ? i : i + 1));
    setAnimate(true);
  }, [loop, n]);

  const prev = useCallback(() => {
    if (!loop) return;
    if (index > 0) {
      setAnimate(true);
      setIndex(Math.min(index, n) - 1);
      return;
    }
    /* At the very start: jump silently to the copy of card 0 — the same
       picture — then slide back from there onto the last real card. */
    setAnimate(false);
    setIndex(n);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setAnimate(true);
        setIndex(n - 1);
      }),
    );
  }, [loop, n, index]);

  /* A dot: straight to that project, sliding either way. */
  const goTo = useCallback(
    (target: number) => {
      if (!loop) return;
      setAnimate(true);
      setIndex(target);
    },
    [loop],
  );

  /* Auto-advance. Keyed on `index`, so pressing prev/next restarts the hold
     rather than letting the timer fire straight after a manual move. */
  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(next, HOLD_MS);
    return () => clearTimeout(timer);
  }, [playing, index, next]);

  /* Only moves while at least 30% of it is on screen. */
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setOnScreen(!!entry?.isIntersecting), {
      threshold: 0.3,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const sync = () => setPageHidden(document.visibilityState === 'hidden');
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, []);

  /* Tabbing onto a card that is out of view brings it into view. */
  const revealCard = (i: number) => {
    if (!loop) return;
    const visible = i >= index && i < index + perView;
    if (!visible) {
      setAnimate(true);
      setIndex(i);
    }
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse') return;
    swipeRef.current = { x: event.clientX, y: event.clientY };
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = swipeRef.current;
    swipeRef.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) next();
    else prev();
  };

  if (n === 0) return null;

  const slides = loop ? [...projects, ...projects.slice(0, Math.min(MAX_PER_VIEW, n))] : projects;
  const current = (index % n) + 1;

  /* Circle buttons in the ghost style: they inherit the surface they sit on
     (light on the green field) and fill white on hover. */
  const control =
    'inline-flex size-11 items-center justify-center rounded-full border border-line-strong text-ink ' +
    'transition-colors duration-200 hover:theme-light hover:bg-surface';

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured projects"
      className="[--gap:1rem] [--per-view:1] mid:[--per-view:2] tablet:[--per-view:3]"
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') setHoverPaused(true);
      }}
      onPointerLeave={() => setHoverPaused(false)}
      /* KEYBOARD focus only. A mouse click on the play button leaves focus
         on it; pausing for that focus would mean pressing play did nothing. */
      onFocusCapture={(event) => setFocusPaused(event.target.matches(':focus-visible'))}
      onBlurCapture={() => setFocusPaused(false)}
    >
      {/* The viewport. `py-2 -my-2` leaves room for the card's hover lift,
          which `overflow-hidden` would otherwise clip. */}
      <div
        className={cx(
          '-my-2 py-2',
          enhanced
            ? 'touch-pan-y overflow-hidden'
            : 'snap-x snap-mandatory overflow-x-auto',
        )}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          swipeRef.current = null;
        }}
      >
        <ul
          aria-live={playing ? 'off' : 'polite'}
          className={cx(
            'flex gap-(--gap) will-change-transform',
            animate
              ? 'transition-transform duration-700 ease-out-soft motion-reduce:transition-none'
              : 'transition-none',
          )}
          style={
            loop
              ? { transform: `translate3d(calc(${index} * -1 * (100% + var(--gap)) / var(--per-view)), 0, 0)` }
              : undefined
          }
        >
          {slides.map((project, i) => {
            const isCopy = i >= n;
            return (
              <li
                key={isCopy ? `copy-${project.slug}` : project.slug}
                role={isCopy ? undefined : 'group'}
                aria-roledescription={isCopy ? undefined : 'slide'}
                aria-label={isCopy ? undefined : `${i + 1} of ${n}`}
                aria-hidden={isCopy ? true : undefined}
                inert={isCopy}
                onFocus={isCopy ? undefined : () => revealCard(i)}
                className="flex snap-start"
                style={{ flex: '0 0 calc((100% - (var(--per-view) - 1) * var(--gap)) / var(--per-view))' }}
              >
                <ProjectCard project={project} />
              </li>
            );
          })}
        </ul>
      </div>

      {/* The design template's dots: one per project, the current one drawn
          long and gold. Each is a button that jumps straight to its project.
          The pause control sits at the end of the row — auto-advance for more
          than five seconds needs a way to stop it (WCAG 2.2.2). Swiping still
          moves it on a phone. */}
      {loop ? (
        <div className="mt-8 flex items-center justify-center gap-3" role="group" aria-label="Carousel controls">
          <div className="flex items-center">
            {projects.map((project, i) => {
              const active = i === current - 1;
              return (
                <button
                  key={project.slug}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-current={active ? 'true' : undefined}
                  className="inline-flex h-11 w-7 items-center justify-center"
                >
                  <span className="visually-hidden">
                    Show {project.name} ({i + 1} of {n})
                  </span>
                  <span
                    aria-hidden="true"
                    className={cx(
                      'block h-2 rounded-full transition-all duration-300 ease-out-soft motion-reduce:transition-none',
                      active ? 'w-6 bg-linear-to-r from-gold-from to-gold-to' : 'w-2 bg-ink/20',
                    )}
                  />
                </button>
              );
            })}
          </div>

          {!reduceMotion ? (
            <button type="button" onClick={() => setUserPaused((p) => !p)} className={control}>
              <span className="visually-hidden">
                {userPaused ? 'Start moving through projects' : 'Stop moving through projects'}
              </span>
              <Icon name={userPaused ? 'play' : 'pause'} size={14} />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
