import type { FeatureItem } from '@/types/content';
import { Icon } from './Icon';
import { Reveal } from './Reveal';
import { stagger } from '@/lib/stagger';
import styles from './IconList.module.css';

export function IconList({ items }: { items: readonly FeatureItem[] }) {
  return (
    <ul className={styles.list}>
      {items.map((item, index) => (
        <Reveal as="li" key={item.title} className={styles.item} delay={stagger(index)}>
          <Icon name={item.icon} size={20} className={styles.icon} />
          <span>{item.title}</span>
        </Reveal>
      ))}
    </ul>
  );
}
