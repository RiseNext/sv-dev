import 'server-only';
import { cache } from 'react';
import type { Project, ProjectCategory } from '@/types/content';
import { getJson, getJsonOrNull } from './client';

/* =============================================================================
   PROJECTS.

   ⚠️ THE TYPES ARE UNCHANGED. Every function returns `Project` exactly as
   `src/types/content.ts` declares it — the same type the static array used to
   satisfy. That is what makes this a source swap rather than a migration: no
   call site, no component and no rendered output changes.

   `cache()` dedupes within a single render pass, so a page that calls
   getProject() from both generateMetadata and the component itself makes ONE
   request, not two.
   ========================================================================== */

/** The card shape. A subset of Project — enough for cards, the catalogue, the
 *  nav, the footer, the sitemap and the contact form's <select>. */
export type ProjectCard = Pick<
  Project,
  'slug' | 'name' | 'category' | 'locality' | 'summary' | 'image' | 'featured'
> &
  Partial<Pick<Project, 'status' | 'tagline' | 'developer'>>;

export const getProjects = cache(async (): Promise<ProjectCard[]> => {
  // Returned in ADMIN ORDER — the backend sorts by the fractional-index column
  // that drag-reordering writes. Catalogue order IS admin order.
  return getJson<ProjectCard[]>('/projects', { tags: ['projects'], fallback: [] });
});

export const getProject = cache(async (slug: string): Promise<Project | null> => {
  return getJsonOrNull<Project>(`/projects/${encodeURIComponent(slug)}`, {
    tags: ['projects', `project:${slug}`],
  });
});

/** The homepage strip. Falls back to the first three, matching the previous
 *  behaviour of `featuredProjects` exactly. */
export const getFeaturedProjects = cache(async (): Promise<ProjectCard[]> => {
  const all = await getProjects();
  const flagged = all.filter((project) => project.featured);
  return flagged.length > 0 ? flagged : all.slice(0, 3);
});

/** Catalogue order for the category filter pills.
 *
 *  🔴 STAYS IN CODE, DELIBERATELY. It is a closed 4-value display order that is
 *  structural, not content: changing it requires a frontend deploy regardless,
 *  and modelling it in the CMS would buy an editor screen that cannot do
 *  anything a deploy would not also need. */
export const categoryOrder = [
  'Premium Villa Plots',
  'Farm Villa Plots',
  'Residential Plots',
  'Apartments',
] as const satisfies readonly ProjectCategory[];

/** Categories present in the PUBLISHED data, in catalogue order. A category is
 *  never shown empty. */
export const usedCategories = cache(async (): Promise<ProjectCategory[]> => {
  const all = await getProjects();
  return categoryOrder.filter((category) => all.some((project) => project.category === category));
});
