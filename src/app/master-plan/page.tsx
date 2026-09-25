import { Icon } from '@/components/ui/Icon';
import { Lightbox } from '@/components/ui/Lightbox';
import { Plate } from '@/components/ui/Media';
import { Reveal } from '@/components/ui/Reveal';
import { ClosingCta } from '@/components/sections/ClosingCta';
import { PageHero } from '@/components/sections/PageHero';
import { Statement } from '@/components/sections/Statement';
import { masterPlan, media } from '@/content/pages';
import { getSiteSettings } from '@/lib/api/site';
import { pageMetadata } from '@/lib/seo';

/* See /amenities: a module-level `metadata` constant cannot await, so this page
   was taking the hardcoded site-name default. Now CMS-sourced like the rest. */
export async function generateMetadata() {
  const site = await getSiteSettings();
  return pageMetadata({
    title: 'Master plan',
    description: masterPlan.hero.lead,
    path: '/master-plan',
    siteName: site.name,
  });
}

export default function MasterPlanPage() {
  return (
    <>
      <PageHero
        label={masterPlan.hero.eyebrow}
        title="The approved layout,"
        titleAccent="plot by plot"
        lead={masterPlan.hero.lead}
      />

      <section className="px-gutter pt-16" aria-label="Master plan">
        <Reveal className="container-page">
          <Lightbox image={media.masterPlan} downloadHref={masterPlan.downloadHref} />
        </Reveal>

        <ul className="container-page mt-4 grid gap-px overflow-hidden rounded-card bg-line mid:grid-cols-2 tablet:grid-cols-4">
          {masterPlan.notes.map((note) => (
            <li key={note.title} className="flex items-start gap-3 bg-surface p-6">
              <Icon name={note.icon} size={20} className="mt-0.5 shrink-0 text-gold-ink" />
              <span className="text-body-sm text-ink">{note.title}</span>
            </li>
          ))}
        </ul>
      </section>

      <Statement
        id="plot-sizes"
        label={masterPlan.plotSizes.eyebrow}
        title="Four standard sizes,"
        titleAccent="east and north facing"
        lead={masterPlan.plotSizes.lead}
      />

      <Reveal className="container-page mt-14 px-gutter">
        <Plate image={media.plotSizes} />
      </Reveal>

      <ClosingCta />
    </>
  );
}
