'use client';

import { useRef, useState } from 'react';
import { RatingStars } from '@/components/ui/RatingStars';
import { cx } from '@/lib/cx';
import { testimonials } from '@/content/pages';
import styles from './Testimonials.module.css';

export function Testimonials() {
  const viewportRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  const onScroll = () => {
    const node = viewportRef.current;
    const card = node?.firstElementChild as HTMLElement | null;
    if (!node || !card) return;
    const gap = parseFloat(getComputedStyle(node).columnGap || '0') || 0;
    const stride = card.offsetWidth + gap;
    if (stride > 0) setActive(Math.round(node.scrollLeft / stride));
  };

  const goTo = (index: number) => {
    const node = viewportRef.current;
    const card = node?.children[index] as HTMLElement | undefined;
    if (!node || !card) return;
    node.scrollTo({ left: card.offsetLeft - node.offsetLeft, behavior: 'smooth' });
  };

  return (
    <>
      <ul className={styles.viewport} ref={viewportRef} onScroll={onScroll}>
        {testimonials.map((item) => (
          <li key={item.id} className={styles.card}>
            <figure>
              <RatingStars rating={item.rating} />
              <blockquote className={styles.quote}>{item.body}</blockquote>
              <figcaption className={styles.attribution}>
                <span className={styles.name}>{item.name}</span>
                <span className={styles.role}>{item.role}</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <div className={styles.dots}>
        {testimonials.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={cx(styles.dot, index === active && styles.dotActive)}
            aria-label={`Show review ${index + 1} of ${testimonials.length}`}
            aria-current={index === active}
            onClick={() => goTo(index)}
          />
        ))}
      </div>
    </>
  );
}
