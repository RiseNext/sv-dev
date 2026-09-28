import { PageHero } from '@/components/sections/PageHero';
import {
  GalleryWall,
  type GalleryFilter,
  type GalleryPhoto,
} from '@/components/sections/GalleryWall';
import { getProject, getProjects } from '@/lib/api/projects';
import { getSiteSettings } from '@/lib/api/site';
import { pageMetadata } from '@/lib/seo';

/* =============================================================================
   /gallery — every photograph on the site, in one place.

   ─── WHERE THE PHOTOGRAPHS COME FROM ──────────────────────────────────────
   There is no site-wide gallery endpoint on the CMS. The photographs live on
   each PROJECT record — the `gallery` array, plus the project's own cover
   `image` — and only the single-project endpoint returns them, so this page
   reads the list and then each record. That is one request per project at
   BUILD or REVALIDATE time, never per visitor, and both reads are the
   existing tagged readers: publishing a project already busts this page's
   cache along with the project's own.

   Layout plans (`layoutImage`) are deliberately NOT here. A plan is read, not
   looked at — the plot numbering is the content — so it belongs at full width
   in the project page's zoomable Lightbox, not cropped into a photo wall.
   ========================================================================== */

export async function generateMetadata() {
  const site = await getSiteSettings();
  return pageMetadata({
    title: 'Gallery',
    description:
      'Photographs of every SV Developers layout as it stands — roads, gates, plantation and handover across the Warangal highway corridor and Genome Valley.',
    path: '/gallery',
    siteName: site.name,
  });
}

export default async function GalleryPage() {
  const projects = await getProjects();
  const records = await Promise.all(projects.map((project) => getProject(project.slug)));

  /* Cover first, then the project's own gallery, deduplicated by `src` — the
     cover is often also the first gallery photograph, and the same picture
     twice in a row reads as a bug. */
  const photos: GalleryPhoto[] = [];
  const filters: GalleryFilter[] = [];

  records.forEach((record, index) => {
    if (!record) return;
    const listed = projects[index];
    const seen = new Set<string>();
    let count = 0;

    for (const image of [record.image, ...(record.gallery ?? [])]) {
      if (!image?.src || seen.has(image.src)) continue;
      seen.add(image.src);
      count += 1;
      photos.push({
        src: image.src,
        alt: image.alt || `${record.name} — photograph ${count}`,
        width: image.width,
        height: image.height,
        projectSlug: record.slug,
        projectName: record.name,
        projectLocality: record.locality ?? listed?.locality ?? '',
      });
    }

    if (count > 0) filters.push({ slug: record.slug, name: record.name, count });
  });

  /* ⚠️ COUNT-COUPLED COPY, derived — the same rule the projects page follows.
     A hardcoded number here becomes a lie the first time an admin uploads a
     photograph, which is exactly when the CMS starts being useful. */
  const total = photos.length;

  return (
    <>
      <PageHero
        label="Gallery"
        title={`${total} photograph${total === 1 ? '' : 's'}.`}
        titleAccent="Not a render among them."
        lead="The layouts as they stand today — roads laid, gates up, plantation in, plots handed over. Filter by project, or open any photograph full screen."
      />

      <GalleryWall photos={photos} filters={filters} />

      {/* The closing "Come and walk the layout" band was removed on request —
          see the note in app/page.tsx. */}

      <div className="pb-section-sm" />
    </>
  );
}
