import { Icon } from '@/components/ui/Icon';
import { Plate } from '@/components/ui/Media';
import { Reveal } from '@/components/ui/Reveal';
import { LinkButton } from '@/components/ui/Button';
import { location, media } from '@/content/pages';

/* The reference marks every practice on a dotted map. Ours is a corridor, not
   a country, so the map is the brochure's own location map and the claims sit
   beside it as a measured list — mono figures, because they are data.

   Every drive time here is a [BRACKETED] placeholder. Proximity is the claim
   most likely to be challenged on a land page: measure them before publishing. */

export function Corridor() {
  return (
    <section className="px-gutter pt-section" aria-labelledby="corridor-title">
      <div className="container-page grid gap-12 tablet:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] tablet:items-start tablet:gap-16">
        <Reveal>
          <p className="label-mono font-mono">{location.intro.eyebrow}</p>
          <h2 id="corridor-title" className="mt-5 max-w-[16ch] text-heading-lg text-ink">
            On the corridor, <em>not beyond it.</em>
          </h2>
          <p className="mt-6 max-w-[48ch] text-body-md text-ink-soft">{location.hero.lead}</p>

          <ul className="mt-10 grid gap-px overflow-hidden rounded-card bg-line">
            {location.proximity.slice(0, 8).map((item) => (
              <li key={item.place} className="flex items-baseline gap-4 bg-bg py-3.5">
                <span className="inline-flex w-20 shrink-0 items-center gap-2 font-mono text-body-xs text-ink">
                  <Icon name={item.icon} size={14} className="shrink-0 text-ink-faint" />
                  {item.measure}
                </span>
                <span className="text-body-sm text-ink-soft">{item.place}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <LinkButton href="/location" variant="ghost">
              Location detail
              <Icon name="arrowRight" size={16} />
            </LinkButton>
          </div>
        </Reveal>

        <Reveal delay={120} className="tablet:sticky tablet:top-28">
          <Plate image={media.locationMap} />
        </Reveal>
      </div>
    </section>
  );
}
