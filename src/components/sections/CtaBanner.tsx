import { LinkButton } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { ctaBanner } from '@/content/pages';
import styles from './CtaBanner.module.css';

/** Closing call to action, shared by every page. */
export function CtaBanner() {
  return (
    <Section tone="darkAlt" size="sm" aria-labelledby="cta-title">
      <Reveal className={styles.banner}>
        <div>
          <h2 id="cta-title" className={styles.title}>
            {ctaBanner.title}
          </h2>
          <p className={styles.body}>{ctaBanner.body}</p>
        </div>
        <div className={styles.actions}>
          <LinkButton href={ctaBanner.primary.href} variant="accent" size="lg">
            {ctaBanner.primary.label}
          </LinkButton>
          <LinkButton href={ctaBanner.secondary.href} variant="outline" size="lg">
            {ctaBanner.secondary.label}
          </LinkButton>
        </div>
      </Reveal>
    </Section>
  );
}
