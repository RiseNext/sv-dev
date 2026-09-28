import Image from 'next/image';
import type { ImageRef } from '@/types/content';
import { cx } from '@/lib/cx';

/* The committed emblem, used when Site Settings has no logo uploaded.
   It is a FALLBACK, not the logo: `site-settings.logo` is a CMS upload field
   (CONTENT-MANAGEMENT-MATRIX §5, "Logo file — ADMIN, T2") and the public API has
   always emitted it. Until now nothing rendered it, so uploading a logo in the
   Admin Panel changed nothing on the site — the one failure mode a CMS field
   must not have. */
const FALLBACK = {
  src: '/images/logo/sv-developers-mark.jpg',
  width: 160,
  height: 160,
} as const;

/* alt="" on purpose: the wrapping link carries the accessible name, so the
   emblem is decorative and must not be announced a second time. */

/* `sm` is the NAVIGATION size and the only one the top bar uses; `xs` is the
   footer's. They are the only two call sites, so changing `sm` moves the navbar
   brand alone.

   The emblem is the whole brand in the bar — no name beside it. It sits INSIDE
   the capsule (see PillNav), so these two numbers are the medallion's outer
   size (52px on a phone, 128px from 1024px) minus its 2px gold ring and 2px
   white band on each side — 8px in total — and the mark fills the frame
   instead of floating inside it. Change them together with MEDALLION_SIZE in
   PillNav; that file carries the arithmetic tying both to the bar's height.

   120px from 1024px is deliberate and large: the brand is meant to read at
   advertisement scale on desktop, and it is the tallest thing on the page's
   first screen after the hero type. */
const BADGE = { xs: 'size-7', sm: 'size-11 tablet:size-30', lg: 'size-12' } as const;

/* The committed emblem is a square JPEG whose gold ring spans only 71% of the
   width (measured), on a white margin. Zoomed 1.34× the ring lands just inside
   the badge's edge, so the mark fills its circle instead of floating small in
   it. A CMS upload has unknown geometry, so it is never cropped. */
const FALLBACK_ZOOM = 'scale-[1.34]';
const WORDMARK = { xs: 'text-body-md', sm: 'text-heading-sm', lg: 'text-heading-sm' } as const;

/* `siteName` arrives as a PROP rather than being imported.
   Logo is rendered inside PillNav, which is a 'use client' module — so it
   cannot fetch, and neither can this. The name is threaded down from the root
   layout, which is a Server Component and fetches once for the whole tree. */
export function Logo({
  size = 'sm',
  className,
  siteName,
  logo,
  showName = true,
}: {
  size?: 'xs' | 'sm' | 'lg';
  className?: string;
  siteName: string;
  /** From `site-settings.logo`. Absent -> the committed emblem above. */
  logo?: ImageRef;
  /** The name beside the emblem. The top bar turns it off and shows the
   *  emblem alone; its link carries the name for assistive tech instead. */
  showName?: boolean;
}) {
  const mark = logo ?? FALLBACK;

  return (
    <span className={cx('inline-flex items-center', size === 'xs' ? 'gap-2' : 'gap-2.5', className)}>
      <span className={cx('overflow-hidden rounded-full bg-white', BADGE[size])}>
        <Image
          src={mark.src}
          /* Still alt="" even when the CMS supplies alt text: the wrapping link
             carries the accessible name, so announcing the emblem again is a
             duplicate, not an improvement. This is a component-level a11y
             decision and is not the CMS's to override. */
          alt=""
          width={mark.width}
          height={mark.height}
          quality={90}
          priority={size !== 'lg'}
          className={cx('size-full object-cover', !logo && FALLBACK_ZOOM)}
        />
      </span>
      {showName ? (
        <span className={cx('font-display leading-none tracking-[-0.01em]', WORDMARK[size])}>
          {siteName}
        </span>
      ) : null}
    </span>
  );
}
