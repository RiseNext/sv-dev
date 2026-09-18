import { LinkButton } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { ctaBanner } from '@/content/pages';

/* The last thing before the footer: one full-width rounded band carrying a
   single line and one action. On the reference it is a photograph; here it is
   the page's one block of colour, which is also the only place gold appears at
   full strength. Swap `bg-band` for a <Frame> when photography lands. */

export function ClosingCta({
  title = ctaBanner.title,
  body = ctaBanner.body,
}: {
  title?: string;
  body?: string;
}) {
  return (
    <section className="px-gutter pt-section" aria-labelledby="cta-title">
      <div className="container-page">
        <Reveal className="flex flex-col items-center rounded-band bg-band px-6 py-20 text-center tablet:py-28">
          <h2 id="cta-title" className="max-w-[16ch] text-heading-lg text-ink">
            {title}
          </h2>
          <p className="mt-5 max-w-[48ch] text-body-md text-ink-soft">{body}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            <LinkButton href={ctaBanner.primary.href} size="lg">
              {ctaBanner.primary.label}
            </LinkButton>
            <LinkButton href={ctaBanner.secondary.href} variant="light" size="lg">
              {ctaBanner.secondary.label}
            </LinkButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
