import Link from 'next/link';
import { EnquiryPill } from '@/components/sections/EnquiryPill';
import { HeroVideoStage } from '@/components/sections/HeroVideoStage';
import { Icon, type IconName } from '@/components/ui/Icon';
import { home } from '@/content/pages';
import { categoryOrder } from '@/lib/api/projects';
import type { ProjectCategory, VideoRef } from '@/types/content';

/* =============================================================================
   HERO — the design template's opening band.

   Type on the cream field on the left: a gold rule, the headline with its
   accent line in gold, the lead, and the phone-number pill that hands the
   visitor to WhatsApp. On the right, the dark wave — the CMS hero video playing
   inside the curve (see HeroVideoStage). Across the bottom edge, overlapping
   both, the white strip of the four project categories.

   Below 1024px the wave drops under the text as a curved band, and the strip
   overlaps its bottom edge instead.
   ========================================================================== */

/* The catalogue's own category order, so the strip and the /projects filter
   pills never disagree. The icon per category is the only thing set here. */
const CATEGORY_ICON: Record<ProjectCategory, IconName> = {
  'Premium Villa Plots': 'home',
  'Farm Villa Plots': 'leaf',
  'Residential Plots': 'mapPin',
  Apartments: 'building',
};

export function Hero({
  siteName,
  whatsapp,
  videos,
}: {
  /* Threaded down from the page, because EnquiryPill is a 'use client' module
     and cannot read the CMS itself. */
  siteName: string;
  whatsapp: string;
  /** From `site-settings.heroVideos`. Absent or empty → the plain forest wave. */
  videos?: readonly VideoRef[];
}) {
  const { title, titleAccent, lead } = home.hero;

  return (
    <section className="relative" aria-labelledby="hero-title">
      <div className="relative tablet:min-h-[min(100svh,54rem)]">
        <div className="container-page relative z-10 flex flex-col justify-center pt-28 tablet:min-h-[min(100svh,54rem)] tablet:pb-36 tablet:pt-32">
          <div className="max-w-xl tablet:max-w-md desktop:max-w-152">
            <span
              aria-hidden="true"
              className="block h-0.5 w-24 rounded-full bg-linear-to-r from-gold-from to-gold-to"
              style={{ animation: 'rise 700ms var(--ease-out-soft) backwards' }}
            />
            <h1
              id="hero-title"
              /* A step under `heading-xl` (44 → 76px rather than 50 → 104px):
                 the template sets the headline as TWO lines — the line, then
                 its gold accent — and at the full display size it broke into
                 four beside the wave. */
              className="mt-6 text-balance text-[clamp(2.75rem,1.4rem+3.4vw,4.75rem)] leading-[1.02] tracking-[-0.02em] text-ink"
              style={{ animation: 'rise 700ms var(--ease-out-soft) 80ms backwards' }}
            >
              {title} <em className="block text-gold-ink">{titleAccent}</em>
            </h1>
            <p
              className="mt-6 max-w-[46ch] text-body-lg text-ink-soft"
              style={{ animation: 'rise 700ms var(--ease-out-soft) 160ms backwards' }}
            >
              {lead}
            </p>
            <div className="mt-8" style={{ animation: 'rise 700ms var(--ease-out-soft) 240ms backwards' }}>
              <EnquiryPill siteName={siteName} whatsapp={whatsapp} align="start" />
            </div>
          </div>
        </div>

        {/* Below the text on a phone; the right-hand side from 1024px, starting
            under the 80px bar so the bar always sits on cream. */}
        <HeroVideoStage
          videos={videos ?? []}
          className={
            'relative mt-10 h-72 w-full ' +
            'tablet:absolute tablet:bottom-0 tablet:right-0 tablet:top-20 tablet:mt-0 tablet:h-auto tablet:w-[54%] desktop:w-[57%]'
          }
        />
      </div>

      {/* ---------- The category strip, across the bottom edge ---------- */}
      <div className="container-page relative z-20 -mt-12 tablet:-mt-20">
        <ul
          aria-label="What we build"
          className={
            'theme-light grid grid-cols-2 rounded-card border border-line bg-surface ' +
            'shadow-[0_24px_60px_-28px_rgba(26,43,40,0.35)] tablet:grid-cols-4'
          }
        >
          {categoryOrder.map((category) => (
            <li
              key={category}
              className={
                'border-line max-tablet:odd:border-r max-tablet:nth-[-n+2]:border-b ' +
                'tablet:not-last:border-r'
              }
            >
              <Link
                href="/projects"
                className="group flex h-full flex-col items-center gap-4 px-4 py-7 text-center tablet:py-8"
              >
                <span
                  className={
                    'flex size-14 items-center justify-center rounded-2xl border border-gold/45 bg-bg text-gold-ink ' +
                    'shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition-transform duration-300 ease-spring ' +
                    'group-hover:-translate-y-0.5 motion-reduce:transition-none'
                  }
                >
                  <Icon name={CATEGORY_ICON[category]} size={26} />
                </span>
                <span className="text-body-sm font-medium text-ink">{category}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
