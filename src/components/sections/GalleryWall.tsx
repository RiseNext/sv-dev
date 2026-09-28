'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/cx';

/* =============================================================================
   GALLERY WALL — /gallery

   Every photograph the CMS holds for every project, on one page. The photos
   are the `gallery` array on each project record plus its cover image; the
   page that renders this collects them (see app/gallery/page.tsx), so nothing
   here knows how many projects or photos there are.

   ─── WHY COLUMNS, NOT A GRID ──────────────────────────────────────────────
   The photographs are a mix of landscape and portrait at whatever aspect the
   camera gave them. A `grid` with a fixed tile ratio would have to CROP them,
   and a cropped site photo loses the very thing it is evidence of — the road
   running to the end of the layout, the height of the gate. CSS multi-column
   with `break-inside-avoid` gives a masonry wall where every photo keeps its
   own shape and nothing is cut.

   ─── THE VIEWER ───────────────────────────────────────────────────────────
   Any tile opens the photo full screen, and from there the arrows, the
   keyboard and a swipe move through the WHOLE filtered set rather than
   closing and reopening. Escape closes, focus returns to the tile that was
   clicked, and the page behind is locked from scrolling.

   ─── FILTERING ────────────────────────────────────────────────────────────
   Pills in the catalogue's own idiom, one per project, built from the data —
   a project with no photographs never gets a pill. Changing the filter closes
   the viewer, because the photo it was showing may no longer be on the wall.
   ========================================================================== */

export type GalleryPhoto = {
  src: string;
  alt: string;
  width: number;
  height: number;
  projectSlug: string;
  projectName: string;
  projectLocality: string;
};

export type GalleryFilter = { slug: string; name: string; count: number };

const PILL =
  'inline-flex min-h-11 items-center rounded-pill px-4 text-body-sm font-medium transition-colors';

/* The viewer's controls: white on the near-black field, never tinted by the
   section theme the viewer was opened from. */
const BAR_BUTTON =
  'inline-flex min-h-11 items-center gap-2 rounded-pill bg-white/12 px-4 text-body-sm text-white transition-colors hover:bg-white/20';

/** A swipe shorter than this is a tap, not a swipe. */
const SWIPE_PX = 40;

