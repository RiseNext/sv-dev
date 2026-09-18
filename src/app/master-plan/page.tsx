import { PageHero } from '@/components/layout/PageHero';
import { LinkButton } from '@/components/ui/Button';
import { IconList } from '@/components/ui/IconList';
import { Lightbox } from '@/components/ui/Lightbox';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { CtaBanner } from '@/components/sections/CtaBanner';
import { MediaFeature } from '@/components/sections/MediaFeature';
import { masterPlan, media } from '@/content/pages';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Master plan',
  description:
    'The approved layout: plot numbering, internal road network and open-space allocation, with a downloadable PDF.',
  path: '/master-plan',
});

export default function MasterPlanPage() {
  return (
    <>
      <PageHero
        eyebrow={masterPlan.hero.eyebrow}
        title={masterPlan.hero.title}
        lead={masterPlan.hero.lead}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Master plan' }]}
      />

      <Section width="wide" aria-labelledby="plan-title">
        <SectionHeading
          eyebrow="Approved drawing"
          title="The layout in full"
          lead="Tap to enlarge and pinch to zoom. Ask for a printed copy at any site visit."
          id="plan-title"
          action={
            <LinkButton href={masterPlan.downloadHref} variant="outline">
              Download PDF
            </LinkButton>
          }
        />
        <Lightbox image={media.masterPlan} downloadHref={masterPlan.downloadHref} />
      </Section>

      <Section tone="surface" aria-labelledby="notes-title">
        <SectionHeading eyebrow="At a glance" title="Key dimensions" id="notes-title" />
        <IconList items={masterPlan.notes} />
      </Section>

      <Section id="plot-sizes" aria-labelledby="sizes-title">
        <MediaFeature
          eyebrow={masterPlan.plotSizes.eyebrow}
          title={masterPlan.plotSizes.title}
          id="sizes-title"
          paragraphs={[masterPlan.plotSizes.lead]}
          image={media.plotSizes}
          actions={<LinkButton href="/contact">Check availability</LinkButton>}
        />
      </Section>

      <CtaBanner />
    </>
  );
}
