import { PageHero } from '@/components/layout/PageHero';
import { FeatureGrid } from '@/components/ui/FeatureGrid';
import { IconList } from '@/components/ui/IconList';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { StatRow } from '@/components/ui/StatRow';
import { CtaBanner } from '@/components/sections/CtaBanner';
import { about, home, media } from '@/content/pages';
import { MediaFeature } from '@/components/sections/MediaFeature';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'About us',
  description:
    'SV Developers has been laying out and selling fully developed residential plots since [YEAR]. Infrastructure first, then sale.',
  path: '/about',
});

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow={about.hero.eyebrow}
        title={about.hero.title}
        lead={about.hero.lead}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'About' }]}
      >
        <StatRow items={home.hero.stats} />
      </PageHero>

      <Section aria-labelledby="story-title">
        <MediaFeature
          eyebrow={about.story.eyebrow}
          title={about.story.title}
          id="story-title"
          paragraphs={about.story.body}
          image={media.plotSizes}
          reversed
        />
      </Section>

      <Section tone="surface" aria-labelledby="values-title">
        <SectionHeading eyebrow="How we work" title="Four things we do not compromise on" id="values-title" />
        <FeatureGrid items={about.values} />
      </Section>

      <Section id="approvals" aria-labelledby="approvals-title">
        <SectionHeading
          eyebrow={about.approvals.eyebrow}
          title={about.approvals.title}
          lead={about.approvals.lead}
          id="approvals-title"
        />
        <IconList items={about.approvals.items} />
      </Section>

      <CtaBanner />
    </>
  );
}
