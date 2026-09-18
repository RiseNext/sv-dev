import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { Footer } from '@/components/layout/Footer';
import { PillNav } from '@/components/layout/PillNav';
import { SkipLink } from '@/components/layout/SkipLink';
import { SmoothScroll } from '@/components/layout/SmoothScroll';
import { site } from '@/content/site';
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

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  // Placeholder content must not be indexed. Remove this once real copy lands.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f9f8f5', // keep in sync with --color-bg in globals.css
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
        <PillNav />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
