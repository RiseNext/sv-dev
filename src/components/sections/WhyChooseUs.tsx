import { Icon } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import { Wave } from '@/components/ui/Wave';
import { home } from '@/content/pages';

/* =============================================================================
   WHY CHOOSE US — the design template's dark band.

   Deep forest green, cut into the cream page by a wave at each edge, with a
   centred heading and four outlined cards — a gold-ringed icon and a title.
   `theme-dark` flips every text token inside to its light value, so the
   heading and labels need no colour classes of their own.

   The cards are titles picked from `home.benefits` (see `home.whyChoose`), so
   the wording is shared with the rest of the site rather than rewritten here.
   ========================================================================== */

export function WhyChooseUs() {
  const { eyebrow, title, lead, picks } = home.whyChoose;
  const cards = picks
    .map((pick) => home.benefits.find((benefit) => benefit.title === pick))
    .filter((benefit) => benefit !== undefined);

  if (cards.length === 0) return null;

  return (
    <section
      className="theme-dark relative mt-section bg-forest px-gutter py-24 tablet:py-36"
      aria-labelledby="choose-title"
    >
      <Wave edge="top" />
      <Wave edge="bottom" />

      <div className="container-page relative">
        <Reveal className="flex flex-col items-center text-center">
          <p className="eyebrow">{eyebrow}</p>
          <h2 id="choose-title" className="mt-5 max-w-[20ch] text-heading-lg text-ink">
            {title}
          </h2>
          <p className="mt-4 max-w-[48ch] text-body-md text-ink-soft">{lead}</p>
        </Reveal>

        <ul className="mt-12 grid grid-cols-2 gap-3 tablet:mt-14 tablet:grid-cols-4 tablet:gap-5">
          {cards.map((card, index) => (
            <Reveal
              as="li"
              key={card.title}
              delay={index * 80}
              className="flex flex-col items-center gap-5 rounded-2xl border border-gold/40 bg-white/[0.03] px-4 py-8 text-center tablet:py-10"
            >
              <span className="flex size-16 items-center justify-center rounded-full border border-gold/60 text-gold-ink shadow-[inset_0_0_0_6px_rgba(201,169,120,0.08)]">
                <Icon name={card.icon} size={28} />
              </span>
              <span className="text-body-md font-medium text-ink">{card.title}</span>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
