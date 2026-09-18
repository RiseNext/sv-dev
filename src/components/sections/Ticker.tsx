'use client';

import { useEffect, useState } from 'react';
import { Icon, type IconName } from '@/components/ui/Icon';
import { cx } from '@/lib/cx';

/* One claim at a time, swapped on a timer — the reference's status line.

   It is not a carousel: every line is also rendered into the DOM for assistive
   technology and for no-JS, and the visible swap is aria-hidden. With reduced
   motion set it stops cycling and shows the first line, because content that
   moves on its own is a WCAG 2.2.2 problem. */

export function Ticker({
  items,
  tone = 'default',
  interval = 2600,
}: {
  items: readonly { icon: IconName; text: string }[];
  tone?: 'default' | 'invert';
  interval?: number;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => {
      setIndex((value) => (value + 1) % items.length);
    }, interval);
    return () => window.clearInterval(id);
  }, [items.length, interval]);

  const current = items[index] ?? items[0];
  if (!current) return null;

  return (
    <div className="relative flex min-h-6 items-center justify-center">
      <p
        key={index}
        aria-hidden="true"
        className={cx(
          'inline-flex animate-rise items-center gap-2 text-body-sm',
          tone === 'invert' ? 'text-white/80' : 'text-ink-soft',
        )}
      >
        <Icon name={current.icon} size={16} />
        {current.text}
      </p>

      <ul className="visually-hidden">
        {items.map((item) => (
          <li key={item.text}>{item.text}</li>
        ))}
      </ul>
    </div>
  );
}
