import { projectVideos } from '@/content/projectVideos';

/* =============================================================================
   ONE PROJECT'S PROMOTION VIDEO — where it comes from, for EVERY project.

   Nothing in the card, this file or the home page knows a project by name. The
   deck maps over whatever the CMS publishes, and each card asks this function
   for a video; a project published tomorrow goes through exactly the same
   call as the four published today. There is no per-project code to add, and
   the only thing a new project needs is a link.

   ─── WHERE IT LOOKS, IN ORDER ─────────────────────────────────────────────
     1. the project record from `/projects/{slug}` (the detail endpoint)
     2. the project record from `/projects` (the list endpoint)
     3. `src/content/projectVideos.ts`, the slug-keyed stop-gap

   The CMS therefore WINS whenever it says anything, which is what makes the
   stop-gap safe to leave in place: it cannot override a real answer, and the
   day the backend ships the field it stops being reached on its own.

   🔴 BOTH ENDPOINTS ARE READ, AND THAT IS THE POINT. The home page already
   fetches the detail record for each card (it needs `gallery`), but a backend
   adding a video field will not necessarily add it to both payloads — and
   which one it lands in is not something this frontend should have to be
   redeployed to discover. Reading both costs one function call and removes a
   whole class of "we shipped it, why is nothing showing".

   ─── WHAT COUNTS AS AN ANSWER ─────────────────────────────────────────────
   The field is declared below as `promoVideo`, and that is the name to build.
   But the shape a CMS actually emits for "paste a link here" is a coin flip
   between a plain string and a small object, and the name is a coin flip
   between three obvious ones — so all of it is accepted:

       promoVideo: "https://youtu.be/XXXXXXXXXXX"
       promoVideo: { youtubeUrl: "…", duration: "2:14" }
       promoVideo: { url | href | src: "…" }
       videoUrl:   "…"          ← same handling
       youtubeUrl: "…"          ← same handling

   🔴 THIS TOLERANCE IS DELIBERATE AND IT IS BOUNDED. Three key names, each of
   which can only ever mean "a video link", and no search of the record beyond
   them. It is not a sniff for anything that looks like a URL: a field the
   backend adds for some other purpose must not be able to end up in a player.

   ─── IT DOES NOT VALIDATE THE LINK ────────────────────────────────────────
   Deliberately. `youtubeId()` does that at the render site, and the card drops
   the pane for anything it cannot read an id out of. Rejecting here as well
   would mean two places to look when a video does not appear.
   ========================================================================== */

/**
 * One project's promotion video, as the card consumes it.
 *
 * `youtubeUrl` is the admin's pasted LINK, not an id, for the reason set out
 * at length on `BlogVideo` in `src/types/blog.ts`: a field labelled "video id"
 * gets a full URL pasted into it on the first day, and then nothing works.
 *
 * 🔶 THIS TYPE IS NOT `src/types/content.ts`, and that is not an oversight.
 * That file is the contract for what the backend actually emits today, and a
 * project record carries no video field yet — so the shape the frontend is
 * ready for lives here, beside the code that resolves it, until it does.
 */
export type ProjectPromoVideo = {
  /** The watch/share URL, verbatim as pasted. */
  youtubeUrl: string;
  /**
   * Running time as PRINTED on the pane's badge — `2:14`. Optional and
   * admin-typed: YouTube does not reveal duration without a Data API call and
   * a key, which is not worth a quota for a badge. No value, no badge.
   */
  duration?: string;
};

/** The field names accepted on a project record. See the note above: three,
 *  bounded, each unambiguous. `promoVideo` is the one to build. */
const FIELDS = ['promoVideo', 'videoUrl', 'youtubeUrl'] as const;

/** The keys a nested object may carry the link under. */
const URL_KEYS = ['youtubeUrl', 'url', 'href', 'src'] as const;

const text = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() ? value.trim() : undefined;

/** The video on ONE record, whichever of the accepted shapes it arrived in. */
function fromRecord(record: unknown): ProjectPromoVideo | undefined {
  if (!record || typeof record !== 'object') return undefined;
  const row = record as Record<string, unknown>;

  for (const field of FIELDS) {
    const value = row[field];

    /* The plain-string case: a text field in the admin holding a pasted link. */
    const direct = text(value);
    if (direct) return { youtubeUrl: direct };

    /* The object case: a group field, or a relation to a media row. */
    if (value && typeof value === 'object') {
      const nested = value as Record<string, unknown>;
      const url = URL_KEYS.map((key) => text(nested[key])).find(Boolean);
      if (url) return { youtubeUrl: url, duration: text(nested.duration) };
    }
  }

  return undefined;
}

/**
 * The promotion video for one project, or `undefined` — in which case the card
 * renders exactly as it does without the feature, which is the correct and
 * common answer rather than a failure.
 *
 * `records` is every version of this project's record that is to hand, richest
 * first — the detail record, then the list record. They are typed `unknown`
 * BECAUSE THEY ARE: the field is not on the contract yet, so what arrives is
 * whatever the backend sends, and narrowing it is this function's whole job.
 */
export function projectVideo(
  slug: string,
  ...records: readonly unknown[]
): ProjectPromoVideo | undefined {
  for (const record of records) {
    const found = fromRecord(record);
    if (found) return found;
  }

  /* 🔶 THE STOP-GAP, AND THE LAST WORD ONLY. Delete this line and the import
     with it once the CMS answers — nothing else in the codebase changes.

     `undefined` from here is NOT a dead end: the card reserves the pane and
     renders its placeholder, so the layout is the same whether or not a link
     exists yet. See `VideoSlot` in MediaSequence. */
  return projectVideos[slug];
}
