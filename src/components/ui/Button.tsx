import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '@/lib/cx';
import { isExternal, isPlaceholder } from '@/lib/href';
import { Icon } from './Icon';
import styles from './Button.module.css';

type Variant = 'primary' | 'accent' | 'outline' | 'ghost';
type Size = 'md' | 'lg';

type Shared = {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  className?: string;
  children: ReactNode;
};

function classes({ variant = 'primary', size = 'md', block, className }: Partial<Shared>) {
  return cx(
    styles.btn,
    styles[variant ?? 'primary'],
    size === 'lg' && styles.lg,
    block && styles.block,
    className,
  );
}

export function Button({
  variant,
  size,
  block,
  className,
  type = 'button',
  children,
  ...rest
}: Shared & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={classes({ variant, size, block, className })} {...rest}>
      {children}
    </button>
  );
}

type LinkButtonProps = Shared &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { href: string };

/** Internal routes go through next/link for client-side navigation; external
 *  and mailto/tel links fall back to a plain anchor. A bracketed placeholder
 *  renders inert rather than as a dead link. */
export function LinkButton({
  href,
  variant,
  size,
  block,
  className,
  children,
  ...rest
}: LinkButtonProps) {
  const cls = classes({ variant, size, block, className });

  if (isPlaceholder(href)) {
    return (
      <a className={cls} aria-disabled data-placeholder tabIndex={-1} {...rest}>
        {children}
      </a>
    );
  }

  if (isExternal(href)) {
    const newTab = /^https?:\/\//.test(href);
    return (
      <a
        className={cls}
        href={href}
        {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : null)}
        {...rest}
      >
        {children}
        {newTab ? (
          <>
            <Icon name="external" size={16} />
            <span className="visually-hidden"> (opens in a new tab)</span>
          </>
        ) : null}
      </a>
    );
  }

  return (
    <Link className={cls} href={href} {...rest}>
      {children}
    </Link>
  );
}
