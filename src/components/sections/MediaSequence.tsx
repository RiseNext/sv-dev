'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import type { Project } from '@/types/content';
import { cx } from '@/lib/cx';

/* =============================================================================
   MEDIA SEQUENCE — the project deck under "Why SV Developers".

   A deck of large rounded project pictures. Each card parks near the top of the
   viewport and the next one rises over it, so one project owns the screen at a
   time. Each picture is a link to its project's detail page.

   ─── THE SPLIT (1024px and up) ────────────────────────────────────────────
   A card rises with its picture CENTRED. Once it lands, the picture slides to
   one side and the project's description slides out from behind it towards
   the OTHER side — the two part like a pair of doors. Cards alternate: the
   first picture goes left (text right), the next goes right (text left), and
   so on, so the page zig-zags as you scroll.

   THE LAST CARD DOES NOT SPLIT, AND DOES NOT PARK. It is the end of the deck,
   so it rises over the one before it with its picture centred and the
   description already UNDERNEATH it — fading up as the card arrives — and the
   scroll after it lands carries straight on to the next section rather than
   holding for a split and a read.

   The final, split layout is what the CSS lays out. The centred starting state
   is a transform applied on top of it, in percentages of each element's own
   width, so no widths are measured to make the split work:

     picture  60% of the row, centred = shifted 33.333% of its own width
     text     36% of the row, centred = shifted 88.889% of its own width

   ─── BELOW 1024px ─────────────────────────────────────────────────────────
   There is no room beside the picture, so the card is one white card with the
   description underneath. The picture and the text still come in from
   OPPOSITE sides as the card rises — alternating per card — and meet in place.

   ─── WHY THIS RUNS ON SCROLL POSITION AND NOT ON TRANSITIONS ─────────────
   The stack itself is `position: sticky` — CSS does the holding. But a deck
   only feels like a deck if the card underneath *reacts* while it is being
   covered, and the split only feels attached to the page if it moves with the
   wheel. Toggling a class at a threshold gives a fixed-length animation that
   runs whether you scrolled 2px or 2000, which reads as a jump. So every value
   here is a pure function of scroll offset:

     enter  — how far THIS card has travelled into the viewport (0 → 1)
     open   — how far THIS card has split apart after landing (0 → 1)
     cover  — how far the NEXT card has travelled over this one (0 → 1)
     drift  — this card's whole passage, used for parallax inside the frame

   Scroll up and it all runs exactly backwards, because there is no state to
   unwind. Lenis (SmoothScroll.tsx) is what makes a scrubbed value glide
   rather than step.

   The reader is one passive scroll listener collapsed into a rAF, writing
   transforms and opacity on a handful of nodes — no layout is read in the
   loop; positions are measured once per resize. GSAP is not imported: nothing
   here needs a timeline.

   ─── DWELL ────────────────────────────────────────────────────────────────
   At 1024px and up each row carries a long bottom margin (70svh), which is
   scroll distance during which the card stays parked. The split happens in
   the first part of it and the rest is reading time before the next card
   arrives.

   The LAST row's margin (65svh) is not for the last card — a row's own
   margin can never make it park, because sticky keeps the whole MARGIN BOX
   inside the <ol>. It is for the card BEFORE it: that card stays parked only
   while its margin box fits inside the <ol>, and without room after the last
   card it would start scrolling away mid-handover, still half visible. 65svh
   holds it until the last card has landed at every height from 768px up
   (it is invisible by then, so holding it a little longer costs nothing).

   The <ol> is `flow-root` so that margin stays inside it rather than
   collapsing out through the list's bottom edge, and the section takes the
   same 65svh back with a negative bottom margin, so the gap to the next
   section is the page's normal section spacing and not that plus 65svh.

   DEGRADATION: everything above is enhancement. Without JS or under
   `prefers-reduced-motion`, `stacked` stays false — the deck never forms, no
   transform is written, and the cards are a plain column in their final
   layout: picture and description side by side, alternating.

   CONSTRAINT: no ancestor of a card may set `overflow: hidden` or a
   `transform` — either one silently kills sticky. The transforms below are all
   applied INSIDE the sticky element, never to it. (The stage's own
   `overflow-hidden` below 1024px is inside the sticky <li>, which is allowed.)
   ========================================================================== */

