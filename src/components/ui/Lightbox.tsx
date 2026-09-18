'use client';

import { useEffect, useRef, useState } from 'react';
import { cx } from '@/lib/cx';
import { isPlaceholder } from '@/lib/href';
import type { ImageRef } from '@/types/content';
import { Icon } from './Icon';
import styles from './Lightbox.module.css';

type LightboxProps = {
  image: ImageRef;
  /** PDF of the same document, if there is one. */
  downloadHref?: string;
  /**
   * Thumbnail fit. 'contain' (default) keeps the whole image visible and is
   * the only correct choice for layout plans, master plans and location maps,
   * where cropping destroys the meaning. 'cover' crops to a fixed ratio and
   * suits gallery photography. The full-screen view is always contained.
   */
  fit?: 'contain' | 'cover';
};

export function Lightbox({ image, downloadHref, fit = 'contain' }: LightboxProps) {
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

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={cx(styles.trigger, fit === 'cover' && styles.cover)}
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
        />
        <span className={styles.hint}>
          <Icon name="zoomIn" size={15} />
          Enlarge
        </span>
      </button>

      {open ? (
        <div
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-label={image.alt}
          onClick={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div className={styles.bar}>
            <button
              type="button"
              className={styles.barButton}
              onClick={() => setZoomed((value) => !value)}
              aria-pressed={zoomed}
            >
              <Icon name="zoomIn" size={18} />
              {zoomed ? 'Fit to screen' : 'Zoom in'}
            </button>

            {downloadable ? (
              <a
                className={styles.barButton}
                href={downloadHref}
                download
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="download" size={18} />
                PDF
              </a>
            ) : null}

            <button ref={closeRef} type="button" className={styles.barButton} onClick={close}>
              <Icon name="close" size={20} />
              <span className="visually-hidden">Close</span>
            </button>
          </div>

          <div className={cx(styles.viewport, zoomed && styles.zoomed)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.src} alt={image.alt} width={image.width} height={image.height} />
          </div>
        </div>
      ) : null}
    </>
  );
}
