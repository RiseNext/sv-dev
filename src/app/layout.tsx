import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { Footer } from '@/components/layout/Footer';
import { PillNav } from '@/components/layout/PillNav';
import { SkipLink } from '@/components/layout/SkipLink';
import { SmoothScroll } from '@/components/layout/SmoothScroll';
import { buildNav } from '@/content/site';
import { getSiteSettings } from '@/lib/api/site';
import { getProjects } from '@/lib/api/projects';
import '@/styles/globals.css';

/* Fonts are SELF-HOSTED from src/styles/fonts. next/font/google fetches over
   the network at compile time, which was costing ~10s per cold build here and
   failing on a slow connection. Local files make the build deterministic.

   Instrument Serif (roman + italic) for display, DM Sans for body and UI,
   DM Mono for labels — 144 KB for all five files, latin subset. */

const display = localFont({
  src: [
    { path: '../styles/fonts/instrument-serif-latin.woff2', weight: '400', style: 'normal' },
    { path: '../styles/fonts/instrument-serif-italic-latin.woff2', weight: '400', style: 'italic' },
  ],
  variable: '--font-display-loaded',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
});

const body = localFont({
  src: '../styles/fonts/dm-sans-var-latin.woff2',
  variable: '--font-body-loaded',
  display: 'swap',
  weight: '400 700',
  adjustFontFallback: 'Arial',
});

const mono = localFont({
  src: [
    { path: '../styles/fonts/dm-mono-latin.woff2', weight: '400', style: 'normal' },
    { path: '../styles/fonts/dm-mono-medium-latin.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-mono-loaded',
  display: 'swap',
  adjustFontFallback: false,
});

/* A module-level `metadata` constant cannot await, so this became a function.
   The SHAPE is unchanged.

   🔴 `metadataBase` now comes from NEXT_PUBLIC_SITE_URL, not from content.
   It used to be `site.url = 'https://www.example.com'` — the ONE UNBRACKETED
   placeholder in the entire repository, which `isPlaceholder()` could never
   catch, and which fed every canonical URL, every OpenGraph url and all 12
   sitemap entries. Getting it wrong is now a deployment misconfiguration rather
   than a silently-shipped lie. */
export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: site.tagline ? `${site.name} — ${site.tagline}` : site.name,
      template: `%s | ${site.name}`,
    },
    description: site.description,
    /* 🔴 ONE OF TWO INDEPENDENT INDEXING BLOCKS. The other is in robots.ts.
       BOTH must be lifted together at launch — lifting only one leaves the site
       unindexed with a cause nobody will find. This is the single most
       consequential launch action in the project, and it now has a switch. */
    robots: allowIndexing()
      ? { index: true, follow: true }
      : { index: false, follow: false },
  };
}

/** Shared by this file and robots.ts, so the two blocks cannot drift apart. */
export function allowIndexing(): boolean {
  return process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true';
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f9f8f5', // keep in sync with --color-bg in globals.css
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const site = await getSiteSettings();
  const projects = await getProjects();

  // DERIVED from the published set — see content/site.ts for why this matters.
  const nav = buildNav(projects);

  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <head>
        {/* Scroll reveals are progressive enhancement: without JS every section
            stays visible rather than fading in and never arriving. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
      </head>
      {/* Extensions (ad blockers, Bitdefender's `bis_skin_checked`, password
          managers) stamp attributes onto <body> before React hydrates, which
          React reports as a hydration mismatch it cannot patch. Suppressing it
          here silences the extension noise only — mismatches inside the tree
          are still reported. */}
      <body suppressHydrationWarning>
        <SmoothScroll />
        <SkipLink />
        <PillNav nav={nav} siteName={site.name} phone={site.phone} />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
