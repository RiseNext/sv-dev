import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import type { VideoRef } from '@/types/content';

/* =============================================================================
   🔶 TEMPORARY — DELETE THIS FILE WHEN THE BACKEND SHIPS `heroVideos`.

   The hero's real source is `site-settings.heroVideos` from the CMS. That field
   does not exist yet, so there is no way to SEE the video hero at all. This
   reads whatever video files are sitting in `public/media/hero/` and hands them
   to the hero in the CMS's shape, purely so the layout can be judged with real
   footage while the backend work is outstanding.

   🔴 DEVELOPMENT ONLY, AND THAT GUARD IS THE POINT. Files in `public/` are
   served in production too, so without the NODE_ENV check a forgotten test clip
   would ship to the live site as the hero background. Returning `[]` outside
   development makes that impossible rather than unlikely.

   Two consequences worth knowing:
     · It reads the directory, so the COUNT of files decides the layout. One
       file gives the single-video hero, three give the carousel — which is how
       both states get tested without touching any code.
     · `site.heroVideos ?? previewHeroVideos()` in page.tsx means the CMS wins
       the moment it returns anything. Nothing here needs unpicking first; the
       whole mechanism goes quiet on its own.

   REMOVAL, when the field lands: delete this file, delete the import and the
   `??` in `src/app/page.tsx`, and delete `public/media/hero/`. Three edits.
   ========================================================================== */

const DIR = 'public/media/hero';

/* mp4 and webm only. `.mov` is deliberately excluded: it plays in Safari and
   silently fails elsewhere, which is the most confusing possible result when
   the whole purpose of this file is "why can I not see my video". */
const VIDEO = /\.(mp4|webm)$/i;

/* A poster is matched by BASENAME — `approach.mp4` pairs with `approach.jpg`.
   Without one the pane is empty until the first frame decodes, which is the
   same symptom as a broken path. */
const POSTER_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

export function previewHeroVideos(): readonly VideoRef[] {
  if (process.env.NODE_ENV !== 'development') return [];

  let entries: string[];
  try {
    entries = fs.readdirSync(path.join(process.cwd(), DIR));
  } catch {
    /* No folder, or unreadable. Not an error worth surfacing — it is the normal
       state for anyone who has not dropped a test clip in, and the hero simply
       renders its type-only layout. */
    return [];
  }

  /* Sorted so the carousel order is predictable and renaming a file is enough
     to reorder it — `01-approach.mp4`, `02-roads.mp4`. */
  return entries
    .filter((file) => VIDEO.test(file))
    .sort()
    .map((file) => {
      const base = file.replace(VIDEO, '');
      const poster = POSTER_EXTENSIONS.map((ext) => `${base}${ext}`).find((name) =>
        entries.includes(name),
      );

      /* 🔴 ENCODED, because these are filenames a human chose, not slugs.
         A phone drops files called "WhatsApp Video 2026-09-22 at 2.07.38 PM.mp4"
         — spaces and all — and interpolating that raw produces an invalid URL.
         Some browsers repair it, which is worse than none doing so: it works on
         the machine it was tested on and 404s elsewhere. One path segment, so
         encodeURIComponent is the right tool. */
      return {
        src: `/media/hero/${encodeURIComponent(file)}`,
        poster: poster ? `/media/hero/${encodeURIComponent(poster)}` : undefined,
        /* The filename, tidied. Only ever read out by the carousel's
           screen-reader labels, so `01-aerial-approach` becoming
           "01 aerial approach" is good enough for a preview. */
        title: base.replace(/[-_]+/g, ' '),
      };
    });
}
