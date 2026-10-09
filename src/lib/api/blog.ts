import 'server-only';
import { cache } from 'react';
import type { BlogPost, BlogPostCard } from '@/types/blog';
import { getJson, getJsonOrNull } from './client';

/* =============================================================================
   BLOG POSTS — the data layer for /blog and /blog/[slug].

   Reuses `getJson` / `getJsonOrNull` unchanged, so the blog inherits the whole
   seam for free: server-only, build-or-revalidate-time, one-hour ISR floor, and
   on-demand revalidation by tag. Nothing in `client.ts` needed to change to
   make room for it.

   🔴 THE ENDPOINT DOES NOT EXIST YET (8 Oct 2026). `fallback: []` on the list
   is therefore LOAD-BEARING, not defensive: without it the 404 this gets today
   would throw `CmsUnavailableError` during "Collecting page data" and fail the
   whole production build — not just this page. With it, /blog builds, renders
   its empty state, and starts showing posts the moment the API answers.

   ─── WHAT THE BACKEND NEEDS TO DO, IN FULL ────────────────────────────────
   1. Two endpoints under the existing `/api/v1` base:

        GET /blog-posts          → { data: BlogPostCard[] }   (see PATH below)
        GET /blog-posts/<slug>   → { data: BlogPost }  · 404 when not published

      Both wrap the payload in `{ data: … }`, which is what `getJson` unwraps —
      the same envelope `/projects` and `/site-settings` already use.

   2. ORDER THE LIST NEWEST FIRST. The index does not sort: it takes the first
      row as the feature card and renders the rest in the order given, exactly
      as the catalogue treats admin order as catalogue order. So a pinned
      evergreen post is achievable later by a sort column, with no frontend
      change — and `featured` is deliberately NOT in the contract, because
      "the latest" and "the flagged one" would then be two sources for one slot.

   3. RETURN PUBLISHED POSTS ONLY, and 404 — never 403 — for an unpublished
      slug, so the endpoint cannot be used to confirm that a draft exists. The
      project detail route already relies on exactly this.

   4. POST to `/api/revalidate` on publish with `{ tags: ['blog'] }`, plus
      `blog:<slug>` when a single post changes. That route takes arbitrary tags
      already, so nothing needs adding there.
   ========================================================================== */

/* 🔴 THE ONE THING TO AGREE WITH THE BACKEND, kept in one place so settling it
   is a single edit rather than a search-and-replace across two routes.

   `blog-posts` is the guess, matching the collection name the frontend uses.
   If the CMS exposes it as `/posts` or `/articles`, change this line and
   nothing else. */
const PATH = '/blog-posts';

/**
 * Every published post, newest first, in CARD shape — no `body`.
 *
 * `cache()` dedupes within one render pass: /blog's `generateMetadata` and its
 * component both call this and make ONE request, not two.
 */
export const getBlogPosts = cache(async (): Promise<BlogPostCard[]> => {
  return getJson<BlogPostCard[]>(PATH, { tags: ['blog'], fallback: [] });
});

/**
 * One post, with its `body`, or `null` when the slug is not published.
 *
 * No `fallback` here, deliberately: a 404 must stay distinguishable so the
 * route can call `notFound()`. `getJsonOrNull` turns the 404 into `null` and
 * lets every OTHER failure — a 500, an unreachable host — keep throwing, so a
 * backend outage during a build is loud rather than silently publishing a site
 * where every article has vanished.
 */
export const getBlogPost = cache(async (slug: string): Promise<BlogPost | null> => {
  return getJsonOrNull<BlogPost>(`${PATH}/${encodeURIComponent(slug)}`, {
    tags: ['blog', `blog:${slug}`],
  });
});
