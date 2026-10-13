'use client';

import { useCallback, useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cx } from '@/lib/cx';
import { isPlaceholder } from '@/lib/href';
import type { Testimonial } from '@/types/content';

/* =============================================================================
   TESTIMONIALS — the rail, deliberately built in `ProjectCarousel`'s idiom.

   ─── THE PROBLEM THIS SOLVES ──────────────────────────────────────────────
   🔴 ON A PHONE THE REVIEWS WERE A VERTICAL STACK. The section was a plain
   `grid gap-4 mid:grid-cols-2 tablet:grid-cols-3`, which below 640px collapses
   to ONE COLUMN — so every testimonial became a full-width block, one under
   the next, and the section's height grew without bound as the client adds
   reviews. Two quotes already ran most of a screen each. The request was to
   give it the transition the "Our projects" section has.

   ─── WHY A NEW FILE AND NOT A PROP ON `ProjectCarousel` ───────────────────
   The two look identical and behave differently in one way that matters:
   🔴 THIS ONE NEVER MOVES BY ITSELF. `ProjectCarousel` auto-advances every 4s,
   which is right for pictures you glance at and WRONG for a paragraph of prose
   — a quote sliding away mid-sentence is the single most irritating thing a
   review carousel can do, and "avoid autoplay that makes reading difficult"
   was explicit in the brief. Generalising the project carousel to support
   "sometimes autoplay" would have put a flag through its timer, its hold
   logic, its `aria-live` switching and its visibility observer to make the
   whole lot dead code for one of the two callers. Copying the ~80 lines that
   actually move a track is cheaper and leaves the shipping carousel untouched.

   EVERYTHING ELSE IS THE SAME ON PURPOSE — same `--per-view` CSS geometry,
   same wrapping-free step arithmetic, same arrow and dot chrome, same swipe
   threshold, same no-JS fallback. A visitor should not be able to tell the two
   sections were built months apart.

   ─── 🔴 THE DESKTOP GRID IS NOT REGRESSED, AND THE MECHANISM IS EXACT ─────
   `maxIndex = n − perView`. With three slots in view from 1024px and three or
   fewer reviews that is 0, `movable` is false, the track takes no transform
   and NO CONTROLS RENDER — leaving a flex row of three equal-width cards at
   `gap-4`, which is pixel-for-pixel what `grid-cols-3 gap-4` produced. The
   desktop only becomes a carousel once there are MORE reviews than fit, which
   is precisely when a fourth card had nowhere to go anyway.

   ─── WHAT IS NOT TRUNCATED ────────────────────────────────────────────────
   Nothing. The slides are flex children at default `stretch`, so the track is
   as tall as the LONGEST quote and every card matches it. No `line-clamp`, no
   max-height, no "read more" — the brief was explicit that real review text
   must not be shortened to save height, and the height saved here comes from
   putting the quotes SIDE BY SIDE, not from cutting them.
   ========================================================================== */

/** A swipe shorter than this is a tap, not a swipe. Same figure as the
 *  project carousel's, so the two feel identical under a thumb. */
const SWIPE_PX = 40;

/* Pale gold circles filling full gold on hover; spent arrows fade back and
   stop responding. Lifted verbatim from ProjectCarousel — same control, same
   appearance, and a visitor meets both on the same page. */
const ARROW = cx(
  'inline-flex size-11 items-center justify-center rounded-full bg-gold-soft text-ink',
  'transition-colors duration-200 hover:bg-gold',
  'disabled:pointer-events-none disabled:opacity-40 disabled:hover:bg-gold-soft',
);

/* ---------------------------------------------------------------------------
   THE CARD CHROME

   🔴 EXPORTED, AND THE STUB IN `Testimonials.tsx` RENDERS THE SAME FUNCTION.
   Two copies of this markup would drift the moment either was touched, and the
   stub's entire job is to show the real layout. It lives in this file rather
   than in the server component because a 'use client' module cannot import
   from its server parent without dragging the parent into the browser bundle;
   the dependency has to point this way round.

   `h-full` is load-bearing in the rail: the <li> stretches to the tallest
   slide, and without this the card would sit at its own content height inside
   a taller box, leaving the caption floating mid-air.
   --------------------------------------------------------------------------- */
