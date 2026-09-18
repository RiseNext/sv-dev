'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { ImageRef } from '@/types/content';
import { cx } from '@/lib/cx';

/* =============================================================================
   MEDIA SEQUENCE — the reference's second band (PRD §2.6, row 2).

   A deck of large rounded media cards, and nothing else. Each card parks near
   the top of the viewport and the next one rises over it, so one card owns the
   screen at a time. The pictures carry this section on their own: the
   statement above it has already said what it is about, and the specifications
   are listed in full on /amenities.

   WHY THIS RUNS ON SCROLL POSITION AND NOT ON TRANSITIONS
   The stack itself is `position: sticky` — CSS does the holding. But a deck
   only feels like a deck if the card underneath *reacts* while it is being
   covered. Toggling a class at a threshold gives you a fixed-length animation
   that runs whether you scrolled 2px or 2000, which reads as a jump. So every
   value here is a pure function of scroll offset:

     cover  — how far the NEXT card has travelled over this one (0 → 1)
     enter  — how far THIS card has travelled into the viewport (0 → 1)
     drift  — this card's whole passage, used for parallax inside the frame

   From those: the covered card sinks, scales down and washes out into the page
   (never down into shadow — a dark scrim on this palette is a grey slab, and
   the design carries no dark bands), while the photograph inside each frame
   moves slower than the frame itself. Scroll up and it all runs exactly
   backwards, because there is no state to unwind.

   The reader is one passive scroll listener collapsed into a rAF, writing
   transforms on a handful of nodes — no layout is read in the loop, positions
   are measured once per resize. GSAP is not imported: nothing here needs a
   timeline.

   DEGRADATION: everything above is enhancement. Without JS, under
   `prefers-reduced-motion`, or below 1024px, `stacked` stays false — the deck
   never forms and the cards are a plain column. That is why the stacking class
   comes from state rather than being written into the markup.

   CONSTRAINT: no ancestor of a card may set `overflow: hidden` or a
   `transform` — either one silently kills sticky. The transforms below are all
   applied INSIDE the sticky element, never to it.
   ========================================================================== */

type Item = {
  /** Not rendered — the stable key for the card, and its alt text's subject. */
  title: string;
  image: ImageRef;
};

/* Where a card parks, and how much lower each one parks than the last — the
   sliver of the card underneath is what makes the stack read as a deck. */
const STICK_REM = 5;
const DECK_REM = 0.75;

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
/* smoothstep: kills the corner at both ends of a linear scrub. */
const ease = (n: number) => n * n * (3 - 2 * n);

/* Sticky shifts an element's painted box but not its layout box, and
   `offsetTop` reports the layout box — which is exactly the number this needs.
   `getBoundingClientRect()` would report the shifted one and the whole scrub
   would drift as soon as the first card stuck. */
