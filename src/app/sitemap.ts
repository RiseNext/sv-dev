import type { MetadataRoute } from 'next';
import { site } from '@/content/site';
import { projects } from '@/content/projects';

const staticRoutes = [
  '/',
  '/about',
  '/projects',
  '/master-plan',
  '/amenities',
  '/location',
  '/contact',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [...staticRoutes, ...projects.map((project) => `/projects/${project.slug}`)];

  return routes.map((route) => ({
    url: `${site.url}${route}`,
    changeFrequency: 'monthly',
    priority: route === '/' ? 1 : 0.7,
  }));
}
