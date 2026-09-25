import { Icon } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import type { FeatureItem } from '@/types/content';

/* A labelled band of features: heading on the left, the list on the right as
   white cards. Items with a body get one; items without stay one line, which
   is what most brochure highlights are. */

export function FeatureList({
  id,
  label,
  title,
  titleAccent,
  lead,
  items,
}: {
  id: string;
  label: string;
  title: string;
  titleAccent?: string;
  lead?: string;
  items: readonly FeatureItem[];
}) {
  if (!items.length) return null;

  return (
    <section id={id} className="px-gutter pt-section" aria-labelledby={`${id}-title`}>
      <div className="container-page grid gap-10 tablet:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] tablet:gap-16">
        <Reveal className="tablet:sticky tablet:top-28 tablet:self-start">
          <p className="label-mono font-mono">{label}</p>
          <h2 id={`${id}-title`} className="mt-5 max-w-[14ch] text-heading-lg text-ink">
            {title} {titleAccent ? <em>{titleAccent}</em> : null}
          </h2>
          {lead ? <p className="mt-6 max-w-[44ch] text-body-md text-ink-soft">{lead}</p> : null}
        </Reveal>

        <ul className="grid gap-3 min-[30rem]:grid-cols-2">
          {items.map((item, index) => (
            <Reveal
              as="li"
              key={item.title}
              delay={index * 50}
              className="flex flex-col gap-3 rounded-card bg-surface p-6"
            >
              <Icon name={item.icon} size={22} className="text-gold-ink" />
              <h3 className="font-body text-heading-xs font-medium text-ink">{item.title}</h3>
              {item.body ? <p className="text-body-sm text-ink-soft">{item.body}</p> : null}
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
