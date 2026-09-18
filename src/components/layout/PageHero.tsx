import type { ReactNode } from 'react';
import { Breadcrumbs, type Crumb } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/Section';
import type { ImageRef } from '@/types/content';
import styles from './PageHero.module.css';

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  lead?: string;
  crumbs: readonly Crumb[];
  image?: ImageRef;
  children?: ReactNode;
};

export function PageHero({ eyebrow, title, lead, crumbs, image, children }: PageHeroProps) {
  return (
    <header className={`${styles.hero} on-dark`}>
      {image ? (
        <div className={styles.media}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.src}
            alt=""
            width={image.width}
            height={image.height}
            fetchPriority="high"
            decoding="async"
          />
        </div>
      ) : null}
      <div className={styles.overlay} aria-hidden="true" />

      <Container>
        <Breadcrumbs items={crumbs} />
        <div className={styles.inner}>
          {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
          <h1 className={styles.title}>{title}</h1>
          {lead ? <p className={styles.lead}>{lead}</p> : null}
        </div>
        {children ? <div className={styles.meta}>{children}</div> : null}
      </Container>
    </header>
  );
}
