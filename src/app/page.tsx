import { LinkButton } from '@/components/ui/Button';
import { FeatureGrid } from '@/components/ui/FeatureGrid';
import { ProximityList } from '@/components/ui/ProximityList';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { CtaBanner } from '@/components/sections/CtaBanner';
import { HomeHero } from '@/components/sections/HomeHero';
import { MediaFeature } from '@/components/sections/MediaFeature';
import { ProjectGrid } from '@/components/sections/ProjectGrid';
import { Testimonials } from '@/components/sections/Testimonials';
import { amenities, home, location, masterPlan, media } from '@/content/pages';
import { featuredProjects } from '@/content/projects';
import { site } from '@/content/site';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Approved residential plots',
  description: site.description,
  path: '/',
});

/* The home page is a summary with a route behind each section, not the whole
   site flattened into one scroll. Each block ends in a link to the page that
   carries the detail. */

export default function HomePage() {
  return (
    <>
      <HomeHero />

      <Section id="why" aria-labelledby="why-title">
        <SectionHeading
          eyebrow={home.intro.eyebrow}
          title={home.intro.title}
          lead={home.intro.lead}
          id="why-title"
          action={<LinkButton href="/about" variant="outline">About SV Developers</LinkButton>}
        />
        <FeatureGrid items={home.benefits} />
      </Section>

      {/* Featured projects read from content/projects.ts — the same records the
          catalogue and the detail pages use. Nothing about a project is
          restated here, so the homepage can never drift from /projects. */}
      <Section tone="surface" aria-labelledby="projects-title">
        <SectionHeading
          eyebrow="Our projects"
          title="Featured projects"
          lead="Premium villa plots, farm villa plots, residential plots and apartments across Aler, Bhongir and Genome Valley."
          id="projects-title"
          action={<LinkButton href="/projects" variant="outline">All projects</LinkButton>}
        />
        <ProjectGrid items={featuredProjects} />
      </Section>

      <Section aria-labelledby="plan-title">
        <MediaFeature
          eyebrow={masterPlan.hero.eyebrow}
          title="See exactly what you are buying"
          id="plan-title"
          paragraphs={[
            'Every project page carries its own layout plan and location map, opened full screen and zoomable so the plot numbering stays readable.',
            'Ask for a printed copy at a site visit.',
          ]}
          image={media.masterPlan}
          actions={
            <>
              <LinkButton href="/projects">Browse the projects</LinkButton>
              <LinkButton href="/contact" variant="outline">
                Ask a question
              </LinkButton>
            </>
          }
        />
      </Section>

      <Section tone="surface" aria-labelledby="amenities-title">
        <SectionHeading
          eyebrow={amenities.hero.eyebrow}
          title={amenities.hero.title}
          lead={amenities.hero.lead}
          id="amenities-title"
          action={<LinkButton href="/amenities" variant="outline">All amenities</LinkButton>}
        />
        <FeatureGrid items={amenities.specifications.slice(0, 6)} />
      </Section>

      <Section aria-labelledby="location-title">
        <SectionHeading
          eyebrow={location.intro.eyebrow}
          title={location.intro.title}
          lead={location.intro.lead}
          id="location-title"
          action={<LinkButton href="/location" variant="outline">Location detail</LinkButton>}
        />
        <ProximityList items={location.proximity.slice(0, 8)} />
      </Section>

      <Section tone="dark" aria-labelledby="reviews-title">
        <SectionHeading
          eyebrow="Client reviews"
          title="What buyers say"
          id="reviews-title"
          align="center"
        />
        <Testimonials />
      </Section>

      <CtaBanner />
    </>
  );
}
