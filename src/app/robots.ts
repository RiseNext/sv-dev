import type { MetadataRoute } from 'next';
import { site } from '@/content/site';

/** Indexing is blocked while the site carries placeholder content.
 *  Flip `disallow` to an empty array before launch. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', disallow: '/' },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
