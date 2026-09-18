import type { ElementType, ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './Section.module.css';

type Tone = 'default' | 'surface' | 'sunken' | 'dark' | 'darkAlt';
type Size = 'sm' | 'md' | 'lg' | 'flush';
type Width = 'default' | 'narrow' | 'wide' | 'full';

/* CSS-module keys are `string | undefined` under noUncheckedIndexedAccess;
   cx() drops undefined, so no non-null assertions are needed. */
const toneClass: Record<Tone, string | undefined> = {
  default: styles.toneDefault,
  surface: styles.toneSurface,
  sunken: styles.toneSunken,
  dark: styles.toneDark,
  darkAlt: styles.toneDarkAlt,
};

const sizeClass: Record<Size, string | undefined> = {
  sm: styles.sizeSm,
  md: undefined,
  lg: styles.sizeLg,
  flush: styles.sizeFlush,
};

const widthClass: Record<Width, string | undefined> = {
  default: undefined,
  narrow: styles.widthNarrow,
  wide: styles.widthWide,
  full: styles.widthFull,
};

export function Container({
  width = 'default',
  className,
  children,
}: {
  width?: Width;
  className?: string;
  children: ReactNode;
}) {
  return <div className={cx(styles.container, widthClass[width], className)}>{children}</div>;
}

type SectionProps = {
  as?: ElementType;
  id?: string;
  tone?: Tone;
  size?: Size;
  width?: Width;
  className?: string;
  containerClassName?: string;
  'aria-labelledby'?: string;
  'aria-label'?: string;
  children: ReactNode;
};

export function Section({
  as: Tag = 'section',
  id,
  tone = 'default',
  size = 'md',
  width = 'default',
  className,
  containerClassName,
  children,
  ...rest
}: SectionProps) {
  const dark = tone === 'dark' || tone === 'darkAlt';

  return (
    <Tag
      id={id}
      className={cx(styles.section, toneClass[tone], sizeClass[size], dark && 'on-dark', className)}
      {...rest}
    >
      <Container width={width} className={containerClassName}>
        {children}
      </Container>
    </Tag>
  );
}
