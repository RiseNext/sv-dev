import { LinkButton } from '@/components/ui/Button';
import { PageHero } from '@/components/layout/PageHero';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ProjectGrid } from '@/components/sections/ProjectGrid';
import { projects } from '@/content/projects';

export default function NotFound() {
  return (
    <>
      <PageHero
        eyebrow="404"
        title="We could not find that page"
        lead="The link may be out of date, or the page may have moved. Here is where most people are heading."
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Not found' }]}
      />

      <Section>
        <SectionHeading
          eyebrow="Our projects"
          title="Browse the layouts"
          lead="Five layouts, from open for booking through to completed and handed over."
          action={<LinkButton href="/contact">Book a site visit</LinkButton>}
        />
        <ProjectGrid items={projects} />
      </Section>
    </>
  );
}
