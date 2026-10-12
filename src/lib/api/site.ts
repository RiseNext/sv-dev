import 'server-only';
import { cache } from 'react';
import type { IconName } from '@/components/ui/Icon';
import type { VideoRef } from '@/types/content';
import type { HeroMediaItem } from '@/types/heroMedia';
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
   * ✅ LIVE. Verified serving one video in production (12 Oct 2026):
   * `/api/v1/site-settings` returns `heroVideos: [{src, poster, title}]` with
   * `src` on `/video/upload/videos/<uuid>.mp4` and `poster` on
   * `/image/upload/media/<uuid>.jpg`.
   *
   * 🔶 SUPERSEDED BY `heroMedia` BELOW, BUT NOT DEPRECATED AND NOT GOING AWAY
   * YET. The live hero still renders through this field, and `heroItems()`
   * falls back to it whenever `heroMedia` has no rows — so retiring it is a
   * separate decision, not a side effect of adding images.
   *
   * ORDERED: admin sort order is the slideshow order. `src` shares the origin
   * configured as NEXT_PUBLIC_MEDIA_BASE_URL — `<video>` ignores next/image's
   * host allowlist, so a mismatched host is a silent black box in production
   * rather than a build error.
   */
  heroVideos?: VideoRef[];
  /**
   * THE UNIFIED HERO LIST — photographs, uploaded MP4s and YouTube links in one
   * ordered sequence. See `src/types/heroMedia.ts` for the full contract and
   * `heroItems()` in `src/lib/heroMedia.ts` for how it combines with the legacy
   * field above.
   *
   * 🔴 ABSENT OR EMPTY IS A NORMAL STATE, not a missing feature: the hero then
   * falls back to `heroVideos`, and to the type-only layout if that is empty
   * too. The backend OMITS the key rather than returning `[]`.
   *
   * ⚠️ A `kind: 'youtube'` SLIDE DOES NOT AUTOPLAY — it shows its poster with a
   * play control and loads the embed on the click. That is deliberate; the
   * reasoning is on `HeroYouTube`.
   */
  heroMedia?: HeroMediaItem[];
};

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  return getJson<SiteSettings>('/site-settings', { tags: ['site-settings'] });
});

