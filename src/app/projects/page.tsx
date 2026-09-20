import { ClosingCta } from '@/components/sections/ClosingCta';
import { PageHero } from '@/components/sections/PageHero';
import { ProjectCatalogue } from '@/components/sections/ProjectCatalogue';
import { getProjects, usedCategories } from '@/lib/api/projects';
import { getSiteSettings } from '@/lib/api/site';
import { pageMetadata } from '@/lib/seo';

/* A module-level `metadata` constant cannot await, so this became a function.
   The emitted metadata is unchanged apart from the site name now being real. */
export async function generateMetadata() {
  const site = await getSiteSettings();
  return pageMetadata({
    title: 'Projects',
    description:
      'Premium villa plots, farm villa plots, residential plots and apartments by SV Developers across Aler, Bhongir and Genome Valley.',
    path: '/projects',
    siteName: site.name,
  });
}

export default async function ProjectsPage() {
  const [projects, categories] = await Promise.all([getProjects(), usedCategories()]);

  /* ⚠️ THE COUNT-COUPLED HEADING.
     This read "Five layouts." — a hardcoded number that silently becomes a LIE
     the first time an admin publishes a sixth project, which is precisely when
     the CMS starts being useful. It is now derived. */
  const count = projects.length;
  const spelled =
    ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'][count] ??
    String(count);

  return (
    <>
      <PageHero
        label="Our projects"
        title={`${spelled} layout${count === 1 ? '' : 's'}.`}
        titleAccent="Every one of them finished."
        lead="Premium villa plots, farm villa plots, residential plots and apartments across the Warangal highway corridor and Genome Valley."
      />

      <ProjectCatalogue projects={projects} categories={categories} />

      <ClosingCta />
    </>
  );
}
