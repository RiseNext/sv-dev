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
   * 🔴 NOT EMITTED BY THE BACKEND YET — THIS IS THE SPEC TO IMPLEMENT.
   *
   * The hero reads this and needs nothing else: absent or empty renders the
   * current type-only hero, one entry renders the single-video layout, more
   * than one renders the carousel. So the section goes live purely by the API
   * starting to return the field — no frontend deploy required.
   *
   * WHAT THE BACKEND MUST ADD, on `/api/v1/site-settings`:
   *   heroVideos: [{ src, poster?, title? }]   // ORDERED — admin sort order is
   *                                            // the carousel order
   *
   *   · `src` — Cloudinary delivery URL for the encoded video. It MUST share
   *     the origin configured as NEXT_PUBLIC_MEDIA_BASE_URL. `<video>` ignores
   *     next/image's host allowlist, so a mismatched host is a silent black
   *     box in production, not a build error.
   *   · `poster` — a still frame. Please always emit one; it is what the user
   *     sees while the video loads, and on a metered connection it may be all
   *     they ever see.
   *   · Encode for autoplay: H.264/MP4, no audio track (the element is muted
   *     and `playsInline`, which browsers require for autoplay), and keep each
   *     file small enough to stream on an Indian mobile connection.
   *   · Omit the field entirely rather than returning `[]` with placeholder
   *     rows — the hero treats empty and absent identically, so there is no
   *     need for filler.
   */
  heroVideos?: VideoRef[];
};

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  return getJson<SiteSettings>('/site-settings', { tags: ['site-settings'] });
});
