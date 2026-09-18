import { Reveal } from '@/components/ui/Reveal';
import { ClosingCta } from '@/components/sections/ClosingCta';
import { FeatureList } from '@/components/sections/FeatureList';
import { PageHero } from '@/components/sections/PageHero';
import { amenities } from '@/content/pages';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Amenities',
  description: amenities.hero.lead,
  path: '/amenities',
});

export default function AmenitiesPage() {
  return (
    <>
      <PageHero
        label={amenities.hero.eyebrow}
        title="What is already built"
        titleAccent="before a plot is sold"
        lead={amenities.hero.lead}
      />

      <FeatureList
        id="specifications"
        label="Specifications"
        title="Seven pieces"
        titleAccent="of infrastructure"
        items={amenities.specifications}
      />

      <section className="px-gutter pt-section" aria-labelledby="maintenance-title">
        <Reveal className="container-prose rounded-media bg-surface p-8 tablet:p-12">
          <p className="label-mono font-mono">{amenities.maintenance.eyebrow}</p>
          <h2 id="maintenance-title" className="mt-5 max-w-[18ch] text-heading-md text-ink">
            {amenities.maintenance.title}
          </h2>
          <div className="mt-6 flex flex-col gap-4">
            {amenities.maintenance.body.map((paragraph) => (
              <p key={paragraph} className="text-body-md text-ink-soft">
                {paragraph}
              </p>
            ))}
          </div>
        </Reveal>
      </section>

      <ClosingCta />
    </>
  );
}
