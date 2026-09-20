import { ClosingCta } from '@/components/sections/ClosingCta';
import { Corridor } from '@/components/sections/Corridor';
import { FeatureList } from '@/components/sections/FeatureList';
import { PageHero } from '@/components/sections/PageHero';
import { location } from '@/content/pages';
import { getSiteSettings } from '@/lib/api/site';
import { pageMetadata } from '@/lib/seo';

/* See /amenities: a module-level `metadata` constant cannot await, so this page
   was taking the hardcoded site-name default. Now CMS-sourced like the rest. */
export async function generateMetadata() {
  const site = await getSiteSettings();
  return pageMetadata({
    title: 'Location',
    description: location.hero.lead,
    path: '/location',
    siteName: site.name,
  });
}

export default function LocationPage() {
  return (
    <>
      <PageHero
        label={location.hero.eyebrow}
        title="On the corridor,"
        titleAccent="not beyond it"
        lead={location.hero.lead}
      />

      <Corridor />

      <FeatureList
        id="growth"
        label={location.growth.eyebrow}
        title="What is driving"
        titleAccent="demand here"
        items={location.growth.items}
      />

      <ClosingCta />
    </>
  );
}
