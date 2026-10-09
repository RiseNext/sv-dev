import type { ProjectPromoVideo } from '@/lib/projectVideo';

/* =============================================================================
   PROMOTION VIDEOS — the stop-gap source, keyed by slug.

   🔶 THIS FILE IS THE BRIDGE, NOT THE MECHANISM. The mechanism is
   `projectVideo()` in `src/lib/projectVideo.ts`, which asks the CMS first and
   treats every project the same — including ones published long after today.
   This map is only what answers until the CMS has a video field at all.

   ─── THE LIMITATION, STATED PLAINLY ───────────────────────────────────────
   🔴 A PROJECT PUBLISHED TOMORROW CANNOT APPEAR HERE BY ITSELF. Every entry
   is a line of code, so a new project's video needs an edit and a deploy —
   which is precisely the thing the CMS exists to avoid, and precisely why
   this is a bridge. Once the backend emits the field, an admin pastes a link
   in the admin and the card fills on the next revalidation, for any project,
   for ever. `src/lib/projectVideo.ts` has the spec to build against.

   ─── WHAT TO PASTE ────────────────────────────────────────────────────────
   Whatever YouTube's share button gives you, verbatim — `youtu.be/…`,
   `watch?v=…`, `/shorts/…`, tracking tail and all. The id is parsed out of it,
   and an unparseable value leaves the card exactly as it reads today rather
   than rendering an empty player. Do NOT trim it to a bare id by hand: that is
   the step that gets a character wrong, and a wrong id is a plausible-looking
   card that plays nothing.

   ─── AN EMPTY MAP IS A WORKING STATE ──────────────────────────────────────
   Every card then renders as it did before the feature existed — photograph
   and copy, no video pane. The split layout appears per project as each link
   arrives, so a client with one promotion video gets one card with a player
   and the rest unchanged.

   A stale key is inert: the map is looked up BY the published project list, so
   a slug that is no longer published cannot put a card on the page, and a
   mistyped one cannot put a video on the wrong project — it simply never
   matches.
   ========================================================================== */

/**
 * Slug → that project's promotion video.
 *
 * The published slugs as of 9 Oct 2026 are `sri-city`, `sri-vanam`,
 * `sv-apartments` and `swarnagiri-sri-nivasam` — but the CMS owns that list,
 * so check the live catalogue rather than trusting this line.
 */
export const projectVideos: Readonly<Record<string, ProjectPromoVideo>> = {
  /* One line per project, e.g.
       'sri-vanam': { youtubeUrl: 'https://youtu.be/dQw4w9WgXcQ', duration: '2:14' },
     `duration` is optional — leave it off rather than guessing at one. */
};
