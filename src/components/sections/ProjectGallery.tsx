'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/cx';
import type { ImageRef } from '@/types/content';

/* =============================================================================
   PROJECT GALLERY — the project template's row of photo tiles with a round
   arrow at each end.

   A native horizontal scroller with snap points, so a phone swipes it and a
   trackpad scrolls it with no JavaScript at all. The arrows are the
   enhancement: each moves one tile, and each hides at its own end. When every
   photo already fits (four or fewer on a desktop) there is nothing to scroll,
   and the arrows are not rendered.

   Four tiles in view from 1024px, three from 640px, and on a phone one and a
   half — the half is the cue that the row scrolls.
   ========================================================================== */

export function ProjectGallery({ images, name }: { images: readonly ImageRef[]; name: string }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [canBack, setCanBack] = useState(false);
  const [canForward, setCanForward] = useState(false);

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanBack(el.scrollLeft > 4);
    setCanForward(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    sync();
    el.addEventListener('scroll', sync, { passive: true });
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(sync) : null;
    ro?.observe(el);
    return () => {
      el.removeEventListener('scroll', sync);
      ro?.disconnect();
    };
  }, [sync]);

  const step = (direction: 1 | -1) => {
    const el = trackRef.current;
    const tile = el?.firstElementChild as HTMLElement | null;
    if (!el || !tile) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    el.scrollBy({ left: direction * (tile.offsetWidth + gap), behavior: 'smooth' });
  };

  const scrolls = canBack || canForward;
  const arrow = cx(
    'absolute top-1/2 z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full',
    'border border-line-strong bg-surface text-ink shadow-[0_8px_20px_-12px_rgba(26,43,40,0.5)]',
    'transition-opacity duration-200 hover:bg-bg disabled:pointer-events-none disabled:opacity-0 tablet:flex',
  );

  return (
    <div className="relative tablet:px-14">
      {scrolls ? (
        <button type="button" onClick={() => step(-1)} disabled={!canBack} className={cx(arrow, 'left-0')}>
          <span className="visually-hidden">Previous photos</span>
          <Icon name="arrowRight" size={18} className="rotate-180" />
        </button>
      ) : null}

      <ul
        ref={trackRef}
        aria-label={`Photographs of ${name}`}
        className={cx(
          'flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain',
          '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        )}
      >
        {images.map((image, index) => (
          <li
            key={image.src}
            className="relative aspect-4/3 shrink-0 basis-[72%] snap-start overflow-hidden rounded-2xl bg-surface mid:basis-[calc((100%-2rem)/3)] tablet:basis-[calc((100%-3rem)/4)]"
          >
            <Image
              src={image.src}
              alt={image.alt || `${name} — photograph ${index + 1}`}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 72vw"
              className="object-cover"
            />
          </li>
        ))}
      </ul>

      {scrolls ? (
        <button type="button" onClick={() => step(1)} disabled={!canForward} className={cx(arrow, 'right-0')}>
          <span className="visually-hidden">Next photos</span>
          <Icon name="arrowRight" size={18} />
        </button>
      ) : null}
    </div>
  );
}
