'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/cx';
import type { ImageRef } from '@/types/content';

/* =============================================================================
   PROJECT PHOTOGRAPHS — the mosaic, and the viewer it opens.

   ─── WHY A MOSAIC, NOT A ROW ──────────────────────────────────────────────
   Site photography is the evidence on a land page: the road actually laid, the
   gate actually built, the plantation actually grown. A row of equal tiles
   scrolling sideways gives every photograph the same postage-stamp weight and
   hides most of them off the right-hand edge. The mosaic gives the first
   photograph four times the area and keeps the rest on screen, so the set reads
   as a wall rather than as a queue.

   Rows are a FIXED height (`auto-rows-*`) and every tile covers its box. That is
   the whole layout: the lead tile spans two columns and two rows, so it is
   exactly (2 rows + one gap) tall at every width with no aspect-ratio
   arithmetic to get wrong when the column count changes.

   ─── THE VIEWER ───────────────────────────────────────────────────────────
   Any tile opens the photograph full screen, CONTAINED — a site photo cropped
   to fit loses the thing it is evidence of. From there the arrows, the keyboard
   and a swipe move through the whole set rather than closing and reopening.
   Escape closes, the page behind is locked, and focus returns to the tile that
   was opened.
   ========================================================================== */

/** A drag shorter than this is a tap, not a swipe. */
const SWIPE_PX = 40;

const BAR_BUTTON =
  'inline-flex min-h-11 items-center gap-2 rounded-pill bg-white/12 px-4 text-body-sm text-white transition-colors hover:bg-white/20';

/* ---------------------------------------------------------------------------
   HOW MANY PHOTOGRAPHS THERE ARE CHANGES THE LAYOUT, and it has to: a lead
   tile spanning two columns of four is only a lead tile when there is
   something beside it. With one photograph it left three-quarters of the row
   empty, and with two it left a quarter.

     one    · one banner, the full width of the grid
     two    · stacked on a phone, side by side from 1024px
     three+ · the mosaic — a lead tile at 2×2, the rest at 1×1

   The CMS decides which of the three this project gets, by how many site
   photographs it holds. No case leaves a hole in the grid.
   ------------------------------------------------------------------------ */
function span(count: number, index: number): string {
  if (count === 1) return 'col-span-2 row-span-2 tablet:col-span-4 tablet:row-span-3';
  if (count === 2) return 'col-span-2 row-span-2';
  return index === 0 ? 'col-span-2 row-span-2' : '';
}

function sizes(count: number, index: number): string {
  if (count === 1) return '100vw';
  if (count === 2 || index === 0) return '(min-width: 1024px) 50vw, 100vw';
  return '(min-width: 1024px) 25vw, 50vw';
}

export function ProjectPhotos({ images, name }: { images: readonly ImageRef[]; name: string }) {
  const count = images.length;
  const [open, setOpen] = useState<number | null>(null);
  const isOpen = open !== null;

  const tiles = useRef<(HTMLButtonElement | null)[]>([]);
  const closeRef = useRef<HTMLButtonElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);

  const step = useCallback(
    (delta: number) => setOpen((i) => (i === null ? i : (i + delta + count) % count)),
    [count],
  );

  /* Focus goes back to the tile the visitor opened, not to the top of the page —
     otherwise closing the viewer loses their place entirely. */
  const close = useCallback(() => {
    if (open !== null) tiles.current[open]?.focus();
    setOpen(null);
  }, [open]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.dataset.scrollLocked = 'true';
    return () => {
      delete document.body.dataset.scrollLocked;
    };
  }, [isOpen]);

  /* Focus moves to the close button ONCE, when the viewer opens. Keyed on
     `isOpen` and not on the index, so arrowing to the next photograph does not
     snatch focus back off the arrow being pressed. */
  useEffect(() => {
    if (isOpen) closeRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      else if (event.key === 'ArrowRight') step(1);
      else if (event.key === 'ArrowLeft') step(-1);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, step, close]);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
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
    step(dx < 0 ? 1 : -1);
  };

  if (count === 0) return null;

  /* One object rather than a loose index and image: it carries the "the viewer
     is open" narrowing into the markup below, where `open + 1` is the counter. */
  const current = open === null ? undefined : images[open];
  const viewer = open !== null && current ? { index: open, image: current } : null;

  return (
    <>
      <ul
        className={cx(
          'grid auto-rows-34 grid-cols-2 gap-3',
          'mid:auto-rows-44 tablet:auto-rows-52 tablet:grid-cols-4',
        )}
      >
        {/* Keyed with the index as well as the src: a CMS gallery that happens to
            list the same photograph twice must not collide. */}
        {images.map((image, index) => (
          <li key={`${image.src}-${index}`} className={span(count, index)}>
            <button
              ref={(el) => {
                tiles.current[index] = el;
              }}
              type="button"
              onClick={() => setOpen(index)}
              className="group relative block size-full overflow-hidden rounded-2xl bg-surface"
            >
              <Image
                src={image.src}
                alt={image.alt || `${name} — photograph ${index + 1}`}
                fill
                sizes={sizes(count, index)}
                className="object-cover transition-transform duration-500 ease-out-soft group-hover:scale-[1.04] motion-reduce:transition-none"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-umber/0 transition-colors duration-300 group-hover:bg-umber/20 motion-reduce:transition-none"
              />
              <span
                aria-hidden="true"
                className={cx(
                  'absolute bottom-3 right-3 inline-flex size-9 items-center justify-center rounded-full',
                  'bg-surface/90 text-ink opacity-0 transition-opacity duration-300',
                  'group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none',
                )}
              >
                <Icon name="zoomIn" size={16} />
              </span>
              <span className="visually-hidden">
                Open photograph {index + 1} of {count}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {viewer ? (
        /* `theme-light` keeps `bg-ink` the espresso it is written as, whatever
           section theme the viewer was opened from; `on-dark` turns the focus
           ring white for the controls on it. Same pair as Lightbox. */
        <div
          className="theme-light on-dark fixed inset-0 z-200 flex flex-col gap-3 bg-ink/95 p-4 tablet:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`Photographs of ${name}`}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            swipe.current = null;
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div className="flex shrink-0 items-center justify-between gap-3">
            <p className="font-mono text-body-xs uppercase tracking-[0.08em] text-white/75">
              {viewer.index + 1} / {count}
            </p>
            <button ref={closeRef} type="button" className={BAR_BUTTON} onClick={close}>
              <Icon name="close" size={20} />
              <span className="visually-hidden">Close</span>
            </button>
          </div>

          {/* Contained, never cropped — the reason the viewer exists. */}
          <div className="relative min-h-0 flex-1">
            <Image
              src={viewer.image.src}
              alt={viewer.image.alt || `${name} — photograph ${viewer.index + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          <div className="flex shrink-0 items-center justify-between gap-4">
            <button
              type="button"
              className={BAR_BUTTON}
              onClick={() => step(-1)}
              disabled={count < 2}
            >
              <Icon name="arrowRight" size={18} className="rotate-180" />
              <span className="visually-hidden">Previous photograph</span>
            </button>

            {viewer.image.alt ? (
              <p className="min-w-0 text-center text-body-sm text-white/85">{viewer.image.alt}</p>
            ) : null}

            <button
              type="button"
              className={BAR_BUTTON}
              onClick={() => step(1)}
              disabled={count < 2}
            >
              <span className="visually-hidden">Next photograph</span>
              <Icon name="arrowRight" size={18} />
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
