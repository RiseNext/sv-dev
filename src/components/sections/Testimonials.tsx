import { Reveal } from '@/components/ui/Reveal';
import type { Testimonial } from '@/types/content';
import { isPlaceholder } from '@/lib/href';

/* White card, serif quote, mono attribution — the reference's story card
   without the video, which we do not have.

   `isPlaceholder` still guards the attribution: a CMS row may legitimately be
   saved with a `[BRACKETED]` name while an admin is mid-edit, and that must
   render visibly inert rather than looking like a real person. */

/* ⚠️ Items arrive as a PROP and the CMS returns only PUBLISHED AND CONSENTED
   quotes. The three testimonials that used to be hardcoded here were INVENTED
   placeholders with bracketed names — publishing them would be a fabricated
   record — so this section correctly renders NOTHING until real, consented
   quotes exist. An absent section is better than an invented one. */
export function Testimonials({ items }: { items: readonly Testimonial[] }) {
  if (!items.length) return null;

  return (
    <section className="px-gutter pt-section" aria-labelledby="reviews-title">
      <div className="container-page">
        <Reveal className="mx-auto max-w-[44rem] text-center">
          <p className="label-mono font-mono">What buyers say</p>
          <h2 id="reviews-title" className="mt-5 text-heading-lg text-ink">
            Bought here, <em>and still here.</em>
          </h2>
        </Reveal>

        <ul className="mt-14 grid gap-4 mid:grid-cols-2 tablet:grid-cols-3">
          {items.map((item, index) => (
            <Reveal as="li" key={item.id} delay={index * 80}>
              <figure className="flex h-full flex-col rounded-media bg-surface p-6 tablet:p-8">
                <blockquote className="flex-1">
                  <p className="text-heading-xs leading-relaxed text-ink">“{item.body}”</p>
                </blockquote>
                <figcaption className="mt-8 border-t border-line pt-5">
                  <span
                    className="block font-mono text-body-xs text-ink"
                    data-placeholder={isPlaceholder(item.name) ? '' : undefined}
                  >
                    {item.name}
                  </span>
                  <span className="mt-1 block font-mono text-body-xs text-ink-faint">
                    {item.role}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
