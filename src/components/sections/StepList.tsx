import { Reveal } from '@/components/ui/Reveal';

/* No cards, no icons — a numbered list with a lot of air, as on the reference.
   The mono number is the only ornament. */

export function StepList({ items }: { items: readonly { title: string; body: string }[] }) {
  return (
    /* Width on the wrapper, dividers on the list — see about/page.tsx. */
    <div className="container-page mt-16">
      <ol className="grid gap-px overflow-hidden rounded-card bg-line">
        {items.map((step, index) => (
          <Reveal
            as="li"
            key={step.title}
            delay={index * 60}
            className="grid gap-2 bg-bg px-2 py-8 tablet:grid-cols-[6rem_minmax(0,22rem)_minmax(0,1fr)] tablet:items-baseline tablet:gap-8 tablet:px-6"
          >
            <span className="label-mono font-mono">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="font-body text-heading-xs font-medium text-ink">{step.title}</h3>
            <p className="max-w-[60ch] text-body-sm text-ink-soft">{step.body}</p>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}
