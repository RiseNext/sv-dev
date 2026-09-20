/** @type {import('next').NextConfig} */

/* The CMS serves media from its own origin. Every host that can appear in an
   ImageRef.src MUST be listed here, or next/image throws
   "Invalid src prop … hostname is not configured" at the SIX call sites that
   render remote images — Media.tsx (Frame and Plate), ProjectCard, MediaSequence,
   PinnedProof and Logo.

   Derived from the env vars rather than hardcoded, so staging and production
   differ by configuration rather than by a code edit. `pathname` is kept as
   tight as the storage layout allows. */
const remotePatterns = [];

const addPattern = (rawUrl, pathname) => {
  if (!rawUrl) return;
  try {
    const url = new URL(rawUrl);
    remotePatterns.push({
      protocol: url.protocol.replace(':', ''),
      hostname: url.hostname,
      ...(url.port ? { port: url.port } : {}),
      pathname,
    });
  } catch {
    // An unparseable URL is a configuration error, but it must not crash the
    // build here — the data layer surfaces it with a far better message.
  }
};

// The CDN origin that serves uploaded media in production.
addPattern(process.env.NEXT_PUBLIC_MEDIA_BASE_URL, '/media/**');
addPattern(process.env.NEXT_PUBLIC_MEDIA_BASE_URL, '/documents/**');

// The CMS origin itself, which serves uploads directly in local development
// (S3_BUCKET empty => local disk => /payload-api/media/file/<uuid>).
if (process.env.NEXT_PUBLIC_API_BASE_URL) {
  addPattern(
    process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/api\/v1\/?$/, ''),
    '/payload-api/media/file/**',
  );
  addPattern(
    process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/api\/v1\/?$/, ''),
    '/payload-api/documents/file/**',
  );
}

const nextConfig = {
  /* Lets a verification build write somewhere other than .next, so it cannot
     collide with a dev server already running against this project — the
     collision shows up as a confusing "ENOENT: pages-manifest.json" during
     "Collecting page data", not as a code error.
       NEXT_DIST_DIR=.next-verify npm run build                                */
  distDir: process.env.NEXT_DIST_DIR || '.next',

  images: {
    formats: ['image/avif', 'image/webp'],
    // Every non-default quality used anywhere must be declared here; Next 16
    // makes this mandatory rather than a warning.
    qualities: [75, 90],

    remotePatterns,

    /* ⚠️ STILL ENABLED, AND STILL A KNOWN DEBT.
       The remaining placeholder art in /public/images is SVG, which next/image
       refuses to process unless this is on. The CSP below neutralises scripting
       inside the SVG, which is the documented safe setup for FIRST-PARTY files.

       🔴 ITS JUSTIFICATION IS NOW WEAKER THAN IT WAS. "The files are
       first-party" was true when only this repo could add an SVG. A CMS now
       exists — although it REJECTS every SVG upload at four layers, so no
       CMS-supplied SVG can reach this path today.

       DELETE THESE THREE LINES once real raster photography replaces the
       placeholder title cards in /public/images. That is a CONTENT deliverable,
       not an engineering one, and it is the last thing standing between this
       flag and removal.                                                       */
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
