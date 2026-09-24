import { LinkButton } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { Wave } from '@/components/ui/Wave';

/* =============================================================================
   CTA BAND — the project page's closing ask.

   The project template's last band: pale sand, curving in from the cream page
   above, with a centred heading, one line and the gold "Book a site visit".
   It has no bottom wave of its own — when it is the last thing on the page,
   the footer's top wave is redrawn in sand (globals.css), so the band curves
   straight down into the dark footer.
   ========================================================================== */

export function CtaBand({
  title,
  body,
  href = '/contact',
  label = 'Book a site visit',
}: {
  title: string;
  body: string;
  href?: string;
  label?: string;
}) {
  return (
    <section
      className="cta-band theme-light relative mt-section bg-sand px-gutter pb-20 pt-24 tablet:pb-24 tablet:pt-32"
      aria-labelledby="cta-band-title"
    >
      <Wave edge="top" />
      <Reveal className="container-page relative flex flex-col items-center text-center">
        <h2 id="cta-band-title" className="max-w-[20ch] text-heading-lg text-ink">
          {title}
        </h2>
        <p className="mt-4 max-w-[52ch] text-body-md text-ink-soft">{body}</p>
        <LinkButton href={href} variant="gold" size="lg" className="mt-8">
          {label}
        </LinkButton>
      </Reveal>
    </section>
  );
}