export function TestimonialCard({ body, caption }: { body: ReactNode; caption: ReactNode }) {
  return (
    <figure className="flex h-full flex-col rounded-media bg-surface p-6 tablet:p-8">
      <blockquote className="flex-1">{body}</blockquote>
      <figcaption className="mt-8 border-t border-line pt-5">{caption}</figcaption>
    </figure>
  );
}

/* One real review. `isPlaceholder` still guards the attribution: a CMS row may
   legitimately be saved with a `[BRACKETED]` name while an admin is mid-edit,
   and that must render visibly inert rather than looking like a real person.

   ⚠️ NO INVENTED REVIEW TEXT EXISTS IN THIS REPOSITORY AND NONE MAY BE ADDED.
   Everything rendered here arrives as a prop from the CMS, which returns only
   published and consented quotes. */
function Quote({ item }: { item: Testimonial }) {
  return (
    <TestimonialCard
      body={<p className="text-heading-xs leading-relaxed text-ink">“{item.body}”</p>}
      caption={
        <>
          <span
            className="block font-mono text-body-xs text-ink"
            data-placeholder={isPlaceholder(item.name) ? '' : undefined}
          >
            {item.name}
          </span>
          <span className="mt-1 block font-mono text-body-xs text-ink-faint">{item.role}</span>
        </>
      }
    />
  );
}

