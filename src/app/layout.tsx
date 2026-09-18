import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { ContactFab } from '@/components/layout/ContactFab';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SkipLink } from '@/components/layout/SkipLink';
import { site } from '@/content/site';
import '@/styles/globals.css';

/* Fonts are SELF-HOSTED from src/styles/fonts. next/font/google fetches over
   the network at compile time, which was costing ~10s per cold build here and
   failing with "Request timed out after 3000ms" on a slow connection. Local
   files make the build deterministic and offline-capable.

   Fraunces (variable serif) for display, Plus Jakarta Sans for body and UI —
   93 KB for both, latin subset, weights 400–700 from a single file each. */

const display = localFont({
  src: '../styles/fonts/fraunces-var-latin.woff2',
  variable: '--font-display-loaded',
  display: 'swap',
  weight: '400 700',
  adjustFontFallback: 'Times New Roman',
});

const body = localFont({
  src: '../styles/fonts/jakarta-var-latin.woff2',
  variable: '--font-body-loaded',
  display: 'swap',
  weight: '400 700',
  adjustFontFallback: 'Arial',
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
  themeColor: '#3d1119', // keep in sync with --brand-800 in tokens.css
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <head>
        {/* Scroll reveals are progressive enhancement: without JS every section
            stays visible rather than fading in and never arriving. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
      </head>
      <body>
        <SkipLink />
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <ContactFab />
      </body>
    </html>
  );
}
