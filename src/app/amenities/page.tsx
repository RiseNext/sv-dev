import { PageHero } from '@/components/layout/PageHero';
import { FeatureGrid } from '@/components/ui/FeatureGrid';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { CtaBanner } from '@/components/sections/CtaBanner';
import { MediaFeature } from '@/components/sections/MediaFeature';
import { amenities, media } from '@/content/pages';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Amenities',
  description:
    'Roads, drainage, water, electricity, lighting, landscaping and the boundary wall — all complete before a plot is released for sale.',
  path: '/amenities',
});

export default function AmenitiesPage() {
  return (
    <>
      <PageHero
        eyebrow={amenities.hero.eyebrow}
        title={amenities.hero.title}
        lead={amenities.hero.lead}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Amenities' }]}
      />

      <Section aria-labelledby="specs-title">
        <SectionHeading
          eyebrow="Specifications"
          title="Seven pieces of infrastructure"
          lead="Each one is finished and can be walked before the first plot in a layout goes on sale."
          id="specs-title"
        />
        <FeatureGrid items={amenities.specifications} />
      </Section>

      <Section tone="surface" aria-labelledby="maintenance-title">
        <MediaFeature
          eyebrow={amenities.maintenance.eyebrow}
          title={amenities.maintenance.title}
          id="maintenance-title"
          paragraphs={amenities.maintenance.body}
          image={media.locationMap}
          reversed
        />
      </Section>

      <CtaBanner />
    </>
  );
}
