'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Icon } from '@/components/ui/Icon';
import { YouTubeEmbed } from '@/components/ui/YouTubeEmbed';
import { youtubeId } from '@/lib/blog';
import { cx } from '@/lib/cx';
import type { ProjectVideo } from '@/types/projectMedia';

/* =============================================================================
   PROJECT VIDEOS — the ordered set, on the project's own page.

   ─── WHY A SECTION AND NOT MORE PANES ON THE CARD ─────────────────────────
   The homepage card already carries one video pane, filled from `promoVideo`,
   beside a photograph stepper, the copy column and the logo tab. A second pane
   there would not fit at any breakpoint worth having, and a card that scrolled
   its own videos would compete with the deck it sits in. So the card keeps its
   ONE chosen video and the full list lives here, where there is room for it.

   `promoVideo` is therefore untouched by this component and vice versa.

   ─── ONE COLUMN OR TWO, BY COUNT ──────────────────────────────────────────
   A single video gets the full measure — it is the only thing to look at, and
   halving its width to leave a gap beside it would be worse than no grid at
   all. Two or more go two-up from the tablet breakpoint. There is no three-up:
   a 16:9 pane at a third of the container is smaller than a phone screen, which
   is the point at which a video stops being watchable and becomes a thumbnail.

   ─── NOTHING AUTOPLAYS HERE, AND THAT IS THE DIFFERENCE FROM THE HERO ─────
   🔴 A hero video is decorative motion behind a headline, so it is muted,
   looped and autoplaying. These are CONTENT a visitor chose to come and look
   at, and there may be six of them. So:

     · an MP4 renders with NATIVE CONTROLS and `preload="metadata"` — enough to
       have a poster and a duration, and not one byte of the stream until
       someone presses play. Autoplaying a grid would decode N video streams for
       a section the visitor may never scroll to.
     · a YouTube entry renders through the existing `YouTubeEmbed` facade, which
       mounts nothing from YouTube until the click. A project page could carry
       several, and each eager embed is roughly a megabyte of third-party script
       plus tracking cookies for a video most visitors scroll past.

   ─── IT DEGRADES RATHER THAN BREAKS ───────────────────────────────────────
   A YouTube URL the parser cannot read an id out of keeps its poster and drops
   the player, so the pane still looks finished — the same choice the blog's
   player makes. An MP4 with no poster shows the browser's own first frame.
   Neither case renders an empty box, and neither removes the caption.
   ========================================================================== */

/** A stable React key. Keyed by KIND AND SOURCE because a YouTube entry has no
 *  `src` at all — keying on `src` alone would collapse every YouTube pane onto
 *  one another. */
const keyFor = (video: ProjectVideo): string =>
  video.kind === 'youtube' ? `youtube:${video.youtubeUrl}` : `video:${video.src}`;

/* The pane. `aspect-video` here and not on the hero, because this grid has no
   headline to grow around: a 16:9 box is what a video actually is, and a
   content-driven height would leave inconsistent gaps between rows. */
const PANE = 'relative overflow-hidden rounded-media bg-sand aspect-video';

function UploadedVideo({ video }: { video: Extract<ProjectVideo, { kind: 'video' }> }) {
  /* Tracks the first play only, to drop the overlay. The element's own controls
     take over from there — re-implementing play/pause/seek would mean a worse
     player than the one every browser already ships. */
  const [started, setStarted] = useState(false);

  return (
    <div className={PANE}>
      <video
        src={video.src}
        poster={video.poster}
        controls
        /* `metadata`, NOT `auto`: enough for the poster frame and the duration
           readout, and nothing of the stream until a click. */
        preload="metadata"
        playsInline
        /* The caption below names it; without a caption the filename would be
           announced, which is worse than the positional fallback. */
        title={video.title}
        onPlay={() => setStarted(true)}
        className="absolute inset-0 size-full bg-core-black object-contain"
      />

      {/* The overlay is DECORATIVE and `pointer-events-none`: the real control
          is the <video> element's own play button underneath it, which is
          already keyboard-reachable and already labelled by the browser.
          Putting our own button on top would shadow it and remove native
          keyboard handling for no gain. It drops away on first play. */}
      {!started ? (
        <span
          aria-hidden="true"
          className={cx(
            'pointer-events-none absolute left-1/2 top-1/2 inline-flex size-16 -translate-x-1/2 -translate-y-1/2',
            'items-center justify-center rounded-full bg-surface/90 pl-1 text-ink',
            'shadow-[0_18px_40px_-16px_rgba(26,22,19,0.6)]',
          )}
        >
          <Icon name="play" size={24} />
        </span>
      ) : null}
    </div>
  );
}

function YouTubeVideo({ video }: { video: Extract<ProjectVideo, { kind: 'youtube' }> }) {
  const videoId = youtubeId(video.youtubeUrl);

  /* 🔴 AN UNPARSEABLE URL KEEPS THE POSTER AND DROPS THE PLAYER. The id is
     interpolated into an embed URL, so the one thing that must not happen is
     lifting an "id" out of a host nobody vetted — `youtubeId()` returns null
     instead, and this branch is what that null means. The pane still carries
     its picture and caption, which is a visible, fixable mistake rather than a
     dead player or an empty box. */
  if (!videoId) {
    return (
      <div className={PANE}>
        <Image
          src={video.poster}
          alt={video.title ?? ''}
          fill
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <YouTubeEmbed
      videoId={videoId}
      /* The iframe's ONLY accessible name, so it must never be empty. */
      title={video.title ?? 'Project video'}
      /* 🔴 THE CMS POSTER, AND PASSING IT IS THE WHOLE POINT OF THE FIELD.
         `poster` is MANDATORY on a YouTube row so the pane never falls back to
         `i.ytimg.com` — a host deliberately absent from next.config.mjs's
         image allow-list. Omitting this prop collected, validated and
         serialised the poster and then threw it away, loading the thumbnail
         from YouTube instead. */
      posterSrc={video.poster}
      duration={video.duration}
      className={PANE}
    />
  );
}

export function ProjectVideos({
  videos,
  name,
}: {
  /** From `project.videos` — already in admin order. NEVER sorted here. */
  videos: readonly ProjectVideo[];
  /** The project's name, for the fallback caption. */
  name: string;
}) {
  if (!videos.length) return null;

  const single = videos.length === 1;

  return (
    <ul
      className={cx(
        'grid gap-4 tablet:gap-6',
        single ? 'grid-cols-1' : 'grid-cols-1 tablet:grid-cols-2',
      )}
    >
      {videos.map((video, index) => (
        <li key={keyFor(video)} className="flex flex-col gap-3">
          {video.kind === 'youtube' ? (
            <YouTubeVideo video={video} />
          ) : (
            <UploadedVideo video={video} />
          )}

          {/* The caption. Falls back to the project name plus a position rather
              than to nothing, so a row an admin left unlabelled still reads as
              deliberate — and the count tells a visitor where they are in the
              set, which "Video" alone would not. */}
          <p className="font-mono text-body-xs text-ink-faint">
            {video.title?.trim() || `${name} — video ${index + 1} of ${videos.length}`}
          </p>
        </li>
      ))}
    </ul>
  );
}
