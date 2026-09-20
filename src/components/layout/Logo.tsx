import Image from 'next/image';
import { cx } from '@/lib/cx';

/* alt="" on purpose: the wrapping link carries the accessible name, so the
   emblem is decorative and must not be announced a second time. */

/* `xs` is the navigation size: the bar is deliberately short, so the emblem
   and wordmark are stepped down to sit inside a 36px pill without crowding. */
const BADGE = { xs: 'size-7', sm: 'size-8', lg: 'size-12' } as const;
const WORDMARK = { xs: 'text-body-md', sm: 'text-heading-xs', lg: 'text-heading-sm' } as const;

/* `siteName` arrives as a PROP rather than being imported.
   Logo is rendered inside PillNav, which is a 'use client' module — so it
   cannot fetch, and neither can this. The name is threaded down from the root
   layout, which is a Server Component and fetches once for the whole tree. */
export function Logo({
  size = 'sm',
  className,
  siteName,
}: {
  size?: 'xs' | 'sm' | 'lg';
  className?: string;
  siteName: string;
}) {
  return (
    <span className={cx('inline-flex items-center', size === 'xs' ? 'gap-2' : 'gap-2.5', className)}>
      <span className={cx('overflow-hidden rounded-full bg-white', BADGE[size])}>
        <Image
          src="/images/logo/sv-developers-mark.jpg"
          alt=""
          width={160}
          height={160}
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
