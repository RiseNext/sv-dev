import Image from 'next/image';
import { cx } from '@/lib/cx';
import { site } from '@/content/site';
import styles from './Logo.module.css';

/* alt="" on purpose: the wrapping link carries the accessible name, so the
   emblem is decorative and must not be announced a second time. */

export function Logo({ variant = 'header' }: { variant?: 'header' | 'footer' }) {
  return (
    <span className={cx(styles.lockup, variant === 'footer' && styles.footer)}>
      <span className={styles.badge}>
        <Image
          src="/images/logo/sv-developers-mark.jpg"
          alt=""
          width={160}
          height={160}
          priority={variant === 'header'}
          quality={90}
        />
      </span>
      <span className={styles.wordmark}>
        <span className={styles.name}>{site.name}</span>
        <span className={styles.tag}>{site.tagline}</span>
      </span>
    </span>
  );
}