/* The card shape — exactly the fields read here. `ProjectCard` from the data
   layer satisfies it, so the page passes its project list straight in. */
type Item = Pick<Project, 'slug' | 'name' | 'category' | 'locality' | 'summary' | 'image'>;

/* Where a card parks, and how much lower each one parks than the last — the
   sliver of the card underneath is what makes the stack read as a deck. */
const STICK_REM = 5;
const DECK_REM = 0.75;

/* The split geometry — see the header. Change the widths in the markup and
   these change with them: ((100 - w) / 2) / w for each. */
const IMAGE_CENTRE_SHIFT = 33.333; // 60% wide
const TEXT_CENTRE_SHIFT = 88.889; // 36% wide

const SPLIT_QUERY = '(min-width: 64rem)';

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
/* smoothstep: kills the corner at both ends of a linear scrub. */
const ease = (n: number) => n * n * (3 - 2 * n);

/* Writes an opacity, and takes the node out of hit-testing once it is
   effectively invisible. An opacity-0 element still takes clicks: without
   this, a faded card's picture — or the "View project" link of text that has
   faded out — would catch a click in the empty space around the visible card
   and open a project the visitor cannot see. */
function fade(el: HTMLElement, value: number) {
  el.style.opacity = value >= 1 ? '' : value.toFixed(3);
  el.style.pointerEvents = value < 0.05 ? 'none' : '';
}

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
  const stageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const frameRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrimRefs = useRef<(HTMLDivElement | null)[]>([]);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* Enhancement is opt-in, and the opt-in happens after mount so the server
     HTML is the plain column. */
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setStacked(true);
  }, []);

  useEffect(() => {
    if (!stacked) return;

    const count = items.length;
    const splitQuery = window.matchMedia(SPLIT_QUERY);

    let frame = 0;
    let split = splitQuery.matches;
    let tops: number[] = [];
    let sticks: number[] = [];
    let viewport = 0;
    let frameHeight = 0;
    let openDistance = 1;

    const measure = () => {
      const rows = rowRefs.current.slice(0, count).filter(Boolean) as HTMLLIElement[];
      if (rows.length !== count) return false;
      split = splitQuery.matches;
      viewport = window.innerHeight;
      /* Read each parking offset off the element rather than recomputing the
         calc() — it stays correct if the deck's spacing is ever changed. */
      sticks = rows.map((row) => parseFloat(getComputedStyle(row).top) || 0);
      tops = rows.map(layoutTop);
      frameHeight = frameRefs.current[0]?.offsetHeight ?? viewport * 0.6;

      /* The split takes the first ~60% of the parked stretch (the dwell),
         leaving the rest as reading time before the next card shows up. The
         dwell is MEASURED — it depends on the viewport height, the card height
         and the row margin together, and one number would be wrong on at
         least one of the screens this has to work on. */
      const dwell =
        count > 1
          ? (tops[1] ?? 0) - viewport - ((tops[0] ?? 0) - (sticks[0] ?? 0))
          : viewport * 0.4;
      openDistance = Math.max(dwell * 0.6, 120);
      return true;
    };

    const update = () => {
      if (tops.length !== count) return;
      const scroll = window.scrollY;

      for (let i = 0; i < count; i += 1) {
        const stage = stageRefs.current[i];
        const frameEl = frameRefs.current[i];
        const image = imageRefs.current[i];
        const scrim = scrimRefs.current[i];
        const text = textRefs.current[i];
        if (!stage || !frameEl || !image || !scrim || !text) continue;

        const top = tops[i] ?? 0;
        const stick = sticks[i] ?? 0;
        const nextTop = tops[i + 1];
        const nextStick = sticks[i + 1] ?? stick;

        /* One card's whole arrival happens in the distance it covers between
           the bottom edge of the viewport and its parking slot. */
        const travel = Math.max(viewport - stick, 1);
        const enter = ease(clamp01((scroll - top + viewport) / travel));
        const cover =
          nextTop === undefined
            ? 0
            : ease(clamp01((scroll - nextTop + viewport) / Math.max(viewport - nextStick, 1)));

        const scale = 0.97 + 0.03 * enter - 0.07 * cover;
        stage.style.transform = `translate3d(0, ${(-40 * cover).toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;

        /* Parallax runs across the card's entire passage, so the photograph
           keeps moving during the long stretch where the frame is parked. */
        const drift = clamp01((scroll - top + viewport) / (viewport + frameHeight));
        image.style.transform = `translate3d(0, ${((drift - 0.5) * frameHeight * 0.14).toFixed(2)}px, 0)`;

        /* +1: picture ends on the LEFT, text on the right. -1: mirrored. */
        const side = i % 2 === 0 ? 1 : -1;
        /* The covered card's description goes first — it is gone by the time
           the incoming card is halfway up, so two blocks of copy never
           compete. */
        const textKeep = 1 - clamp01(cover / 0.45);

        if (split && i === count - 1) {
          /* The last card: centred, text underneath, no split. The text
             fades up in the second half of the card's rise, so it has fully
             arrived by the time the card lands. Nothing covers this card, so
             there is no fade-out to apply. */
          const reveal = ease(clamp01((enter - 0.4) / 0.6));
          frameEl.style.transform = '';
          text.style.transform = `translate3d(0, ${((1 - reveal) * 24).toFixed(2)}px, 0)`;
          fade(text, reveal);
          fade(stage, 1);
          scrim.style.opacity = '0';
        } else if (split) {
          /* Starts a little before the card lands, so arriving and opening
             read as one movement rather than stop-then-start. */
          const park = top - stick;
          const open = ease(clamp01((scroll - park + openDistance * 0.15) / openDistance));
          /* The text trails the picture slightly: it is still behind the
             picture for the first part of the move, and fades in as it
             comes out from under it. */
          const reveal = ease(clamp01((open - 0.15) / 0.85));

          frameEl.style.transform = `translate3d(${(side * (1 - open) * IMAGE_CENTRE_SHIFT).toFixed(3)}%, 0, 0)`;
          text.style.transform = `translate3d(${(-side * (1 - open) * TEXT_CENTRE_SHIFT).toFixed(3)}%, 0, 0)`;
          fade(text, reveal * textKeep);

          /* Alternating sides means the incoming card's text lands where the
             covered card's PICTURE is, so the covered card has to be fully
             gone by then — not left as the washed-out ghost the centred deck
             uses. The whole stage fades, shadow included.

             It is fully gone by the time the incoming card is 70% of the way
             up, so it never competes with the incoming card's own split. */
          fade(stage, 1 - ease(clamp01((cover - 0.15) / 0.55)));
          scrim.style.opacity = '0';
        } else {
          /* Picture from one side, text from the other, meeting in place as
             the card finishes rising. The stage clips both, so neither pokes
             out past the card's rounded edge on the way in. */
          const arrive = ease(clamp01((enter - 0.3) / 0.7));
          frameEl.style.transform = `translate3d(${(-side * (1 - arrive) * 8).toFixed(3)}%, 0, 0)`;
          text.style.transform = `translate3d(${(side * (1 - arrive) * 12).toFixed(3)}%, 0, 0)`;
          fade(text, arrive * textKeep);

          /* The centred deck keeps its original treatment: the covered card
             washes out into the page (never down into shadow — a dark scrim
             on this palette is a grey slab) and stays as a pale sliver. */
          fade(stage, 1);
          scrim.style.opacity = (0.62 * cover).toFixed(3);
        }
      }
    };

    /* Hands every node back to the stylesheet on teardown. */
    const reset = () => {
      for (let i = 0; i < count; i += 1) {
        for (const el of [
          stageRefs.current[i],
          frameRefs.current[i],
          imageRefs.current[i],
          textRefs.current[i],
        ]) {
          if (el) el.style.transform = '';
        }
        const scrim = scrimRefs.current[i];
        if (scrim) scrim.style.opacity = '';
        for (const el of [stageRefs.current[i], textRefs.current[i]]) {
          if (!el) continue;
          el.style.opacity = '';
          el.style.pointerEvents = '';
        }
      }
    };

    const sync = () => {
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
    window.addEventListener('orientationchange', sync);
    window.addEventListener('load', sync);
    splitQuery.addEventListener('change', sync);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', sync);
      window.removeEventListener('orientationchange', sync);
      window.removeEventListener('load', sync);
      splitQuery.removeEventListener('change', sync);
      reset();
    };
  }, [stacked, items.length]);

  if (items.length === 0) return null;

  const count = String(items.length).padStart(2, '0');

  return (
    <section
      className={cx(
        'mt-10 px-gutter tablet:mt-14',
        /* Gives back the last row's 65svh — see DWELL in the header. */
        stacked && 'tablet:mb-[-65svh]',
      )}
      aria-label="Our layouts"
    >
      <ol className="container-page flow-root">
        {items.map((item, index) => {
          const href = `/projects/${item.slug}`;
          const imageLeft = index % 2 === 0;
          /* The last card is laid out picture-over-text at every width and
             never splits — see the header. */
          const isLast = index === items.length - 1;

          return (
            <li
              key={item.slug}
              ref={(node) => {
                rowRefs.current[index] = node;
              }}
              style={stacked ? { top: `calc(${STICK_REM}rem + ${index * DECK_REM}rem)` } : undefined}
              /* Two exclusive sets rather than one set plus overrides, so which
                 bottom margin wins never depends on Tailwind's output order. */
              className={
                stacked
                  ? 'sticky mb-[16svh] last:mb-0 tablet:mb-[70svh] tablet:last:mb-[65svh]'
                  : 'mb-10 last:mb-0 tablet:mb-16 tablet:last:mb-0'
              }
            >
              {/* The transform lives on this wrapper, never on the sticky <li>.

                  Below 1024px it is the white card holding picture and text;
                  from 1024px up it is a transparent row the two sit in side by
                  side — or, for the last card, one above the other. */}
              <div
                ref={(node) => {
                  stageRefs.current[index] = node;
                }}
                className={cx(
                  /* `max-tablet:theme-light`: below 1024px this is a white card,
                     so its text needs the dark light-theme tokens. From 1024px
                     up it is transparent and its text sits straight on the
                     green field, so it keeps the field's light type. */
                  'max-tablet:theme-light',
                  'relative flex flex-col overflow-hidden rounded-band bg-surface p-2 will-change-transform',
                  'shadow-[0_40px_90px_-45px_rgba(7,5,3,0.45)]',
                  'tablet:overflow-visible tablet:rounded-none tablet:bg-transparent tablet:p-0 tablet:shadow-none',
                  !isLast && 'tablet:block tablet:h-[min(66svh,36rem)]',
                )}
              >
                {/* THE PICTURE IS A LINK, but a pointer-only one: it goes to the
                    same place as "View project" in the text, and two tab stops
                    for one destination is noise for a keyboard or screen-reader
                    user. `tabIndex={-1}` takes it out of the tab order and
                    `aria-hidden` out of the accessibility tree; the text link
                    is the one they get. */}
                <Link
                  ref={(node) => {
                    frameRefs.current[index] = node;
                  }}
                  href={href}
                  tabIndex={-1}
                  aria-hidden="true"
                  className={cx(
                    'group relative z-10 block h-[min(42svh,20rem)] w-full overflow-hidden rounded-4xl bg-surface will-change-transform',
                    'tablet:w-[60%] tablet:rounded-band tablet:shadow-[0_40px_90px_-45px_rgba(7,5,3,0.45)]',
                    isLast
                      ? /* A little shorter than the others, so the picture
                           AND the text beneath it fit on a 900px-tall screen
                           once the card has landed. */
                        'tablet:mx-auto tablet:h-[min(56svh,32rem)]'
                      : cx(
                          'tablet:absolute tablet:inset-y-0 tablet:h-full',
                          imageLeft ? 'tablet:left-0' : 'tablet:right-0',
                        ),
                  )}
                >
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
                      sizes="(min-width: 1400px) 840px, (min-width: 1024px) 60vw, 100vw"
                      className={cx(
                        'object-cover transition-transform duration-700 ease-out-soft',
                        'group-hover:scale-[1.03] motion-reduce:transition-none',
                      )}
                    />
                  </div>

                  <div
                    ref={(node) => {
                      scrimRefs.current[index] = node;
                    }}
                    className="pointer-events-none absolute inset-0 bg-bg opacity-0"
                  />

                  {/* Says the picture is clickable, on hover only — touch has
                      the text link right underneath it. */}
                  <span
                    className={cx(
                      'theme-light absolute bottom-5 left-5 inline-flex items-center gap-1.5 rounded-pill bg-surface/90 px-4 py-2',
                      'text-body-sm font-medium text-ink backdrop-blur-[13px]',
                      'translate-y-1 opacity-0 transition-[opacity,translate] duration-300 ease-out-soft',
                      'group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:transition-none',
                    )}
                  >
                    View project
                    <Icon name="arrowRight" size={15} />
                  </span>
                </Link>

                <div
                  ref={(node) => {
                    textRefs.current[index] = node;
                  }}
                  className={cx(
                    'flex flex-col px-4 pb-4 pt-5 will-change-transform tablet:p-0',
                    isLast
                      ? /* Under the picture, on its width. From 1280px the
                           name and the summary sit side by side, which keeps
                           the whole card short enough to see in one view. */
                        'tablet:mx-auto tablet:mt-8 tablet:w-[60%] desktop:grid desktop:grid-cols-2 desktop:items-start desktop:gap-x-12'
                      : cx(
                          'tablet:absolute tablet:inset-y-0 tablet:w-[36%] tablet:justify-center',
                          imageLeft ? 'tablet:right-0' : 'tablet:left-0',
                        ),
                  )}
                >
                  <div>
                    <p className="label-mono font-mono">
                      {String(index + 1).padStart(2, '0')} / {count} · {item.category}
                    </p>
                    <h3 className="mt-3 text-heading-md text-ink tablet:mt-5">{item.name}</h3>
                    <p className="mt-2 inline-flex items-center gap-1.5 font-mono text-body-xs text-ink-faint">
                      <Icon name="mapPin" size={13} />
                      {item.locality}
                    </p>
                  </div>
                  <div className="flex flex-col">
                    {/* Dropped on a very short screen (a phone on its side),
                        where the card would otherwise be taller than the space
                        it parks in. Name, place and link still carry it.

                        Rendered only when present: a type is not a runtime
                        guarantee across the network, and an unsaved field
                        should leave no empty gap in the card. */}
                    {item.summary ? (
                      <p
                        className={cx(
                          'mt-4 line-clamp-3 text-body-md text-ink-soft',
                          'tablet:mt-6 tablet:text-body-lg',
                          /* Beside the name from 1280px, so it lines up with
                             the label rather than sitting a gap below it. */
                          isLast ? 'desktop:mt-0' : 'tablet:line-clamp-5',
                          '[@media(max-height:32rem)]:hidden',
                        )}
                      >
                        {item.summary}
                      </p>
                    ) : null}
                    <Link
                      href={href}
                      className={cx(
                        'mt-4 inline-flex min-h-11 items-center gap-1.5 self-start text-body-sm font-medium text-ink',
                        'transition-[gap] duration-300 hover:gap-3',
                        isLast ? 'tablet:mt-4' : 'tablet:mt-6',
                      )}
                    >
                      View project
                      <span className="visually-hidden">: {item.name}</span>
                      <Icon name="arrowRight" size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
