'use client';

import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { Icon } from '@/components/ui/Icon';
import { ProjectCard, type ProjectCardData } from '@/components/sections/ProjectCard';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cx } from '@/lib/cx';

/* =============================================================================
   PROJECT CAROUSEL — "Our projects" on the home page.

   Shows the projects once, in order, and stops: 1 → 2 → 3 → 4 and no further.
   No project is ever repeated and no project is ever shown twice at once.
   Three cards in view from 1024px, two from 640px, one on a phone. Arrows
   either side of the dots step it by hand, and a swipe does the same on a
   touch screen.

   ─── ANY NUMBER OF PROJECTS ───────────────────────────────────────────────
   Nothing here knows how many projects there are. The list comes from the
   CMS; publish another and it simply joins the end. It only moves when there
   are MORE projects than fit in view — with three projects on a desktop
   there is nothing to reveal, so it sits still and the controls are not
   shown.

   ─── WHERE IT STOPS ───────────────────────────────────────────────────────
   The last position is the one that puts the LAST project flush with the
   right edge — `maxIndex` below, `n − perView`. Past that there would be
   empty space, so the track refuses to go further: the next arrow disables,
   and auto-advance simply finishes rather than rewinding to the start.

   ─── NO MEASURING ─────────────────────────────────────────────────────────
   Card width and the step are CSS: `--per-view` and `--gap` are set per
   breakpoint on the wrapper, each card is (100% − gaps) / per-view wide, and
   the track moves by `index × (100% + gap) / per-view` — percentages of the
   track's own width. Resizing the window needs no JavaScript at all.

   ─── WHEN IT MOVES ON ITS OWN ─────────────────────────────────────────────
   There is deliberately no pause button, because it stops by itself at the
   last project. Until then it advances while all of these hold:
     · there is still a project to the right to reveal
     · the pointer is not over it and keyboard focus is not inside it, so a
       card never slides away from someone reading it, tabbing through it or
       reaching for an arrow
     · it is on screen, and the browser tab is visible
     · `prefers-reduced-motion` is off — with it on, the arrows, dots and
       swipe still work, it just never moves by itself
   Every manual step restarts the hold, so the next automatic move is a full
   interval after the visitor's own.

   ─── WITHOUT JAVASCRIPT ───────────────────────────────────────────────────
   The server renders a plain row that scrolls sideways with snap points. The
   carousel takes over after hydration, so a failed script leaves every
   project reachable rather than stuck behind a clipped edge.
   ========================================================================== */

/** How long each position is held before moving on. */
const HOLD_MS = 4000;
/** A swipe shorter than this is a tap, not a swipe. */
const SWIPE_PX = 40;

/* The arrows: pale gold circles, filling full gold on hover. Spent arrows —
   nothing further that way — fade back and stop responding. */
const ARROW = cx(
  'inline-flex size-11 items-center justify-center rounded-full bg-gold-soft text-ink',
  'transition-colors duration-200 hover:bg-gold',
  'disabled:pointer-events-none disabled:opacity-40 disabled:hover:bg-gold-soft',
);

