import { Icon } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import { LinkButton } from '@/components/ui/Button';
import { location } from '@/content/pages';

/* The "Connectivity" band, on the home page and on /location.

   It used to carry the location map as a plate in its right-hand column. The
   map was removed on request, so the measured list moved into that column: the
   heading, lead and link sit on the left, the drive times on the right — mono
   figures, because they are data.

   On a phone it is one column in reading order — heading, list, then link —
   which is why the three blocks are placed with grid lines at 1024px rather
   than nested in two column wrappers.

   Every drive time here is a [BRACKETED] placeholder. Proximity is the claim
   most likely to be challenged on a land page: measure them before publishing. */

export function Corridor() {
  return (
    <section className="px-gutter pt-section" aria-labelledby="corridor-title">
      <div
        className={
          'container-page grid gap-10 tablet:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] ' +
          'tablet:grid-rows-[auto_1fr] tablet:gap-x-16 tablet:gap-y-8'
        }
      >
        <Reveal className="tablet:col-start-1 tablet:row-start-1">
          <p className="eyebrow">{location.intro.eyebrow}</p>
          <h2 id="corridor-title" className="mt-5 max-w-[16ch] text-heading-lg text-ink">
            On the corridor, <em>not beyond it.</em>
          </h2>
          <p className="mt-6 max-w-[48ch] text-body-md text-ink-soft">{location.hero.lead}</p>
        </Reveal>

        <Reveal
          as="ul"
          delay={120}
          className="grid gap-px overflow-hidden rounded-card bg-line tablet:col-start-2 tablet:row-span-2 tablet:row-start-1"
        >
          {location.proximity.slice(0, 8).map((item) => (
            <li key={item.place} className="flex items-baseline gap-4 bg-bg py-3.5">
              <span className="inline-flex w-20 shrink-0 items-center gap-2 font-mono text-body-xs text-ink">
                <Icon name={item.icon} size={14} className="shrink-0 text-ink-faint" />
                {item.measure}
              </span>
              <span className="text-body-sm text-ink-soft">{item.place}</span>
            </li>
          ))}
        </Reveal>

        <Reveal delay={60} className="tablet:col-start-1 tablet:row-start-2">
          <LinkButton href="/location" variant="ghost">
            Location detail
            <Icon name="arrowRight" size={16} />
          </LinkButton>
        </Reveal>
      </div>
    </section>
  );
}
