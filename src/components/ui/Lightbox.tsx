'use client';

import { useEffect, useRef, useState } from 'react';
import { cx } from '@/lib/cx';
import { isPlaceholder } from '@/lib/href';
import type { ImageRef } from '@/types/content';
import { Icon } from './Icon';

/* Plans and maps open full screen and zoom, because the plot numbering is the
   content and it is unreadable at card size. The thumbnail is always contained
   — cropping a layout plan destroys its meaning. */

export function Lightbox({
  image,
  downloadHref,
}: {
  image: ImageRef;
  downloadHref?: string;
}) {
  const [open, setOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    document.body.dataset.scrollLocked = 'true';
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      delete document.body.dataset.scrollLocked;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    setZoomed(false);
    triggerRef.current?.focus();
  };

  const downloadable = downloadHref && !isPlaceholder(downloadHref);
  const barButton =
    'inline-flex min-h-11 items-center gap-2 rounded-pill bg-white/12 px-4 text-body-sm text-white transition-colors hover:bg-white/20';

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="group relative block w-full rounded-media bg-surface p-3 text-left tablet:p-5"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          loading="lazy"
          decoding="async"
          className="h-auto w-full rounded-[0.75rem] object-contain"
        />
        <span className="absolute bottom-6 right-6 inline-flex min-h-9 items-center gap-2 rounded-pill bg-core-black px-4 text-body-sm text-white">
          <Icon name="zoomIn" size={15} />
          Enlarge
        </span>
      </button>

      {open ? (
        <div
          className="on-dark fixed inset-0 z-200 flex flex-col gap-4 bg-ink/95 p-4 tablet:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={image.alt}
          onClick={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div className="flex shrink-0 justify-end gap-2">
            <button
              type="button"
              className={barButton}
              onClick={() => setZoomed((value) => !value)}
              aria-pressed={zoomed}
            >
              <Icon name="zoomIn" size={18} />
              {zoomed ? 'Fit to screen' : 'Zoom in'}
            </button>

            {downloadable ? (
              <a
                className={barButton}
                href={downloadHref}
                download
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="download" size={18} />
                PDF
              </a>
            ) : null}

            <button ref={closeRef} type="button" className={barButton} onClick={close}>
              <Icon name="close" size={20} />
              <span className="visually-hidden">Close</span>
            </button>
          </div>

          <div className={cx('min-h-0 flex-1 overflow-auto', !zoomed && 'grid place-items-center')}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              className={cx(
                'rounded-[0.75rem]',
                zoomed ? 'max-w-none' : 'max-h-full w-auto max-w-full object-contain',
              )}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
