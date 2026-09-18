import { Icon } from '@/components/ui/Icon';
import styles from './FaqList.module.css';

/* Native <details> — keyboard operable, announced correctly, and it works
   before JavaScript loads. A custom accordion would be strictly worse here. */

export function FaqList({ items }: { items: readonly { q: string; a: string }[] }) {
  return (
    <div className={styles.list}>
      {items.map((item) => (
        <details key={item.q} className={styles.item}>
          <summary className={styles.question}>
            {item.q}
            <Icon name="chevronDown" size={18} className={styles.icon} />
          </summary>
          <p className={styles.answer}>{item.a}</p>
        </details>
      ))}
    </div>
  );
}
