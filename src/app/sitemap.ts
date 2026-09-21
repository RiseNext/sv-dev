import type { MetadataRoute } from 'next';
import { getProjects } from '@/lib/api/projects';

const staticRoutes = [
  '/',
  '/about',
  '/projects',
  '/master-plan',
  '/amenities',
  '/location',
  '/contact',
];

/* Now async, and sourced from the PUBLISHED project set — so a project added in
   the CMS appears here without a code change, and an archived one disappears.

   The base URL comes from NEXT_PUBLIC_SITE_URL rather than from content, which
   is what stops `https://www.example.com` from reaching all 12 entries. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/+$/, '');
  const projects = await getProjects();

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    changeFrequency: 'monthly',
    priority: route === '/' ? 1 : 0.7,
  }));

  const projectEntries: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${siteUrl}/projects/${project.slug}`,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticEntries, ...projectEntries];
}
