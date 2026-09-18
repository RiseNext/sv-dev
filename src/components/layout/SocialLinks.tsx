import { Icon } from '@/components/ui/Icon';
import { anchorProps, isPlaceholder } from '@/lib/href';
import { cx } from '@/lib/cx';
import { social } from '@/content/site';
import styles from './SocialLinks.module.css';

/** Every icon-only link carries an accessible name. */
export function SocialLinks({ className }: { className?: string }) {
  return (
    <ul className={cx(styles.row, className)}>
      {social.map((item) => {
        const placeholder = isPlaceholder(item.href);
        return (
          <li key={item.label}>
            <a
              className={styles.link}
              {...anchorProps(item.href)}
              aria-label={
                placeholder
                  ? `${item.label} (link not set)`
                  : `${item.label} (opens in a new tab)`
              }
            >
              <Icon name={item.icon} size={18} />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