function layoutTop(el: HTMLElement) {
  let top = 0;
  let node: HTMLElement | null = el;
  while (node) {
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return top;
}

export function MediaSequence({ items }: { items: readonly Item[] }) {
  const [stacked, setStacked] = useState(false);

  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrimRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* Enhancement is opt-in, and the opt-in happens after mount so the server
     HTML is the plain column. */
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setStacked(true);
  }, []);

  useEffect(() => {
    if (!stacked) return;

    const desktop = window.matchMedia('(min-width: 64rem)');
    const count = items.length;

    let frame = 0;
    let live = false;
    let tops: number[] = [];
    let viewport = 0;
    let stick = 0;
    let cardHeight = 0;

    const measure = () => {
      const rows = rowRefs.current.slice(0, count).filter(Boolean) as HTMLLIElement[];
      if (rows.length !== count) return false;
      viewport = window.innerHeight;
      stick = parseFloat(getComputedStyle(document.documentElement).fontSize) * STICK_REM;
      cardHeight = cardRefs.current[0]?.offsetHeight ?? viewport * 0.78;
      tops = rows.map(layoutTop);
      return true;
    };

    const update = () => {
      if (!live || tops.length !== count) return;
      const scroll = window.scrollY;
      /* One card's whole handover happens in the distance the incoming card
         covers between the bottom edge of the viewport and its parking slot. */
      const travel = Math.max(viewport - stick, 1);

      for (let i = 0; i < count; i += 1) {
        const card = cardRefs.current[i];
        const scrim = scrimRefs.current[i];
        const image = imageRefs.current[i];
        if (!card || !scrim || !image) continue;

        const top = tops[i] ?? 0;
        const nextTop = tops[i + 1];
        const cover =
          nextTop === undefined ? 0 : ease(clamp01((scroll - nextTop + viewport) / travel));
        const enter = ease(clamp01((scroll - top + viewport) / travel));

        const scale = 0.97 + 0.03 * enter - 0.07 * cover;
        card.style.transform = `translate3d(0, ${(-40 * cover).toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
        scrim.style.opacity = (0.62 * cover).toFixed(3);

        /* Parallax runs across the card's entire passage, so the photograph
           keeps moving during the long stretch where the frame is parked. */
        const drift = clamp01((scroll - top + viewport) / (viewport + cardHeight));
        image.style.transform = `translate3d(0, ${((drift - 0.5) * cardHeight * 0.14).toFixed(2)}px, 0)`;
      }
    };

    /* Hands every node back to the stylesheet — used on teardown and whenever
       the viewport drops below the breakpoint the deck needs. */
    const reset = () => {
      for (let i = 0; i < count; i += 1) {
        const card = cardRefs.current[i];
        const image = imageRefs.current[i];
        const scrim = scrimRefs.current[i];
        if (card) card.style.transform = '';
        if (image) image.style.transform = '';
        if (scrim) scrim.style.opacity = '';
      }
    };

    const sync = () => {
      live = desktop.matches;
      if (!live) {
        reset();
        return;
      }
      if (measure()) update();
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };

    sync();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', sync);
    window.addEventListener('load', sync);
    desktop.addEventListener('change', sync);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', sync);
      window.removeEventListener('load', sync);
      desktop.removeEventListener('change', sync);
      reset();
    };
  }, [stacked, items.length]);

  return (
    <section
      className="mt-16 px-gutter tablet:mt-28"
      aria-label="What is already built before a plot is released"
    >
      <ol className="container-page">
        {items.map((item, index) => (
          <li
            key={item.title}
            ref={(node) => {
              rowRefs.current[index] = node;
            }}
            style={stacked ? { top: `calc(${STICK_REM}rem + ${index * DECK_REM}rem)` } : undefined}
            className={cx('mb-14', stacked && 'tablet:sticky tablet:mb-[26svh] tablet:last:mb-0')}
          >
            {/* The transform lives on this wrapper, never on the sticky <li>. */}
            <div
              ref={(node) => {
                cardRefs.current[index] = node;
              }}
              className="relative mx-auto aspect-[4/5] w-full will-change-transform tablet:aspect-auto tablet:h-[min(66svh,36rem)] tablet:max-w-[58rem]"
            >
              <div className="relative h-full w-full overflow-hidden rounded-band bg-surface shadow-[0_40px_90px_-45px_rgba(7,5,3,0.45)]">
                {/* Overscanned so the parallax never exposes an edge. */}
                <div
                  ref={(node) => {
                    imageRefs.current[index] = node;
                  }}
                  className="absolute inset-x-0 -inset-y-[9%] will-change-transform"
                >
                  <Image
                    src={item.image.src}
                    alt={item.image.alt}
                    fill
                    sizes="(min-width: 1024px) 58rem, 100vw"
                    className="object-cover"
                  />
                </div>

                <div
                  ref={(node) => {
                    scrimRefs.current[index] = node;
                  }}
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-bg opacity-0"
                />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