export function GalleryWall({
  photos,
  filters,
}: {
  photos: readonly GalleryPhoto[];
  filters: readonly GalleryFilter[];
}) {
  const [active, setActive] = useState<string>('all');
  const [openAt, setOpenAt] = useState<number | null>(null);

  const visible = useMemo(
    () => (active === 'all' ? photos : photos.filter((p) => p.projectSlug === active)),
    [photos, active],
  );

  /* The tile that opened the viewer, so focus can go back to it on close. */
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const swipeRef = useRef<{ x: number; y: number } | null>(null);

  const open = openAt !== null ? visible[openAt] : undefined;

  const close = useCallback(() => {
    setOpenAt(null);
    triggerRef.current?.focus();
  }, []);

  const move = useCallback(
    (delta: number) =>
      setOpenAt((i) => (i === null ? i : (i + delta + visible.length) % visible.length)),
    [visible.length],
  );

  /* Escape, and the arrow keys, while the viewer is open. */
  useEffect(() => {
    if (!open) return;

    document.body.dataset.scrollLocked = 'true';
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      else if (event.key === 'ArrowRight') move(1);
      else if (event.key === 'ArrowLeft') move(-1);
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      delete document.body.dataset.scrollLocked;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, close, move]);

  /* A filter change can remove the open photo from the wall entirely. */
  const filterTo = (slug: string) => {
    setOpenAt(null);
    setActive(slug);
  };

  if (photos.length === 0) {
    return (
      <section className="px-gutter pt-16">
        <div className="container-page">
          <p className="text-center text-body-lg text-ink-soft">
            Photographs are being added. In the meantime, every project page carries its own.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-gutter pt-16" aria-label="Photo gallery">
      <div className="container-page">
        {/* One pill per project that actually has photographs. Hidden entirely
            when there is only one project to filter to — a filter with a
            single option is furniture, not a control. */}
        {filters.length > 1 ? (
          <div className="flex flex-wrap justify-center gap-1.5">
            <button
              type="button"
              onClick={() => filterTo('all')}
              aria-pressed={active === 'all'}
              className={cx(PILL, active === 'all' ? 'bg-gold text-core-black' : 'bg-surface text-ink')}
            >
              All photographs
            </button>
            {filters.map((filter) => (
              <button
                key={filter.slug}
                type="button"
                onClick={() => filterTo(filter.slug)}
                aria-pressed={active === filter.slug}
                className={cx(
                  PILL,
                  active === filter.slug ? 'bg-gold text-core-black' : 'bg-surface text-ink',
                )}
              >
                {filter.name}
              </button>
            ))}
          </div>
        ) : null}

        {/* THE WALL. `columns-*` flows the tiles down each column in turn, so
            reading order is top-to-bottom per column — which is how a photo
            wall is read anyway, and every photo keeps its own aspect ratio. */}
        <ul className="mt-12 columns-1 gap-4 mid:columns-2 tablet:columns-3">
          {visible.map((photo, index) => (
            <li key={photo.src} className="mb-4 break-inside-avoid">
              <button
                type="button"
                onClick={(event) => {
                  triggerRef.current = event.currentTarget;
                  setOpenAt(index);
                }}
                aria-haspopup="dialog"
                className="group relative block w-full overflow-hidden rounded-media bg-surface text-left"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  priority={index < 3}
                  className="h-auto w-full transition-transform duration-700 ease-out-soft group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />

                {/* The caption rides on a gradient rather than a solid bar, so
                    the photograph is never boxed in. It is always legible on a
                    touch screen, which has no hover to reveal it with. */}
                <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-linear-to-t from-core-black/75 to-transparent p-4 pt-12">
                  <span className="min-w-0">
                    <span className="block truncate text-body-sm font-medium text-white">
                      {photo.projectName}
                    </span>
                    <span className="block truncate font-mono text-body-xs text-white/70">
                      {photo.projectLocality}
                    </span>
                  </span>
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                    <Icon name="zoomIn" size={16} />
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-center font-mono text-body-xs text-ink-faint">
          {visible.length} {visible.length === 1 ? 'photograph' : 'photographs'}
          {active === 'all' ? '' : ` of ${filters.find((f) => f.slug === active)?.name}`}
        </p>
      </div>

      {/* ---------- The full-screen viewer ---------- */}
      {open && openAt !== null ? (
        <div
          /* `theme-light` keeps `bg-ink` the near-black it is written as; the
             wall itself sits on cream, but a photo viewer that is not dark
             makes every photograph look washed out. */
          className="theme-light on-dark fixed inset-0 z-200 flex flex-col gap-4 bg-ink/95 p-4 tablet:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`${open.projectName} — photograph ${openAt + 1} of ${visible.length}`}
          onClick={(event) => {
            if (event.target === event.currentTarget) close();
          }}
          onPointerDown={(event) => {
            if (event.pointerType === 'mouse') return;
            swipeRef.current = { x: event.clientX, y: event.clientY };
          }}
          onPointerUp={(event) => {
            const start = swipeRef.current;
            swipeRef.current = null;
            if (!start) return;
            const dx = event.clientX - start.x;
            const dy = event.clientY - start.y;
            if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(dy)) return;
            move(dx < 0 ? 1 : -1);
          }}
        >
          <div className="flex shrink-0 items-center justify-between gap-3">
            <p className="font-mono text-body-xs text-white/70">
              {openAt + 1} / {visible.length}
            </p>
            <div className="flex gap-2">
              <Link href={`/projects/${open.projectSlug}`} className={BAR_BUTTON}>
                View project
                <Icon name="arrowRight" size={16} />
              </Link>
              <button ref={closeRef} type="button" className={BAR_BUTTON} onClick={close}>
                <Icon name="close" size={20} />
                <span className="visually-hidden">Close the gallery viewer</span>
              </button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 items-center gap-2 tablet:gap-4">
            {visible.length > 1 ? (
              <button
                type="button"
                onClick={() => move(-1)}
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-white/12 text-white transition-colors hover:bg-white/20"
              >
                <span className="visually-hidden">Previous photograph</span>
                <Icon name="arrowRight" size={18} className="rotate-180" />
              </button>
            ) : null}

            {/* A plain <img>, as the project page's Lightbox uses: at full
                screen the browser wants the photograph at its own size, and
                next/image's layout rules fight a flex-sized box. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={open.src}
              src={open.src}
              alt={open.alt}
              width={open.width}
              height={open.height}
              className="mx-auto max-h-full w-auto max-w-full rounded-media object-contain"
            />

            {visible.length > 1 ? (
              <button
                type="button"
                onClick={() => move(1)}
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-white/12 text-white transition-colors hover:bg-white/20"
              >
                <span className="visually-hidden">Next photograph</span>
                <Icon name="arrowRight" size={18} />
              </button>
            ) : null}
          </div>

          <div className="shrink-0 text-center">
            <p className="text-body-sm text-white">{open.projectName}</p>
            <p className="font-mono text-body-xs text-white/70">{open.projectLocality}</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
