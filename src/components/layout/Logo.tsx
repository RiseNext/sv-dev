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
   brand alone — which is why the bump below did not need a new step.

   Sized up from 32px/text-heading-xs: the mark was reading as small against a
   64/80px bar. 40px is the ceiling that bar allows — the phone bar is 64px, so
   a 40px badge keeps 12px of air above and below, and the next step up (48px,
   `lg`) would leave 8px and read as cramped rather than confident. */
const BADGE = { xs: 'size-7', sm: 'size-10', lg: 'size-12' } as const;
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
}: {
  size?: 'xs' | 'sm' | 'lg';
  className?: string;
  siteName: string;
  /** From `site-settings.logo`. Absent -> the committed emblem above. */
  logo?: ImageRef;
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
      <span className={cx('font-display leading-none tracking-[-0.01em]', WORDMARK[size])}>
        {siteName}
      </span>
    </span>
  );
}
