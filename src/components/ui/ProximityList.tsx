import type { ProximityItem } from '@/types/content';
import { Icon } from './Icon';
import { Reveal } from './Reveal';
import { stagger } from '@/lib/stagger';
import styles from './ProximityList.module.css';

export function ProximityList({ items }: { items: readonly ProximityItem[] }) {
  return (
    <ul className={styles.list}>
      {items.map((item, index) => (
        <Reveal
          as="li"
          key={`${item.measure}-${item.place}`}
          className={styles.item}
          delay={stagger(index)}
        >
          <Icon name={item.icon} size={20} className={styles.icon} />
          <span className={styles.measure}>{item.measure}</span>
          <span className={styles.place}>{item.place}</span>
        </Reveal>
      ))}
    </ul>
  );
}
