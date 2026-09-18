import { cx } from '@/lib/cx';
import styles from './StatRow.module.css';

type Stat = { label: string; value: string };

export function StatRow({
  items,
  bordered = false,
}: {
  items: readonly Stat[];
  bordered?: boolean;
}) {
  return (
    <dl className={cx(styles.row, bordered && styles.bordered)}>
      {items.map((stat) => (
        <div key={stat.label} className={styles.item}>
          <dt className={styles.label}>{stat.label}</dt>
          <dd className={styles.value}>{stat.value}</dd>
        </div>
      ))}
    </dl>
  );
}
