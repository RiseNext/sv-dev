import Link from 'next/link';
import { Icon } from './Icon';
import styles from './Breadcrumbs.module.css';

export type Crumb = { label: string; href?: string };

/** Orientation for inner pages. The last crumb is the current page and is
 *  marked with aria-current rather than being a link to itself. */
export function Breadcrumbs({ items }: { items: readonly Crumb[] }) {
  return (
    <nav className={styles.nav} aria-label="Breadcrumb">
      <ol className={styles.list}>
        {items.map((crumb, index) => {
          const last = index === items.length - 1;
          return (
            <li key={crumb.label} className={styles.item}>
              {crumb.href && !last ? (
                <Link href={crumb.href} className={styles.link}>
                  {crumb.label}
                </Link>
              ) : (
                <span className={styles.current} aria-current={last ? 'page' : undefined}>
                  {crumb.label}
                </span>
              )}
              {!last ? <Icon name="chevronRight" size={12} className={styles.separator} /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
