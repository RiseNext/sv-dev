import type { Metadata } from 'next';
import type { Project } from '@/types/content';

/* `site.name` used to be imported from a static module. It is now CMS data, so
   it arrives as an argument instead. The SEO SHAPE is unchanged — same title
   template, same canonical, same OpenGraph fields.

   ⚠️ `metadataBase` is NOT set from `site.url` any more. That value was
   `https://www.example.com` — the ONE unbracketed placeholder in the whole
   repository, which `isPlaceholder()` could never catch, and which fed every
   canonical URL, every OG url and all 12 sitemap entries. It now comes from
   NEXT_PUBLIC_SITE_URL, so a wrong value is a configuration error rather than a
   silently-shipped lie. */

/** Builds page metadata with a consistent title template and OG defaults. */
export function pageMetadata({
  title,
  description,
  path = '/',
  image,
  siteName,
}: {
  title: string;
  description: string;
  path?: string;
  image?: { url: string; alt: string; width: number; height: number };
  /* 🔴 REQUIRED, AND IT USED TO BE OPTIONAL WITH A HARDCODED DEFAULT.
     The default was `'SV Developers'`, and three pages — /amenities, /location
     and /master-plan — silently took it, because they were plain `export const
     metadata` and had no way to await the CMS. The company name is CMS data, so
     those three would have kept the old name the day it was changed in Admin,
     while the other four updated. Nothing would have reported it.

     Making this required turns that into a compile error. The claimed
     justification for the default — "so a metadata call during an outage still
     produces a valid document" — never held: every caller awaits
     getSiteSettings() on the line above, so an outage throws before this is
     reached. */
  siteName: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | ${siteName}`,
      description,
      url: path,
      siteName,
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
export function projectMetadata(project: Project, siteName: string): Metadata {
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
    siteName,
    path: `/projects/${project.slug}`,
    image: {
      url: project.image.src,
      alt: project.image.alt,
      width: project.image.width,
      height: project.image.height,
    },
  });
}
