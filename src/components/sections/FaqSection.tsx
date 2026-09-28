import { Accordion } from '@/components/ui/Accordion';
import { Reveal } from '@/components/ui/Reveal';

/* =============================================================================
   FAQ — heading left, questions right.

   This was a full-width centred `Statement` with the heading at
   `text-heading-lg` (36 → 70px) sitting above a 44rem accordion, which spent
   most of a screen height on four words. The heading now takes a narrow left
   column at `text-heading-md` and the questions take the rest, so the band
   opens on a question instead of on a title.

   The heading is sticky from tablet up: the column is much shorter than the
   accordion beside it, and without it the left half of the screen is empty for
   most of the scroll. Below tablet the two stack, heading first.
   ========================================================================== */

export function FaqSection({
  id = 'faq',
  label = 'FAQ',
  title,
  titleAccent,
  items,
}: {
  id?: string;
  label?: string;
  title: string;
  titleAccent?: string;
  items: readonly { q: string; a: string }[];
}) {
  if (!items.length) return null;

  return (
    <section id={id} className="px-gutter pt-section" aria-labelledby={`${id}-title`}>
      <div className="container-page grid gap-8 tablet:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] tablet:gap-16">
        <Reveal className="tablet:sticky tablet:top-28 tablet:self-start">
          {label ? <p className="label-mono font-mono">{label}</p> : null}
          <h2 id={`${id}-title`} className="mt-4 max-w-[16ch] text-heading-md text-ink">
            {title} {titleAccent ? <em>{titleAccent}</em> : null}
          </h2>
        </Reveal>

        <Reveal delay={80}>
          <Accordion items={items} />
        </Reveal>
      </div>
    </section>
  );
}
