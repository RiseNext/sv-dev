import { ClosingCta } from '@/components/sections/ClosingCta';
import { PageHero } from '@/components/sections/PageHero';
import { ProjectCatalogue } from '@/components/sections/ProjectCatalogue';
import { projects, usedCategories } from '@/content/projects';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Projects',
  description:
    'Premium villa plots, farm villa plots, residential plots and apartments by SV Developers across Aler, Bhongir and Genome Valley.',
  path: '/projects',
});

export default function ProjectsPage() {
  return (
    <>
      <PageHero
        label="Our projects"
        title="Five layouts."
        titleAccent="Every one of them finished."
        lead="Premium villa plots, farm villa plots, residential plots and apartments across the Warangal highway corridor and Genome Valley."
      />

      <ProjectCatalogue projects={projects} categories={usedCategories()} />

      <ClosingCta />
    </>
  );
}
