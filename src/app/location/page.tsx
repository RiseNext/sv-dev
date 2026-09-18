import { PageHero } from '@/components/layout/PageHero';
import { LinkButton } from '@/components/ui/Button';
import { IconList } from '@/components/ui/IconList';
import { ProximityList } from '@/components/ui/ProximityList';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { CtaBanner } from '@/components/sections/CtaBanner';
import { MediaFeature } from '@/components/sections/MediaFeature';
import { location, media } from '@/content/pages';
import { site } from '@/content/site';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Location',
  description:
    'Drive times to the highway, employment, schools, healthcare and the airport from the site gate.',
  path: '/location',
});

export default function LocationPage() {
  return (
    <>
      <PageHero
        eyebrow={location.hero.eyebrow}
        title={location.hero.title}
        lead={location.hero.lead}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Location' }]}
      />

      <Section aria-labelledby="proximity-title">
        <SectionHeading
          eyebrow={location.intro.eyebrow}
          title={location.intro.title}
          lead={location.intro.lead}
          id="proximity-title"
          action={
            <LinkButton href={site.mapUrl} variant="outline">
              Open in Maps
            </LinkButton>
          }
        />
        <ProximityList items={location.proximity} />
      </Section>

      <Section tone="surface" aria-labelledby="map-title">
        <MediaFeature
          eyebrow="Getting here"
          title="Finding the site"
          id="map-title"
          paragraphs={[
            'The gate is on [ROAD NAME], [00] km past [LANDMARK] on the left. There is parking inside the compound.',
            'Call before you set out and someone will meet you at the gate and walk the layout with you.',
          ]}
          image={media.locationMap}
          actions={
            <>
              <LinkButton href={site.mapUrl}>Open in Maps</LinkButton>
              <LinkButton href="/contact" variant="outline">
                Get directions by phone
              </LinkButton>
            </>
          }
        />
        {/* An embedded interactive map belongs here. Lazy-load it — third-party
            map embeds are the heaviest thing that can land on a page like this,
            and this audience is on mid-range Android. */}
      </Section>

      <Section aria-labelledby="growth-title">
        <SectionHeading
          eyebrow={location.growth.eyebrow}
          title={location.growth.title}
          id="growth-title"
        />
        <IconList items={location.growth.items} />
      </Section>

      <CtaBanner />
    </>
  );
}
