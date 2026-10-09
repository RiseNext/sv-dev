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
  src: '/images/logo/newlogo.jpeg',
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
   size (96px on a phone, 128px from 1024px) minus its 2px gold ring and 2px
   white band on each side — 8px in total — and the mark fills the frame
   instead of floating inside it. Change them together with MEDALLION_SIZE in
   PillNav; that file carries the arithmetic tying both to the bar's height.

   BOTH NUMBERS ARE DELIBERATELY LARGE: the brand is meant to read at
   advertisement scale, and the emblem is the tallest thing on the page's first
   screen after the hero type. The phone was 44px until it was reported as
   unreadable — which it was, since the word DEVELOPERS inside this emblem
   disappears below roughly 60px. That is the same reason the desktop mark is
   120, so the phone now follows the same rule rather than being the exception
   to it. */
const BADGE = { xs: 'size-7', sm: 'size-22 tablet:size-30', lg: 'size-12' } as const;

/* 🔶 THE ZOOM IS GONE WITH THE ARTWORK THAT NEEDED IT.
   The previous emblem (`sv-developers-mark.jpg`) was a square JPEG whose gold
   ring spanned only 71% of the width — measured — on a white margin, so it was
   scaled 1.34× to stop it floating small inside the badge.

   `newlogo.jpeg` is cropped tight: the ring spans 98.8%, so it needs no zoom
   at all, and the badge's circular clip now lands on the ring itself rather
   than on white. KEEPING THE 1.34 WOULD HAVE CROPPED THE RING CLEAN OFF, which
   is why this constant was deleted rather than left at an unused 1.0.

   If the artwork is ever swapped again, measure the ring's span first — that
   number, not taste, is what decides whether a zoom belongs here. */
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
          className="size-full object-cover"
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
