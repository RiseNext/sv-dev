import type { HeroMediaItem } from '@/types/heroMedia';
import type { VideoRef } from '@/types/content';

/* =============================================================================
   WHICH HERO LIST WINS — the one adapter between the new field and the old one.

   🔴 THE WHOLE POINT OF THIS FILE IS THAT NOTHING HAD TO BE MIGRATED. One hero
   video is live in production through `site-settings.heroVideos`, and that field
   is still emitted unchanged. `heroMedia` is the new unified list (images,
   uploaded MP4s and YouTube in one ordered sequence), and it simply takes
   precedence WHEN IT HAS ROWS.

   So the rollout has three states and all three are correct:

     heroMedia non-empty  → the new list renders, mixed kinds and all.
     heroMedia absent/[]  → the legacy videos render, exactly as they do today.
     both empty/absent    → the type-only hero, exactly as today.

   An administrator who never opens the new field therefore sees no change, and
   the legacy field can be retired later as its own decision rather than as a
   flag day bolted onto this one.

   ⚠️ `length > 0` AND NOT `??`. The backend omits an empty `heroMedia` rather
   than returning `[]`, so `??` would be *almost* right — but a `[]` arriving
   from any other source (a hand-written fixture, a future API change) would
   then beat a working legacy list and blank the hero. Asking for rows rather
   than for presence cannot do that.
   ========================================================================== */

/**
 * The hero's slides, newest contract first.
 *
 * Returns a readonly array so a caller cannot sort it in place: array order IS
 * slideshow order, decided by the admin's drag-to-reorder and by nothing else.
 */
export function heroItems(
  heroMedia?: readonly HeroMediaItem[],
  heroVideos?: readonly VideoRef[],
): readonly HeroMediaItem[] {
  if (heroMedia && heroMedia.length > 0) return heroMedia;

  /* THE LEGACY PATH, widened rather than special-cased. Mapping each `VideoRef`
     into a `kind: 'video'` item means the stage below has exactly ONE shape to
     render and no second code path to keep in step — which is what stops the
     legacy hero quietly rotting once nobody is looking at it. */
  if (heroVideos && heroVideos.length > 0) {
    return heroVideos.map((video) => ({ kind: 'video' as const, ...video }));
  }

  return [];
}

/**
 * A stable React key for one slide.
 *
 * 🔴 KEYED BY KIND **AND** SOURCE. `HeroVideoStage` used `key={video.src}`,
 * which was safe when every slide was a video. It is not safe now: a YouTube
 * item has no `src` at all, so every YouTube slide would key as `undefined` and
 * React would reconcile them onto each other. Including the kind also means an
 * image and a video that somehow shared a URL cannot collide.
 */
export function heroKey(item: HeroMediaItem): string {
  return item.kind === 'youtube' ? `youtube:${item.youtubeUrl}` : `${item.kind}:${item.src}`;
}

/**
 * The accessible name for one slide, for the slideshow's controls.
 *
 * Falls back to position rather than to the kind, because "Video 2 of 3" tells
 * a screen-reader user where they are, and "Video" does not. The CMS `title`
 * is always preferred — that is what the field is for.
 */
export function heroLabel(item: HeroMediaItem, index: number, total: number): string {
  const title = item.title?.trim();
  if (title) return title;
  const noun = item.kind === 'image' ? 'Image' : 'Video';
  return `${noun} ${index + 1} of ${total}`;
}

/** Whether this slide plays on its own. Images and YouTube facades do not —
 *  which is what decides both autoplay and whether the pause control has a
 *  job. See the note on `HeroYouTube` for why YouTube never autoplays. */
export function isSelfPlaying(item: HeroMediaItem): boolean {
  return item.kind === 'video';
}
