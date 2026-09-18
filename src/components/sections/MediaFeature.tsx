import type { ReactNode } from 'react';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { cx } from '@/lib/cx';
import type { ImageRef } from '@/types/content';
import styles from './MediaFeature.module.css';

type MediaFeatureProps = {
  eyebrow?: string;
  title: string;
  id?: string;
  paragraphs?: readonly string[];
  image: ImageRef;
  /** Places the media first at ≥60rem. Alternate it down a page for rhythm. */
  reversed?: boolean;
  actions?: ReactNode;
  children?: ReactNode;
};

export function MediaFeature({
  eyebrow,
  title,
  id,
  paragraphs = [],
  image,
  reversed = false,
  actions,
  children,
}: MediaFeatureProps) {
  return (
    <div className={cx(styles.layout, reversed && styles.reversed)}>
      <div className={styles.body}>
        {/* flush: the .body flex gap already owns the spacing below the heading. */}
        <SectionHeading eyebrow={eyebrow} title={title} id={id} flush />
        {paragraphs.map((text) => (
          <p key={text} className={styles.paragraph}>
            {text}
          </p>
        ))}
        {children}
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>

      <Reveal className={styles.media}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          loading="lazy"
          decoding="async"
        />
      </Reveal>
    </div>
  );
}
