import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { anchorProps, isExternal, isPlaceholder } from '@/lib/href';
import { cx } from '@/lib/cx';

/* Every button on this site is a pill: 12px radius, 44px minimum height — the
   touch-target floor — and DM Sans at body-sm. Three fills only.

   gold   ink on the bronze gradient — 4.9:1 at its darker end; the design
          template's call to action, used for the main ask on each section
   dark   white on #13211e        — 16.6:1
   light  ink on warm white       — 14.4:1, used over photography and on cards
   ghost  ink on nothing          — inherits the surface, 1px hairline border */

type Variant = 'dark' | 'light' | 'ghost' | 'gold';
type Size = 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-pill font-medium text-body-sm ' +
  'whitespace-nowrap transition-colors duration-200 disabled:opacity-55 disabled:cursor-not-allowed';

/* `theme-light` on the filled variants: they carry their own fill, so they must
   not pick up the green field's light `ink` — on the field, `hover:bg-ink`
   would otherwise turn the dark pill off-white under white text, and the light
   pill's `text-ink` would go off-white on white.

   The ghost pill is the one that DOES inherit its surface — light type and a
   pale hairline on the green field, dark on a white card — and switches to the
   light tokens only on hover, where it fills white. */
const variants: Record<Variant, string> = {
  dark: 'theme-light bg-core-black text-white hover:bg-ink',
  light: 'theme-light bg-surface text-ink hover:bg-white',
  ghost: 'border border-line-strong text-ink hover:theme-light hover:bg-surface',
  gold:
    'theme-light bg-linear-to-r from-gold-from to-gold-to text-ink ' +
    'shadow-[0_8px_20px_-10px_rgba(122,91,51,0.6)] hover:brightness-[1.05]',
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
