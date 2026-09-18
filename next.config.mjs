/** @type {import('next').NextConfig} */
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
    // The remaining placeholder art in /public/images is SVG, which next/image
    // refuses to process unless this is enabled. The CSP neutralises scripting
    // inside the SVG, which is the documented safe setup for first-party files.
    // Delete these three lines once real raster art replaces the placeholders.
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
