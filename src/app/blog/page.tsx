import { PageHero } from '@/components/sections/PageHero';
import { BlogIndex } from '@/components/sections/BlogIndex';
import { getBlogPosts } from '@/lib/api/blog';
import { getSiteSettings } from '@/lib/api/site';
import { previewBlogPosts } from '@/lib/dev/previewBlogPosts';
import { pageMetadata } from '@/lib/seo';

/* =============================================================================
   /blog — the article and video index.

   The route the README has advertised since the rebuild and that has never
   existed. `docs/PRD-redesign.md` specified it as the "stories-page
   treatment": rounded cards in a loose row, a mono date badge, the title in
   the display serif, and a full-width feature card for the latest post. That
   is what this is.

   ─── WHERE THE POSTS COME FROM ────────────────────────────────────────────
   `getBlogPosts()`, and nothing is hardcoded. The endpoint does not exist yet,
   so in production this page renders its empty state — see `BlogIndex` — and
   starts showing posts the moment the API answers, with no deploy. The
   contract the backend builds against is `src/types/blog.ts`; the four things
   it has to do are listed at the top of `src/lib/api/blog.ts`.

   NO COUNT IN THE HEADING, unlike /projects and /gallery. Those derive their
   number because the copy they replaced hardcoded one — "Five layouts." was a
   lie waiting for a sixth project. There is no number in this headline to go
   stale, and "No posts." is a poor thing for a page to open with on the day
   before the first one is published.
   ========================================================================== */

export async function generateMetadata() {
  const site = await getSiteSettings();
  return pageMetadata({
    title: 'Blog',
    description:
      'Articles, site updates and walkthrough videos from SV Developers — what to check before buying a plot, and how the layouts across the Warangal highway corridor and Genome Valley are progressing.',
    path: '/blog',
    siteName: site.name,
  });
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  /* 🔶 THE DEV PREVIEW, and the same arrangement the hero's video fallback
     uses: the CMS wins the moment it returns anything, so nothing here needs
     unpicking when the endpoint ships — the whole mechanism goes quiet on its
     own. `previewBlogPosts()` returns [] outside development, so this is an
     empty list in production whatever happens.

     A LENGTH CHECK RATHER THAN `??`, because the data layer's `fallback: []`
     means an absent endpoint arrives as an empty array, never as undefined. */
  const visible = posts.length > 0 ? posts : previewBlogPosts();

  return (
    <>
      <PageHero
        label="Blog"
        title="Notes from the ground."
        titleAccent="In writing, and on camera."
        lead="Articles, site updates and walkthrough videos from the SV Developers team."
      />

      <BlogIndex posts={visible} />

      <div className="pb-section-sm" />
    </>
  );
}
