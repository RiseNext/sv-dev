import { notFound } from 'next/navigation';
import { ProjectDetail } from '@/components/sections/ProjectDetail';
import { getProject, getProjects } from '@/lib/api/projects';
import { getSiteSettings } from '@/lib/api/site';
import { projectMetadata } from '@/lib/seo';

type Params = { slug: string };

/** Pre-renders every PUBLISHED project at build time.
 *
 *  `dynamicParams` is left at its default `true` on purpose: that is the
 *  natural ISR hook for a project published AFTER the last build. It renders on
 *  first request and is cached from then on, so a new project is live without a
 *  redeploy. */
export async function generateStaticParams(): Promise<Params[]> {
  const projects = await getProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const [project, site] = await Promise.all([getProject(slug), getSiteSettings()]);
  if (!project) return {};
  // The fetch cache dedupes this against the page's own getProject() call.
  return projectMetadata(project, site.name);
}

/* The page is deliberately thin: every project renders through the single
   ProjectDetail template, driven entirely by the CMS record. */
export default async function ProjectPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const project = await getProject(slug);

  /* An unpublished or archived project 404s here because the API returns 404 —
     never 403, which would confirm the document exists. */
  if (!project) notFound();

  return <ProjectDetail project={project} />;
}
