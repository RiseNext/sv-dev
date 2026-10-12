import type { MetadataRoute } from 'next';
import { getBlogPosts } from '@/lib/api/blog';
import { getProjects } from '@/lib/api/projects';

/* /master-plan, /amenities and /location were REMOVED — the routes no longer
   exist, and each project page carries its own plan, amenities and location
   sections instead. Listing a 404 in the sitemap is a crawl error, so they go
   out of here at the same time as the pages.

   🔴 `/blog` AND `/gallery` WERE MISSING AND ARE NOW HERE. Both routes shipped
   in `acd9f7d` and both return 200 in production, but neither was ever added to
   this list — so the two newest pages on the site were the two a crawler could
   not discover. Verified against the live sitemap before the fix: it listed
   only `/`, `/about`, `/projects`, `/contact` and the four project pages. */
const staticRoutes = ['/', '/about', '/projects', '/gallery', '/blog', '/contact'];

/* Now async, and sourced from the PUBLISHED project set — so a project added in
   the CMS appears here without a code change, and an archived one disappears.

   The base URL comes from NEXT_PUBLIC_SITE_URL rather than from content, which
   is what stops `https://www.example.com` from reaching all 12 entries. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/+$/, '');

  /* Both reads carry `fallback: []`, so a CMS outage during a build yields a
     SHORTER sitemap rather than a failed build — the same trade the pages
     themselves make. Fetched together because neither depends on the other. */
  const [projects, posts] = await Promise.all([getProjects(), getBlogPosts()]);

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

  /* 🔴 EXTERNAL POSTS ARE EXCLUDED. A post with an `externalUrl` renders no
     page of its own on this site — its card links straight out — so listing
     `/blog/<slug>` for one would put a URL in the sitemap that exists only as a
     courtesy landing page. `lastModified` comes from the post's own
     `publishedAt`, which is the one date in the contract that means "when this
     content changed"; `weekly` because a blog index genuinely does. */
  const postEntries: MetadataRoute.Sitemap = posts
    .filter((post) => !post.externalUrl?.trim())
    .map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: post.publishedAt,
      changeFrequency: 'weekly',
      priority: 0.6,
    }));

  return [...staticEntries, ...projectEntries, ...postEntries];
}
