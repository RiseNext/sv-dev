import { Reveal } from '@/components/ui/Reveal';
import { testimonials } from '@/content/pages';
import { isPlaceholder } from '@/lib/href';

/* White card, serif quote, mono attribution — the reference's story card
   without the video, which we do not have.

   ⚠️  The quotes in content/pages.ts are WRITTEN PLACEHOLDERS with bracketed
   names. Publishing invented reviews under real-sounding names is a fabricated
   record, so this section renders the placeholder attribution visibly inert
   and must be replaced with real, consented quotes — or deleted — before the
   site is indexed. */

export function Testimonials() {
  if (!testimonials.length) return null;

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
          {testimonials.map((item, index) => (
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
