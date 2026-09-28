'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/cx';
import type { ImageRef } from '@/types/content';

/* =============================================================================
   PROJECT PHOTO FRAME — the picture half of a project card, with arrows.

   One project's own photographs, stepped through IN PLACE. Nothing leaves the
   frame: no overlay, no full-screen viewer, no growing card. The white card
   around it keeps exactly the height and the radius it had with a single
   photograph, so a card with five photographs and a card with one sit at the
   same size in the column.

   ─── WHAT IT SHOWS ────────────────────────────────────────────────────────
   Whatever it is handed, in order, and only that. The caller composes the set
   (see MediaSequence: the card photograph, then that project's site
   photography) — this component never reaches for an image of its own, so a
   card can never show a neighbouring project's land.

   ─── THE PICTURE IS STILL A LINK ──────────────────────────────────────────
   It goes where "View project" goes, and it keeps the `tabIndex={-1}` /
   `aria-hidden` treatment it had in the card: two tab stops for one
   destination is noise. The arrows and dots are REAL buttons above it — they
   are the keyboard's way through the set, and because they sit over the link
   rather than inside it, pressing one never navigates.

   ─── A SWIPE MUST NOT FOLLOW THE LINK ─────────────────────────────────────
   A horizontal drag that ends on the picture still fires a click, and that
   click would open the project when all the visitor did was ask for the next
   photograph. So a recognised swipe arms `swiped`, and the capture-phase
   handler below eats the click that follows it.

   ─── ONLY WHAT HAS BEEN REACHED IS LOADED ─────────────────────────────────
   Every slide is in the track from the start — the step is `index × -100%`, so
   a missing slide would put the arithmetic out — but the <Image> inside it is
   mounted only once that slide is the current one or next to it. The home page
   therefore costs one extra photograph per card rather than all of them, and
   the first press of an arrow still has its picture ready.
   ========================================================================== */

/** A drag shorter than this is a tap, not a swipe. */
const SWIPE_PX = 40;

/* Round white buttons ON the photograph: they have to read against a bright
   sky and against dark soil in the same picture, which is why they are a
   near-solid disc rather than a tint of it. */
const ARROW = cx(
  'absolute top-1/2 z-10 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full',
  'bg-surface/85 text-ink shadow-[0_10px_24px_-14px_rgba(43,32,16,0.9)] backdrop-blur-sm',
  'transition-colors duration-200 hover:bg-surface motion-reduce:transition-none tablet:size-11',
);

type Props = {
  /** The whole set for ONE project, in the order it should be stepped. */
  images: readonly ImageRef[];
  /** The project's name — the accessible label for every control here. */
  name: string;
  /** Where the picture goes when it is clicked. */
  href: string;
  /** The frame itself: its size, its radius and where it sits in the card.
   *  Owned by the card, not by this component. */
  className?: string;
  sizes?: string;
};

export function ProjectPhotoFrame({ images, name, href, className, sizes = '100vw' }: Props) {
  const count = images.length;

  const [index, setIndex] = useState(0);

  /* The controls do nothing without JavaScript, so they are not rendered until
     there is some: the server sends the first photograph and nothing else. */
  const [enhanced, setEnhanced] = useState(false);
  useEffect(() => setEnhanced(true), []);

  /* Which slides have a picture mounted. The one after the first is mounted
     from the start so the first arrow press is instant; both neighbours follow
     as the visitor moves. */
  const [shown, setShown] = useState<readonly number[]>(() => (count > 1 ? [0, 1] : [0]));

  useEffect(() => {
    if (count < 2) return;
    setShown((prev) => {
      const wanted = [index, (index + 1) % count, (index + count - 1) % count];
      const missing = wanted.filter((i) => !prev.includes(i));
      return missing.length > 0 ? [...prev, ...missing] : prev;
    });
  }, [index, count]);

  /* Wraps, deliberately. With two or three photographs a disabled arrow is the
     more common state than a working one, and there is no "end" to protect
     here the way there is in a carousel of separate projects. */
  const step = useCallback(
    (delta: number) => setIndex((i) => (i + delta + count) % count),
    [count],
  );

  const swipe = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    swiped.current = false;
    if (event.pointerType === 'mouse') return;
    swipe.current = { x: event.clientX, y: event.clientY };
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = swipe.current;
    swipe.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(dy)) return;
    swiped.current = true;
    step(dx < 0 ? 1 : -1);
  };

  if (count === 0) return null;

  const movable = enhanced && count > 1;

  return (
    <div
      className={cx('relative overflow-hidden bg-surface', movable && 'touch-pan-y', className)}
      role={movable ? 'group' : undefined}
      aria-roledescription={movable ? 'carousel' : undefined}
      aria-label={movable ? `Photographs of ${name}` : undefined}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        swipe.current = null;
      }}
      /* The click that a swipe leaves behind — see the header. */
      onClickCapture={(event) => {
        if (!swiped.current) return;
        swiped.current = false;
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      {/* Keyed with the index as well as the src: a CMS gallery that happens to
          list the same photograph twice must not collide. */}
      <ul
        className={cx(
          'absolute inset-0 flex transition-transform duration-500 ease-out-soft',
          'will-change-transform motion-reduce:transition-none',
        )}
        style={{ transform: `translate3d(${index * -100}%, 0, 0)` }}
      >
        {images.map((image, i) => (
          <li key={`${image.src}-${i}`} className="relative h-full w-full shrink-0">
            {shown.includes(i) ? (
              <Image
                src={image.src}
                alt={image.alt || `${name} — photograph ${i + 1}`}
                fill
                sizes={sizes}
                className="object-cover"
              />
            ) : null}
          </li>
        ))}
      </ul>

      <Link href={href} tabIndex={-1} aria-hidden="true" className="absolute inset-0" />

      {movable ? (
        <>
          <button
            type="button"
            onClick={() => step(-1)}
            className={cx(ARROW, 'left-3 tablet:left-4')}
          >
            <span className="visually-hidden">Previous photograph of {name}</span>
            <Icon name="arrowRight" size={18} className="rotate-180" />
          </button>

          <button
            type="button"
            onClick={() => step(1)}
            className={cx(ARROW, 'right-3 tablet:right-4')}
          >
            <span className="visually-hidden">Next photograph of {name}</span>
            <Icon name="arrowRight" size={18} />
          </button>

          {/* The dots sit in their own pill so they stay legible over a pale
              sky. The strip around them lets clicks THROUGH to the picture —
              only the pill itself takes them. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex justify-center">
            <div className="pointer-events-auto flex items-center rounded-pill bg-ink/35 px-1.5 backdrop-blur-sm">
              {images.map((image, i) => {
                const active = i === index;
                return (
                  <button
                    key={`${image.src}-${i}`}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-current={active ? 'true' : undefined}
                    className="inline-flex h-8 w-5 items-center justify-center"
                  >
                    <span className="visually-hidden">
                      Show photograph {i + 1} of {count}
                    </span>
                    <span
                      aria-hidden="true"
                      className={cx(
                        'block h-1.5 rounded-full transition-all duration-300 ease-out-soft',
                        'motion-reduce:transition-none',
                        active ? 'w-5 bg-surface' : 'w-1.5 bg-surface/55',
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* What changed, for a screen reader: the arrows move a picture, and
              a picture announces nothing on its own. */}
          <p aria-live="polite" className="visually-hidden">
            Photograph {index + 1} of {count}
          </p>
        </>
      ) : null}
    </div>
  );
}
