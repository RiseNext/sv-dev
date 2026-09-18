import { Icon } from './Icon';
import styles from './RatingStars.module.css';

/** One accessible label for the whole rating — five repeated "star"
 *  announcements help nobody. Unfilled stars use a real empty state. */
export function RatingStars({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className={styles.stars} role="img" aria-label={`Rated ${rating} out of ${max}`}>
      {Array.from({ length: max }, (_, index) => (
        <Icon
          key={index}
          name="star"
          size={16}
          className={index < rating ? styles.filled : styles.empty}
        />
      ))}
    </div>
  );
}
