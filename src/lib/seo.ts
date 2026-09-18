import type { Metadata } from 'next';
import { site } from '@/content/site';
import type { Project } from '@/types/content';

/** Builds page metadata with a consistent title template and OG defaults. */
export function pageMetadata({
  title,
  description,
  path = '/',
  image,
}: {
  title: string;
  description: string;
  path?: string;
  image?: { url: string; alt: string; width: number; height: number };
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | ${site.name}`,
      description,
      url: path,
      siteName: site.name,
      type: 'website',
      ...(image ? { images: [image] } : {}),
    },
  };
}

/* =============================================================================
   Per-project metadata, generated from the project record so a new project
   gets a unique title, description, canonical and OG image with no extra work.

   The description is assembled from facts already in the data — category,
   locality, approval, extent — never from marketing language. Superlatives
   ("best plots", "No.1 developer", "guaranteed returns") are absent by
   construction: there is no field they could come from.
   ========================================================================== */
export function projectMetadata(project: Project): Metadata {
  const title = project.seo?.title ?? `${project.name} | ${project.category}`;

  /* Falls back to the summary, which is itself brochure-derived. The assembled
     form is preferred because it front-loads the facts a search result needs:
     what it is, where it is, and what approval it carries. */
  const description =
    project.seo?.description ??
    [
      `${project.name} — ${project.category.toLowerCase()} at ${project.locality}`,
      project.approvals?.[0]?.title,
      project.area ? `Total area ${project.area}` : undefined,
    ]
      .filter(Boolean)
      .join('. ') + '.';

  return pageMetadata({
    title,
    description,
    path: `/projects/${project.slug}`,
    image: {
      url: project.image.src,
      alt: project.image.alt,
      width: project.image.width,
      height: project.image.height,
    },
  });
}
