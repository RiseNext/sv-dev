import 'server-only';
import { cache } from 'react';
import type { IconName } from '@/components/ui/Icon';
import type { VideoRef } from '@/types/content';
import { getJson } from './client';

/* =============================================================================
   SITE SETTINGS.

   ⚠️ `[BRACKETED]` VALUES ARRIVE VERBATIM AND MUST STAY THAT WAY.
   `lib/href.ts` renders a bracketed destination inert, so a placeholder can
   never ship looking like a working link. Do not trim, default or "clean" any
   value here — the whole guard depends on the brackets surviving.
   ========================================================================== */

export type SiteSettings = {
  name: string;
  legalName: string;
  tagline?: string;
  description?: string;
  url: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string[];
  mapUrl?: string;
  officeHours?: string;
  social?: { label: string; href: string; icon: IconName }[];
  legalLinks?: { label: string; href: string }[];
  /** COMPUTED by the backend, never stored — so the `[YEAR]` token that used to
   *  render literally in the footer cannot exist. */
  copyrightText: string;
  formNote?: string;
  cta?: { title: string; body: string };
  heroTicker?: { icon: IconName; text: string }[];
  logo?: { src: string; alt: string; width: number; height: number };
  masterPlan?: { title: string; href: string };
  /**
   * The site's ACTIVE video, when one is configured in the CMS. Absent
   * otherwise — the key is omitted from the response, never null.
   *
   * ⚠️ NOTHING RENDERS THIS YET, AND THAT IS INTENTIONAL. The CMS deliberately
   * does not say where a video belongs; that is this repository's call. `Hero`
   * already accepts a `media={{ src, poster }}` prop, so wiring it is a
   * one-expression change in `app/page.tsx` — see VideoRef in types/content.ts.
   */
  video?: VideoRef;
};

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  return getJson<SiteSettings>('/site-settings', { tags: ['site-settings'] });
});
