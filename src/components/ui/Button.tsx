import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { anchorProps, isExternal, isPlaceholder } from '@/lib/href';
import { cx } from '@/lib/cx';

/* Every button on this site is a pill: 12px radius, 44px minimum height — the
   touch-target floor — and DM Sans at body-sm. Three fills only.

   dark   white on #070503        — 19.6:1, the primary action
   light  ink on white            — 15.6:1, used over photography and on cards
   ghost  ink on nothing          — inherits the surface, 1px hairline border
   gold   near-black on #c9a227   —  7.4:1, one per page at most */

type Variant = 'dark' | 'light' | 'ghost' | 'gold';
type Size = 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-pill font-medium text-body-sm ' +
  'whitespace-nowrap transition-colors duration-200 disabled:opacity-55 disabled:cursor-not-allowed';

const variants: Record<Variant, string> = {
  dark: 'bg-core-black text-white hover:bg-ink',
  light: 'bg-surface text-ink hover:bg-white',
  ghost: 'border border-line-strong text-ink hover:bg-surface',
  gold: 'bg-gold text-core-black hover:bg-gold-ink hover:text-white',
};

const sizes: Record<Size, string> = {
  md: 'min-h-11 px-5',
  lg: 'min-h-13 px-7 text-body-md',
};

function classes(variant: Variant, size: Size, className?: string) {
  return cx(base, variants[variant], sizes[size], className);
}

export function Button({
  variant = 'dark',
  size = 'md',
  className,
  children,
  ...rest
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={classes(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  variant = 'dark',
  size = 'md',
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}) {
  const cls = classes(variant, size, className);

  /* A bracketed destination renders as a visibly inert <span>, never as a
     live-looking link that goes nowhere. */
  if (isPlaceholder(href)) {
    return (
      <span className={cls} {...anchorProps(href)} role="link">
        {children}
      </span>
    );
  }

  if (isExternal(href)) {
    return (
      <a className={cls} {...anchorProps(href)}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}
