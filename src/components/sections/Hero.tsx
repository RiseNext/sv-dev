import { Icon, type IconName } from '@/components/ui/Icon';
import { EnquiryPill } from '@/components/sections/EnquiryPill';
import { Ticker } from '@/components/sections/Ticker';
import { home } from '@/content/pages';
import { cx } from '@/lib/cx';

/* =============================================================================
   HERO

   Two modes, one component.

   `media` — a silent looping video (or a single photograph) running full-bleed
   behind white type. This is the design as specified, and it needs footage:
   drone approach over a finished layout, roads and boundary wall visible.

   Type-only — the fallback while there is no footage. The reference site runs
   the same treatment on its company page, so this is a designed state rather
   than a broken one: black type on the off-white field, nothing else.

   Pass `media` when real footage lands in public/media and the mode switches.
   ========================================================================== */

export function Hero({
  media,
  siteName,
  whatsapp,
  ticker: tickerOverride,
}: {
  media?: { src: string; poster: string };
  /* Threaded down from the page, because EnquiryPill is a 'use client' module
     and cannot read the CMS itself. */
  siteName: string;
  whatsapp: string;
  /* The scrolling claims, now CMS-managed. Falls back to the static copy so
     the hero is never empty during an outage. */
  ticker?: readonly { icon: IconName; text: string }[];
}) {
  const { eyebrow, title, titleAccent } = home.hero;
  const ticker = tickerOverride?.length ? tickerOverride : home.hero.ticker;
  const onMedia = Boolean(media);

  return (
    <section
      className={cx(
        'relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-gutter pb-8 pt-28',
        onMedia && 'on-dark',
      )}
      aria-labelledby="hero-title"
    >
      {media ? (
        <>
          <video
            className="absolute inset-0 -z-20 h-full w-full object-cover"
            src={media.src}
            poster={media.poster}
            autoPlay
            muted
            loop
            playsInline
          />
          {/* Just enough scrim to hold AA on white type over moving footage. */}
          <div className="absolute inset-0 -z-10 bg-ink/35" aria-hidden="true" />
        </>
      ) : null}

      <p
        className={cx(
          'label-mono animate-rise font-mono',
          onMedia ? 'text-white/80' : 'text-ink-faint',
        )}
      >
        {eyebrow}
      </p>

      <h1
        id="hero-title"
        className={cx(
          'mt-6 max-w-[16ch] text-balance text-center text-heading-xl',
          onMedia ? 'text-white' : 'text-ink',
        )}
        style={{ animation: 'rise 700ms var(--ease-out-soft) 120ms backwards' }}
      >
        {title} <em>{titleAccent}</em>
      </h1>

      <div
        className="mt-8 flex flex-col items-center gap-4"
        style={{ animation: 'rise 700ms var(--ease-out-soft) 260ms backwards' }}
      >
        <p className={cx('text-body-md font-medium', onMedia ? 'text-white' : 'text-ink')}>
          What you are buying is already on the ground
        </p>
        <Ticker
          items={ticker.map((item) => ({ icon: item.icon as IconName, text: item.text }))}
          tone={onMedia ? 'invert' : 'default'}
        />
      </div>

      {/* With footage behind it the capture pill is pinned to the bottom edge,
          as on the reference. Without, it sits with the type — a 90svh column
          of empty off-white reads as a broken page, not as restraint. */}
      <div
        className={cx('w-full', onMedia ? 'mt-auto pt-16' : 'mt-12')}
        style={{ animation: 'rise 700ms var(--ease-out-soft) 380ms backwards' }}
      >
        <EnquiryPill siteName={siteName} whatsapp={whatsapp} />
      </div>

      <p
        className={cx(
          'mt-5 inline-flex items-center gap-2 text-body-xs',
          onMedia ? 'text-white/75' : 'text-ink-faint',
        )}
      >
        <Icon name="mapPin" size={14} />
        Aler · Bhongir · Genome Valley
      </p>
    </section>
  );
}