export function ProjectCarousel({ projects }: { projects: readonly ProjectCardData[] }) {
  const n = projects.length;

  const [enhanced, setEnhanced] = useState(false);
  useEffect(() => setEnhanced(true), []);

  const isMid = useMediaQuery('(min-width: 40rem)');
  const isWide = useMediaQuery('(min-width: 64rem)');
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const perView = isWide ? 3 : isMid ? 2 : 1;

  /* The furthest left the track may sit: the last project flush right. Zero
     when every project already fits, which is also when the controls go. */
  const maxIndex = Math.max(0, n - perView);
  const movable = enhanced && maxIndex > 0;

  const [index, setIndex] = useState(0);

  const [hoverPaused, setHoverPaused] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [pageHidden, setPageHidden] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const swipeRef = useRef<{ x: number; y: number } | null>(null);

  const atStart = index <= 0;
  const atEnd = index >= maxIndex;

  const playing =
    movable && !atEnd && !reduceMotion && !hoverPaused && !focusPaused && onScreen && !pageHidden;

  /* Never leave the track parked past its last position — a wider window now
     fits more cards, or a project was removed. */
  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  const step = useCallback(
    (delta: number) => setIndex((i) => Math.min(Math.max(i + delta, 0), maxIndex)),
    [maxIndex],
  );

  const next = useCallback(() => step(1), [step]);
  const prev = useCallback(() => step(-1), [step]);

  /* A dot: straight to that position, sliding either way. */
  const goTo = useCallback(
    (target: number) => setIndex(Math.min(Math.max(target, 0), maxIndex)),
    [maxIndex],
  );

  /* Auto-advance. Keyed on `index`, so an arrow, a dot or a swipe restarts
     the hold rather than letting the timer fire straight after a manual
     move. Stops for good once `atEnd` turns `playing` off. */
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
    if (!movable) return;
    if (i < index) goTo(i);
    else if (i >= index + perView) goTo(i - perView + 1);
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
      /* KEYBOARD focus only. A mouse click on an arrow leaves focus on it;
         pausing for that focus would stop the loop for good once the pointer
         moved away. */
      onFocusCapture={(event) => setFocusPaused(event.target.matches(':focus-visible'))}
      onBlurCapture={() => setFocusPaused(false)}
    >
      {/* The viewport. `py-2 -my-2` leaves room for the card's hover lift,
          which `overflow-hidden` would otherwise clip. */}
      <div
        className={cx(
          '-my-2 py-2',
          enhanced ? 'touch-pan-y overflow-hidden' : 'snap-x snap-mandatory overflow-x-auto',
        )}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          swipeRef.current = null;
        }}
      >
        {/* Exactly one card per project, in CMS order. */}
        <ul
          aria-live={playing ? 'off' : 'polite'}
          className="flex gap-(--gap) transition-transform duration-700 ease-out-soft will-change-transform motion-reduce:transition-none"
          style={
            movable
              ? { transform: `translate3d(calc(${index} * -1 * (100% + var(--gap)) / var(--per-view)), 0, 0)` }
              : undefined
          }
        >
          {projects.map((project, i) => (
            <li
              key={project.slug}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${n}`}
              onFocus={() => revealCard(i)}
              className="flex snap-start *:w-full"
              style={{ flex: '0 0 calc((100% - (var(--per-view) - 1) * var(--gap)) / var(--per-view))' }}
            >
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      </div>

      {/* Previous · one dot per position the track can stop at · next. Because
          the track stops with the last project flush right, the positions are
          `maxIndex + 1` — one per project on a phone, fewer once several
          cards share the view. The current one is drawn long. */}
      {movable ? (
        <div className="mt-8 flex items-center justify-center gap-3" role="group" aria-label="Carousel controls">
          <button type="button" onClick={prev} disabled={atStart} className={ARROW}>
            <span className="visually-hidden">Previous project</span>
            <Icon name="arrowRight" size={16} className="rotate-180" />
          </button>

          <div className="flex items-center">
            {Array.from({ length: maxIndex + 1 }, (_, i) => {
              const active = i === index;
              const first = projects[i];
              return (
                <button
                  key={first?.slug ?? i}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-current={active ? 'true' : undefined}
                  className="inline-flex h-11 w-7 items-center justify-center"
                >
                  <span className="visually-hidden">
                    {perView === 1
                      ? `Show ${first?.name} (${i + 1} of ${n})`
                      : `Show projects from ${first?.name}`}
                  </span>
                  <span
                    aria-hidden="true"
                    className={cx(
                      'block h-2 rounded-full transition-all duration-300 ease-out-soft motion-reduce:transition-none',
                      active ? 'w-6 bg-gold' : 'w-2 bg-gold-line',
                    )}
                  />
                </button>
              );
            })}
          </div>

          <button type="button" onClick={next} disabled={atEnd} className={ARROW}>
            <span className="visually-hidden">Next project</span>
            <Icon name="arrowRight" size={16} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
