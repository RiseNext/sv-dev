import Image from 'next/image';
import type { ImageRef } from '@/types/content';
import { cx } from '@/lib/cx';

/* Media in this design is always a rounded card — 24px — and always carries its
   own dimensions so nothing reflows when it loads.

   `Frame` crops to a ratio (photography, video cards). `Plate` contains the
   whole image on a white card (plans and maps, which must never be cropped:
   the plot numbering is the content). */

export function Frame({
  image,
  ratio = 'aspect-[3/2]',
  priority = false,
  sizes = '(min-width: 1024px) 50vw, 100vw',
  className,
  children,
}: {
  image: ImageRef;
  ratio?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cx('relative overflow-hidden rounded-media bg-surface', ratio, className)}>
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
      {children}
    </div>
  );
}

export function Plate({
  image,
  className,
  sizes = '(min-width: 1024px) 70vw, 100vw',
}: {
  image: ImageRef;
  className?: string;
  sizes?: string;
}) {
  return (
    <div className={cx('rounded-media bg-surface p-3 tablet:p-5', className)}>
      <Image
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        sizes={sizes}
        className="h-auto w-full rounded-[0.75rem] object-contain"
      />
    </div>
  );
}

/* Silent looping video with a poster still. Muted + playsInline + autoPlay is
   the only combination browsers will start without a gesture, and the poster
   is what the page shows on a connection too slow for the file — and what the
   LCP measures against. */
export function VideoFrame({
  src,
  poster,
  className,
  ratio = 'aspect-[3/2]',
}: {
  src: string;
  poster: string;
  className?: string;
  ratio?: string;
}) {
  return (
    <div className={cx('relative overflow-hidden rounded-media bg-ink', ratio, className)}>
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
      />
    </div>
  );
}
