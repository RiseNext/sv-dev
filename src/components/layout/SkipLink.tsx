import styles from './SkipLink.module.css';

/** First element in the DOM; visible only when focused. */
export function SkipLink() {
  return (
    <a className={styles.skip} href="#main">
      Skip to content
    </a>
  );
}
