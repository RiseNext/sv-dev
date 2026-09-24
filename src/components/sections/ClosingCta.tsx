import Image from 'next/image';
import { LinkButton } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { ctaBanner } from '@/content/pages';
import { getProjects } from '@/lib/api/projects';
import { cx } from '@/lib/cx';
import type { ImageRef } from '@/types/content';

/* =============================================================================
   CLOSING CTA — the last block before the footer, on most pages.

   The design template's text-beside-picture block: the ask on a light panel
   on the left (eyebrow, heading, one line, the gold "Book a site visit" and a
   quieter second action), and a photograph on the right inside an offset gold
   frame — the mirror of the project rows under "Why SV Developers".

   THE PHOTOGRAPH is the caller's (a project page passes its own), or else the
   first published project's cover. `getProjects()` is React- and fetch-cached
   and the root layout already calls it for the navigation, so this adds no
   request to the CMS. With no project published there is no picture, and the
   panel simply takes the full width.
   ========================================================================== */

export async function ClosingCta({
  title = ctaBanner.title,
  body = ctaBanner.body,
  image,
}: {
  title?: string;
  body?: string;
  image?: ImageRef;
}) {
  const picture = image ?? (await getProjects())[0]?.image;

  return (
    <section className="px-gutter pt-section" aria-labelledby="cta-title">
      <div
        className={cx(
          'container-page grid items-center gap-10',
          picture && 'tablet:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] tablet:gap-16',
        )}
      >
        <Reveal className="theme-light flex flex-col items-start rounded-3xl border border-line bg-surface p-8 tablet:p-12">
          <p className="eyebrow">Site visits</p>
          <h2 id="cta-title" className="mt-5 max-w-[16ch] text-heading-lg text-ink">
            {title}
          </h2>
          <p className="mt-5 max-w-[46ch] text-body-md text-ink-soft">{body}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href={ctaBanner.primary.href} variant="gold" size="lg">
              {ctaBanner.primary.label}
            </LinkButton>
            <LinkButton href={ctaBanner.secondary.href} variant="ghost" size="lg">
              {ctaBanner.secondary.label}
            </LinkButton>
          </div>
        </Reveal>

        {picture ? (
          <Reveal delay={120} className="relative pr-3 pt-3 tablet:pr-4 tablet:pt-4">
            <span
              aria-hidden="true"
              className="absolute right-0 top-0 h-[82%] w-[72%] rounded-[1.75rem] border border-gold/60"
            />
            <div className="relative aspect-4/3 overflow-hidden rounded-3xl bg-surface shadow-[0_30px_70px_-40px_rgba(26,43,40,0.55)]">
              <Image
                src={picture.src}
                alt={picture.alt}
                fill
                sizes="(min-width: 1400px) 700px, (min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
