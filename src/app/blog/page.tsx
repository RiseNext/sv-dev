import { PageHero } from '@/components/sections/PageHero';
import { BlogIndex } from '@/components/sections/BlogIndex';
import { getBlogPosts } from '@/lib/api/blog';
import { getSiteSettings } from '@/lib/api/site';
import { pageMetadata } from '@/lib/seo';

/* =============================================================================
   /blog — the article and video index.

   The route the README has advertised since the rebuild and that has never
   existed. `docs/PRD-redesign.md` specified it as the "stories-page
   treatment": rounded cards in a loose row, a mono date badge, the title in
   the display serif, and a full-width feature card for the latest post. That
   is what this is.

   ─── WHERE THE POSTS COME FROM ────────────────────────────────────────────
   `getBlogPosts()`, and nothing is hardcoded. ✅ THE ENDPOINT NOW EXISTS:
   `GET /api/v1/blog-posts` returns published posts newest-first in card shape.
   With no published posts it returns `200 {"data": []}` and this page renders
   its honest empty state — see `BlogIndex`. The contract is `src/types/blog.ts`,
   which svbackend vendors and byte-diffs in its `check:drift`.

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
  /* 🔴 THE DEV PREVIEW IS GONE, and `lib/dev/previewBlogPosts.ts` with it. It
     existed so the design could be judged before any endpoint answered, and its
     five hand-written records are exactly the thing that must not linger once a
     real one does: placeholder prose that reads as genuine published articles.

     `getBlogPosts()` keeps its `fallback: []`, which is still load-bearing —
     it is what stops a backend outage during a build failing the whole
     production build rather than one page. So an empty list here means either
     "nothing published yet" or "the CMS was unreachable at build time", and
     both correctly render the empty state rather than inventing content. */
  const posts = await getBlogPosts();

  return (
    <>
      <PageHero
        label="Blog"
        title="Notes from the ground."
        titleAccent="In writing, and on camera."
        lead="Articles, site updates and walkthrough videos from the SV Developers team."
      />

      <BlogIndex posts={posts} />

      <div className="pb-section-sm" />
    </>
  );
}
