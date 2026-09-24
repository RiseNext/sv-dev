import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';

/* Every page other than the home page opens the way the reference's company
   page does: no image, no band, just the display serif on the off-white field
   with the label above it. It is the treatment that carries the whole design
   when there is no photography, which is most of this site today. */

export function PageHero({
  label,
  title,
  titleAccent,
  lead,
  children,
  className,
}: {
  label: string;
  title: string;
  titleAccent?: string;
  lead?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    /* `pt-28 tablet:pt-36` (112/144px) clears the fixed bar (64/80px) with
       48–64px of air. Down from 160/224px along with the section rhythm. */
    <header className={cx('px-gutter pb-4 pt-28 tablet:pt-36', className)}>
      <div className="container-page flex flex-col items-center text-center">
        <p className="eyebrow animate-rise">{label}</p>
        <h1
          className="mt-6 max-w-[18ch] text-heading-xl text-ink"
          style={{ animation: 'rise 700ms var(--ease-out-soft) 120ms backwards' }}
        >
          {title} {titleAccent ? <em>{titleAccent}</em> : null}
        </h1>
        {lead ? (
          <p
            className="mt-7 max-w-[56ch] text-body-lg text-ink-soft"
            style={{ animation: 'rise 700ms var(--ease-out-soft) 240ms backwards' }}
          >
            {lead}
          </p>
        ) : null}
        {children}
      </div>
    </header>
  );
}
