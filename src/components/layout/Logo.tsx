import Image from 'next/image';
import { site } from '@/content/site';
import { cx } from '@/lib/cx';

/* alt="" on purpose: the wrapping link carries the accessible name, so the
   emblem is decorative and must not be announced a second time. */

export function Logo({
  size = 'sm',
  className,
}: {
  size?: 'sm' | 'lg';
  className?: string;
}) {
  const badge = size === 'lg' ? 'size-12' : 'size-8';

  return (
    <span className={cx('inline-flex items-center gap-2.5', className)}>
      <span className={cx('overflow-hidden rounded-full bg-white', badge)}>
        <Image
          src="/images/logo/sv-developers-mark.jpg"
          alt=""
          width={160}
          height={160}
          quality={90}
          priority={size === 'sm'}
          className="size-full object-cover"
        />
      </span>
      <span
        className={cx(
          'font-display leading-none tracking-[-0.01em]',
          size === 'lg' ? 'text-heading-sm' : 'text-heading-xs',
        )}
      >
        {site.name}
      </span>
    </span>
  );
}
