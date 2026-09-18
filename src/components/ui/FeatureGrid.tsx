import type { FeatureItem } from '@/types/content';
import { Icon } from './Icon';
import { Reveal } from './Reveal';
import { stagger } from '@/lib/stagger';
import styles from './FeatureGrid.module.css';

export function FeatureGrid({ items }: { items: readonly FeatureItem[] }) {
  return (
    <ul className={styles.grid}>
      {items.map((item, index) => (
        <Reveal as="li" key={item.title} className={styles.card} delay={stagger(index)}>
          <span className={styles.iconWrap}>
            <Icon name={item.icon} size={22} />
          </span>
          <h3 className={styles.title}>{item.title}</h3>
          {item.body ? <p className={styles.body}>{item.body}</p> : null}
        </Reveal>
      ))}
    </ul>
  );
}