export function TestimonialCarousel({ items }: { items: readonly Testimonial[] }) {
  const n = items.length;

  /* False through SSR and the first paint, true after hydration. Until then
     the track is a plain scroll-snap row — see the note on the viewport
     below — so a failed or slow script leaves every review reachable. */
  const [enhanced, setEnhanced] = useState(false);
  useEffect(() => setEnhanced(true), []);

  const isMid = useMediaQuery('(min-width: 40rem)');
  const isWide = useMediaQuery('(min-width: 64rem)');
  const perView = isWide ? 3 : isMid ? 2 : 1;

  /* 🔶 THERE IS NO `reduceMotion` QUERY HERE, UNLIKE `ProjectCarousel`, and
     that is not an omission. It needs one to switch its AUTOPLAY off; this has
     no autoplay to switch off, so the only motion is the slide a visitor just
     asked for — and `motion-reduce:transition-none` on the track (below) is
     the complete and correct response to that. Reading the query to ignore it
     would be a dependency nothing uses. */

  /* The furthest left the track may sit: the last review flush right. Zero
     when they all already fit, which is also when the controls go. */
  const maxIndex = Math.max(0, n - perView);
  const movable = enhanced && maxIndex > 0;

  const [index, setIndex] = useState(0);
  const swipeRef = useRef<{ x: number; y: number } | null>(null);

  const atStart = index <= 0;
  const atEnd = index >= maxIndex;

  /* Never leave the track parked past its last position — a wider window now
     fits more cards, or a review was unpublished. */
  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  const step = useCallback(
    (delta: number) => setIndex((i) => Math.min(Math.max(i + delta, 0), maxIndex)),
    [maxIndex],
  );

  const next = useCallback(() => step(1), [step]);
  const prev = useCallback(() => step(-1), [step]);
  const goTo = useCallback(
    (target: number) => setIndex(Math.min(Math.max(target, 0), maxIndex)),
    [maxIndex],
  );

  /* Tabbing onto a card that is out of view brings it into view, so keyboard
     order and visible order cannot disagree. */
  const revealCard = (i: number) => {
    if (!movable) return;
    if (i < index) goTo(i);
    else if (i >= index + perView) goTo(i - perView + 1);
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    /* Touch and pen only. A mouse drag across a paragraph is a TEXT SELECTION,
       and stealing it to change slides would make the quotes uncopyable. */
    if (event.pointerType === 'mouse') return;
    swipeRef.current = { x: event.clientX, y: event.clientY };
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = swipeRef.current;
    swipeRef.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    /* Horizontal intent only: a mostly-vertical drag is the page being
       scrolled past the section, not a swipe. */
    if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) next();
    else prev();
  };

  if (n === 0) return null;

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Buyer reviews"
      className="[--gap:1rem] [--per-view:1] mid:[--per-view:2] tablet:[--per-view:3]"
    >
      {/* THE VIEWPORT. Before hydration it is a real horizontally scrollable
          snap row; after, it clips and the track is moved by transform.
          `touch-pan-y` lets a vertical drag still scroll the page while a
          horizontal one is ours to interpret. */}
      <div
        className={cx(enhanced ? 'touch-pan-y overflow-hidden' : 'snap-x snap-mandatory overflow-x-auto')}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          swipeRef.current = null;
        }}
      >
        {/* Exactly one card per review, in CMS order — never sorted here.

            The step is pure CSS: each card is (100% − gaps) / per-view wide and
            the track moves by `index × (100% + gap) / per-view`, both
            percentages of the track's own width. Resizing the window therefore
            needs no JavaScript and no measuring. */}
        <ul
          aria-live="polite"
          className={cx(
            'flex gap-(--gap)',
            /* 🔴 `items-start` ON A PHONE, `items-stretch` FROM 640px, and the
               split is a real visual decision rather than tidying.

               Flex children stretch to the tallest by default, which is what
               the old grid did and what the desktop must keep — three cards of
               different heights in a visible row look broken. But at one card
               per view NOBODY SEES TWO CARDS AT ONCE, so stretching only
               inflates a short quote to the height of the longest one:
               measured, "Testing purpose" was rendered as a 482px card at
               320px to match the long review beside it, with its author
               stranded at the bottom of a mostly empty box.

               `items-start` lets each card be its own height on a phone. The
               TRACK is still as tall as the tallest card — that is unavoidable
               with a flex row, and it is also correct, since the section must
               not resize as you swipe. */
            'items-start mid:items-stretch',
            /* `motion-reduce:transition-none` is the whole of the reduced-motion
               handling here, and it is sufficient BECAUSE THERE IS NO AUTOPLAY
               to suppress — the arrows, dots and swipe all still work, the
               track simply jumps instead of sliding. */
            'transition-transform duration-700 ease-out-soft will-change-transform motion-reduce:transition-none',
          )}
          style={
            movable
              ? {
                  transform: `translate3d(calc(${index} * -1 * (100% + var(--gap)) / var(--per-view)), 0, 0)`,
                }
              : undefined
          }
        >
          {items.map((item, i) => (
            <li
              key={item.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${n}`}
              onFocus={() => revealCard(i)}
              className="flex snap-start *:w-full"
              style={{
                flex: '0 0 calc((100% - (var(--per-view) - 1) * var(--gap)) / var(--per-view))',
              }}
            >
              <Quote item={item} />
            </li>
          ))}
        </ul>
      </div>

      {/* Previous · one dot per position the track can stop at · next. Present
          only when the track can actually move, which is what keeps a desktop
          showing three-of-three as a plain static row. */}
      {movable ? (
        <div
          className="mt-8 flex items-center justify-center gap-3"
          role="group"
          aria-label="Review carousel controls"
          /* Arrow keys while a control has focus — the APG carousel pattern.
             Scoped to this group rather than the region so it cannot swallow
             Left/Right from anything else on the page. */
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') {
              event.preventDefault();
              prev();
            } else if (event.key === 'ArrowRight') {
              event.preventDefault();
              next();
            }
          }}
        >
          <button type="button" onClick={prev} disabled={atStart} className={ARROW}>
            <span className="visually-hidden">Previous review</span>
            <Icon name="arrowRight" size={16} className="rotate-180" />
          </button>

          <div className="flex items-center">
            {Array.from({ length: maxIndex + 1 }, (_, i) => {
              const active = i === index;
              const first = items[i];
              return (
                <button
                  key={first?.id ?? i}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-current={active ? 'true' : undefined}
                  className="inline-flex h-11 w-7 items-center justify-center"
                >
                  {/* Named by its author rather than by number alone: "Show the
                      review from rajesh" tells a screen-reader user what they
                      are about to get, which "slide 2" does not. */}
                  <span className="visually-hidden">
                    {perView === 1
                      ? `Show the review from ${first?.name} (${i + 1} of ${n})`
                      : `Show reviews from ${first?.name}`}
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
            <span className="visually-hidden">Next review</span>
            <Icon name="arrowRight" size={16} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
