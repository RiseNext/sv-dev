import { notFound } from 'next/navigation';
import { ProjectDetail } from '@/components/sections/ProjectDetail';
import { getProject, projects } from '@/content/projects';
import { projectMetadata } from '@/lib/seo';

type Params = { slug: string };

/** Pre-renders every project at build time; the route is fully static. */
export function generateStaticParams(): Params[] {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return projectMetadata(project);
}

/* The page is deliberately thin: all five projects render through the single
   ProjectDetail template, driven entirely by the record in content/projects.ts. */
export default async function ProjectPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return <ProjectDetail project={project} />;
}
