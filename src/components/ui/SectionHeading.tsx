import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import { Reveal } from './Reveal';
import styles from './SectionHeading.module.css';

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  lead?: string | readonly string[];
  /** Heading level. Visual size is fixed by the component; this is semantics only. */
  as?: 'h1' | 'h2' | 'h3';
  id?: string;
  align?: 'left' | 'center';
  /** Optional CTA rendered opposite the heading at ≥768px. */
  action?: ReactNode;
  /** Drops the bottom margin when the parent already owns the spacing. */
  flush?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  lead,
  as: Tag = 'h2',
  id,
  align = 'left',
  action,
  flush = false,
}: SectionHeadingProps) {
  const leads = typeof lead === 'string' ? [lead] : (lead ?? []);

  const block = (
    <div
      className={cx(
        styles.heading,
        align === 'center' && styles.center,
        Boolean(action) && styles.withAction,
        flush && styles.flush,
      )}
    >
      {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
      <Tag id={id} className={styles.title}>
        {title}
      </Tag>
      {leads.map((line) => (
        <p key={line} className={styles.lead}>
          {line}
        </p>
      ))}
    </div>
  );

  if (!action) return <Reveal>{block}</Reveal>;

  return (
    <Reveal className={styles.rowWrapper}>
      <div className={styles.row}>
        {block}
        <div className={styles.action}>{action}</div>
      </div>
    </Reveal>
  );
}
