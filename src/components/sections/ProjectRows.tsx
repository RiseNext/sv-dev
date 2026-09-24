import Image from 'next/image';
import Link from 'next/link';
import { LinkButton } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import type { Project } from '@/types/content';

/* =============================================================================
   PROJECT ROWS — the projects under "Why SV Developers".

   The design template's image-and-text row: the picture on the left inside an
   offset gold frame, the text on the right — category, name, place, summary
   and a gold "View project". One row per project, every row the same way
   round, on request. No scroll-driven motion: each row simply fades up as it
   arrives, like every other block on the site. (This replaced the sticky,
   split-apart deck, `MediaSequence`, on request.)

   Below 1024px the text drops under its picture.

   A Server Component — there is nothing interactive here beyond two links.
   ========================================================================== */

type Item = Pick<Project, 'slug' | 'name' | 'category' | 'locality' | 'summary' | 'image'>;

export function ProjectRows({ items }: { items: readonly Item[] }) {
  if (items.length === 0) return null;

  return (
    <section className="px-gutter pt-12 tablet:pt-16" aria-label="Our layouts">
      <ol className="container-page flex flex-col gap-16 tablet:gap-24">
        {items.map((item) => {
          const href = `/projects/${item.slug}`;
          return (
            <li key={item.slug}>
              <Reveal className="grid items-center gap-8 tablet:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] tablet:gap-16">
                {/* The picture, with the gold frame offset behind its top-left
                    corner. The link is pointer-only — "View project" below is
                    the one keyboard and screen-reader users get, so there are
                    not two stops for one destination. */}
                <div className="relative pl-3 pt-3 tablet:pl-4 tablet:pt-4">
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-0 h-[82%] w-[72%] rounded-[1.75rem] border border-gold/60"
                  />
                  <Link
                    href={href}
                    tabIndex={-1}
                    aria-hidden="true"
                    className="group relative block aspect-4/3 overflow-hidden rounded-3xl bg-surface shadow-[0_30px_70px_-40px_rgba(26,43,40,0.55)]"
                  >
                    <Image
                      src={item.image.src}
                      alt={item.image.alt}
                      fill
                      sizes="(min-width: 1400px) 700px, (min-width: 1024px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.03] motion-reduce:transition-none"
                    />
                  </Link>
                </div>

                <div className="flex flex-col items-start">
                  <p className="eyebrow">{item.category}</p>
                  <h3 className="mt-4 text-heading-md text-ink">{item.name}</h3>
                  <p className="mt-2 inline-flex items-center gap-1.5 font-mono text-body-xs text-ink-faint">
                    <Icon name="mapPin" size={13} />
                    {item.locality}
                  </p>
                  {/* Only when present — a type is not a runtime guarantee
                      across the network, and an unsaved field should leave no
                      empty gap. */}
                  {item.summary ? (
                    <p className="mt-5 line-clamp-4 max-w-[52ch] text-body-md text-ink-soft">{item.summary}</p>
                  ) : null}
                  <LinkButton href={href} variant="gold" className="mt-7">
                    View project
                    <span className="visually-hidden">: {item.name}</span>
                    <Icon name="arrowRight" size={16} />
                  </LinkButton>
                </div>
              </Reveal>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
