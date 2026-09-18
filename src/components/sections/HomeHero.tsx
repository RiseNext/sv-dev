import { LinkButton } from '@/components/ui/Button';
import { Container } from '@/components/ui/Section';
import { StatRow } from '@/components/ui/StatRow';
import { home, media } from '@/content/pages';
import styles from './HomeHero.module.css';

/* A <picture> rather than next/image: art direction — a different crop per
   breakpoint, not just a different size — is the one image job next/image
   cannot do, and a 16:9 desktop hero crops badly at 9:16. */

export function HomeHero() {
  const { eyebrow, title, lead, primaryCta, secondaryCta, stats } = home.hero;

  return (
    <section className={`${styles.hero} on-dark`} aria-labelledby="hero-title">
      <picture className={styles.media}>
        {/* Replace with real derivatives:
            <source media="(max-width: 47.99rem)" type="image/avif" srcSet="/images/hero-portrait.avif" />
            <source type="image/avif" srcSet="/images/hero-1280.avif 1280w, /images/hero-2400.avif 2400w" />
            Target ≤200KB per full-bleed image after encoding. */}
        <source media="(max-width: 47.99rem)" srcSet={media.heroPortrait} />
        <img
          src={media.hero.src}
          alt=""
          width={media.hero.width}
          height={media.hero.height}
          fetchPriority="high"
          decoding="async"
        />
      </picture>

      <div className={styles.overlay} aria-hidden="true" />

      <Container>
        <div className={styles.content}>
          <span className={styles.eyebrow}>{eyebrow}</span>
          <h1 id="hero-title" className={styles.title}>
            {title}
          </h1>
          <p className={styles.lead}>{lead}</p>

          <div className={styles.actions}>
            <LinkButton href={primaryCta.href} variant="accent" size="lg">
              {primaryCta.label}
            </LinkButton>
            <LinkButton href={secondaryCta.href} variant="outline" size="lg">
              {secondaryCta.label}
            </LinkButton>
          </div>

          <div className={styles.stats}>
            <StatRow items={stats} bordered />
          </div>
        </div>
      </Container>
    </section>
  );
}
