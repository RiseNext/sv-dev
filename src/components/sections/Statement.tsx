import type { ReactNode } from 'react';
import { Reveal } from '@/components/ui/Reveal';
import { cx } from '@/lib/cx';

/* The reference's second band: a mark, a large centred serif line with an
   italic fragment, one quiet sub-line, and nothing else. It is the pause
   between the hero and the detail, and it only works if it stays empty. */

export function Statement({
  label,
  title,
  titleAccent,
  lead,
  children,
  className,
  id,
}: {
  label?: string;
  title: string;
  titleAccent?: string;
  lead?: string;
  children?: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cx('px-gutter pt-section', className)} aria-labelledby={id && `${id}-title`}>
      <Reveal className="mx-auto flex max-w-[52rem] flex-col items-center text-center">
        {label ? <p className="eyebrow">{label}</p> : null}
        <h2 id={id && `${id}-title`} className="mt-5 max-w-[20ch] text-heading-lg text-ink">
          {title} {titleAccent ? <em>{titleAccent}</em> : null}
        </h2>
        {lead ? <p className="mt-6 max-w-[54ch] text-body-lg text-ink-soft">{lead}</p> : null}
        {children}
      </Reveal>
    </section>
  );
}
