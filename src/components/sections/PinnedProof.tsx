'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import type { ImageRef } from '@/types/content';

/* =============================================================================
   PINNED PROOF

   The reference's signature section: the band holds while a single large serif
   claim sits at the centre and photo tiles drift past it as you keep scrolling.

   THE PIN IS CSS `position: sticky`, NOT ScrollTrigger's `pin: true`.
   GSAP's pin works by wrapping the pinned element in a `pin-spacer` div it
   injects into the DOM — which reparents a node React owns. React then throws
   `NotFoundError: Failed to execute 'removeChild'` the moment you navigate away
   from this page, because the node it wants to remove is no longer a child of
   the parent it recorded. Sticky costs nothing, survives navigation, and works
   before the script loads.

   ScrollTrigger is left doing the one thing only it can do: scrubbing the tile
   movement against scroll position. That is enhancement — without JS, or with
   reduced motion set, the tiles are simply laid out around the claim, which is
   why they are real markup rather than something the script injects.
   ========================================================================== */

export function PinnedProof({
  stats,
  tiles,
}: {
  stats: readonly { label: string; value: string }[];
  tiles: readonly ImageRef[];
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(min-width: 64rem)').matches) return;

    let cleanup = () => {};
    let cancelled = false;

    /* Imported on demand: GSAP is ~70KB and only this section needs it, so it
       must not sit in the entry bundle for every page. */
    void (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        const tiles = tileRefs.current.filter(Boolean) as HTMLDivElement[];

        /* Runs across exactly the span the sticky child is held for, so the
           last tile leaves as the band releases. */
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.6,
          },
        });

        tiles.forEach((tile, index) => {
          const fromX = index % 2 === 0 ? -160 : 160;
          timeline.fromTo(
            tile,
            { autoAlpha: 0, x: fromX, y: 80, scale: 0.92 },
            { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 0.8 },
            index * 0.45,
          );
        });

        /* They leave together at the end rather than one at a time, so the
           claim is never left alone on screen mid-pin. */
        timeline.to(tiles, { autoAlpha: 0, y: -100, duration: 0.7, stagger: 0.08 }, 2.5);
      }, section);

      cleanup = () => ctx.revert();
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative px-gutter py-section-sm tablet:h-[280svh] tablet:py-0"
    >
      <div className="tablet:sticky tablet:top-0 tablet:flex tablet:h-svh tablet:items-center tablet:overflow-hidden">
        <div className="container-page relative w-full">
          {/* Tiles: absolutely placed at desktop where the script animates
              them, a plain grid below that. */}
          <div className="grid grid-cols-2 gap-3 tablet:absolute tablet:inset-0 tablet:block">
            {tiles.slice(0, 4).map((tile, index) => (
              <div
                key={tile.src}
                ref={(node) => {
                  tileRefs.current[index] = node;
                }}
                className={[
                  'overflow-hidden rounded-media bg-surface tablet:absolute tablet:w-[18vw] tablet:max-w-[16rem]',
                  index === 0 ? 'tablet:left-0 tablet:top-[8%]' : '',
                  index === 1 ? 'tablet:right-0 tablet:top-[4%]' : '',
                  index === 2 ? 'tablet:bottom-[10%] tablet:left-[6%]' : '',
                  index === 3 ? 'tablet:bottom-[6%] tablet:right-[6%]' : '',
                ].join(' ')}
              >
                <Image
                  src={tile.src}
                  alt=""
                  width={tile.width}
                  height={tile.height}
                  sizes="(min-width: 1024px) 18vw, 50vw"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            ))}
          </div>

          <div className="relative mx-auto flex max-w-[48rem] flex-col items-center justify-center py-16 text-center">
            <h2 className="max-w-[18ch] text-heading-lg text-ink">
              Built, walked and handed over. <em>Not drawn.</em>
            </h2>

            <dl className="mt-12 grid w-full grid-cols-2 gap-x-6 gap-y-8 tablet:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col-reverse items-center gap-1">
                  <dt className="label-mono font-mono">{stat.label}</dt>
                  <dd className="font-display text-heading-md text-ink">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
