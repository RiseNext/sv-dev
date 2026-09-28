import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { anchorProps, isExternal, isPlaceholder } from '@/lib/href';
import { cx } from '@/lib/cx';

/* Every button on this site is a pill: 12px radius, 44px minimum height — the
   touch-target floor — and DM Sans at body-sm.

   THE CREAM-AND-GOLD SCHEME HAS ONE ACTION COLOUR: solid gold with espresso
   type. So the primary variant is gold whatever its historical name — `dark`
   is the default every call site already uses, and recolouring it here moves
   every primary button on the site at once.

   dark   espresso on gold #c4a162 — 6.4:1 (5.4:1 on hover), the primary action
   gold   the same — kept as a name so existing call sites need no change
   bronze the same — the project page's name for it
   light  ink on cream-white        — 15.1:1, used over photography
   ghost  ink on cream, gold outline — the secondary button
   ink    cream on espresso #2b2217 — 14.5:1, warming to gold-ink on hover

   `ink` IS STILL THE ONE ACTION COLOUR, inverted. On the cream page gold is
   the action; on a WHITE CARD solid gold turns heavy and mustard against the
   warm white, so the card's own espresso carries the button and the gold comes
   back on hover. Use it on white, `dark` everywhere else.

   `theme-light` on the filled variants: inside a `theme-dark` section (the
   project page's photo cover) `text-ink` would otherwise resolve light. */

type Variant = 'dark' | 'light' | 'ghost' | 'gold' | 'bronze' | 'ink';

const GOLD =
  'bg-gold text-core-black shadow-[0_8px_20px_-12px_rgba(122,90,34,0.55)] hover:bg-gold-deep';
type Size = 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-pill font-medium text-body-sm ' +
  'whitespace-nowrap transition-colors duration-200 disabled:opacity-55 disabled:cursor-not-allowed';

const variants: Record<Variant, string> = {
  dark: GOLD,
  gold: GOLD,
  bronze: GOLD,
  light: 'theme-light bg-surface text-ink hover:bg-white',
  ghost: 'border border-gold bg-surface/60 text-ink hover:bg-gold-soft',
  /* `theme-light` for the same reason the filled variants have it, and
     `text-bg` is safe to pair with it: the section themes re-point `ink` but
     never `bg`, so the type stays cream in either one. */
  ink: 'theme-light bg-ink text-bg shadow-[0_8px_20px_-12px_rgba(43,34,23,0.5)] hover:bg-gold-ink',
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
