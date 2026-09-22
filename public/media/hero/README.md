# Hero video — temporary preview folder

Drop test video files here to see the hero video layout **while the backend's
`heroVideos` field does not exist yet**. This folder and the code that reads it
are temporary scaffolding, not the real mechanism.

## How to use it

1. Put one or more videos in this folder.
2. Run `npm run dev`.
3. Open `/`.

**The number of files decides the layout**, so both states can be checked
without touching any code:

| Files here | What the hero renders |
| --- | --- |
| none | type-only hero (the current live look) |
| 1 | single-video hero — no carousel controls |
| 2 or more | carousel: 7s crossfade, dots, pause control |

## File rules

- **`.mp4` or `.webm` only.** `.mov` is ignored on purpose — it plays in Safari
  and silently fails elsewhere, which is the most confusing possible outcome
  when you are trying to work out why you cannot see your video.
- **Add a poster image** with the same basename — `approach.mp4` pairs with
  `approach.jpg` (`.jpeg`, `.png` and `.webp` also work). Without one the pane
  is blank until the first frame decodes, which looks identical to a broken
  path.
- **Files are sorted by name**, so prefix them to control carousel order:
  `01-approach.mp4`, `02-roads.mp4`.
- **Encode for autoplay:** H.264/MP4 with **no audio track**. The player is
  `muted` + `playsInline` + `loop` because browsers refuse to autoplay
  otherwise. Keep files small — this is the first thing a visitor downloads.

## Two things to know

**Videos in here are gitignored.** Only this README is committed. Test footage
is large binary data and does not belong in the repo — and `public/` is served
in production, so a committed clip is a clip that could ship.

**This cannot leak to production anyway.** The reader is gated on
`NODE_ENV === 'development'` and returns nothing otherwise, so a forgotten test
clip cannot become the live hero background.

## Removing this once the backend is done

When `site-settings.heroVideos` starts returning data, the CMS takes over
automatically — `page.tsx` reads `site.heroVideos ?? previewHeroVideos()`, so
the real field wins with no code change. Then clean up in three edits:

1. delete `src/lib/dev/previewHeroVideos.ts`
2. remove its import and the `??` fallback in `src/app/page.tsx`
3. delete this folder
