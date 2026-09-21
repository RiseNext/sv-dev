import type { MetadataRoute } from 'next';
import { allowIndexing } from '@/app/layout';

/* 🔴 ONE OF TWO INDEPENDENT INDEXING BLOCKS.
   The other is `robots: { index: false }` in layout.tsx's generateMetadata.
   BOTH must be lifted together at launch by setting NEXT_PUBLIC_ALLOW_INDEXING
   — lifting only one leaves the site unindexed with a cause nobody will find.

   The switch is shared with layout.tsx so the two cannot drift apart, which is
   exactly how a half-lifted block would otherwise happen. */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  return {
    rules: allowIndexing()
      ? { userAgent: '*', allow: '/' }
      : { userAgent: '*', disallow: '/' },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
