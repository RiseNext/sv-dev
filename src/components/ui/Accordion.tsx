'use client';

import { useState } from 'react';
import { cx } from '@/lib/cx';
import { Icon } from './Icon';

/* White rounded rows on the off-white field, one open at a time. Native
   <button> + aria-expanded rather than <details>, so the open row can be
   controlled and the chevron animated. */

export function Accordion({
  items,
  className,
}: {
  items: readonly { q: string; a: string }[];
  className?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className={cx('flex flex-col gap-2', className)}>
      {items.map((item, index) => {
        const open = openIndex === index;
        const panelId = `faq-panel-${index}`;
        const buttonId = `faq-button-${index}`;

        return (
          <div key={item.q} className="theme-light overflow-hidden rounded-card bg-surface">
            <h3>
              <button
                id={buttonId}
                type="button"
                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left font-body text-body-md font-medium text-ink tablet:px-7"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIndex(open ? null : index)}
              >
                {item.q}
                <Icon
                  name="chevronDown"
                  size={20}
                  className={cx('shrink-0 transition-transform duration-200', open && 'rotate-180')}
                />
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!open}
              className="px-5 pb-6 text-body-md text-ink-soft tablet:px-7"
            >
              {item.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}
