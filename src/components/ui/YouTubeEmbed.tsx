'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { YouTubeThumb } from '@/components/ui/YouTubeThumb';
import type { ImageRef } from '@/types/content';
import { youtubeEmbedUrl } from '@/lib/blog';
import { cx } from '@/lib/cx';

/* =============================================================================
   THE YOUTUBE PLAYER — a FACADE, not an embed.

   🔴 NOTHING FROM YOUTUBE LOADS UNTIL THE VISITOR CLICKS. What renders first
   is a poster and a play button; the iframe is mounted by the click. That is
   worth the extra component for three separate reasons:

     · A YouTube iframe costs roughly a megabyte of script and several
       third-party connections BEFORE anyone decides to watch. On the mobile
       connections this site is read on, that is the page's whole budget spent
       on a video most visitors will scroll past.
     · The embed sets tracking cookies on load. Loading it only on an explicit
       click means a visitor who never plays the video is never tracked by a
       third party — which is also the honest reading of consent.
     · `autoplay=1` is only defensible this way round. The iframe appears
       because of a gesture, so playback starts for someone who asked for it;
       the same parameter on a page-load embed is the thing everyone hates.

   `youtube-nocookie.com` is the domain, and `rel=0` keeps the end-screen
   suggestions inside the same channel instead of handing the visitor a
   competitor's listing — see `youtubeEmbedUrl()`.

   ─── THE POSTER ───────────────────────────────────────────────────────────
   The CMS `cover` when there is one, which is the only route that gets
   next/image. Otherwise YouTube's own thumbnail through a plain <img>, which
   may fail and unmount, leaving the sand panel and the play button — still a
   working control, which is the point of layering them this way.
   ========================================================================== */

export function YouTubeEmbed({
  videoId,
  title,
  cover,
  duration,
  className = 'aspect-video rounded-media',
}: {
  videoId: string;
  /** The post's title. Names the play button and titles the iframe, which is
   *  the iframe's only accessible name. */
  title: string;
  cover?: ImageRef;
  duration?: string;
  /**
   * THE BOX: its shape, its radius and where it sits. Owned by the caller, the
   * same contract `ProjectPhotoFrame` uses, because the two are panes of one
   * card and their radii have to match the card around them.
   *
   * The default is the blog's own box, so a post page passes nothing. A caller
   * that overrides it must supply BOTH a height and a radius: everything
   * inside this component is absolutely positioned, so a box with neither
   * collapses to nothing. The project card hands it `aspect-video` on a phone
   * and `aspect-auto` plus a stretched flex row at desktop — see
   * MediaSequence.
   */
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className={cx('relative overflow-hidden bg-sand', className)}>
      {playing ? (
        <iframe
          src={youtubeEmbedUrl(videoId)}
          title={title}
          /* The narrowest set that leaves a normal player working:
             fullscreen, picture-in-picture and the share button. No camera, no
             microphone, no payment, no geolocation. */
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play: ${title}`}
          className="group absolute inset-0 h-full w-full cursor-pointer"
        >
          {cover?.src ? (
            <Image
              src={cover.src}
              alt=""
              fill
              sizes="(min-width: 1024px) 70vw, 100vw"
              priority
              className="object-cover"
            />
          ) : (
            <YouTubeThumb videoId={videoId} className="absolute inset-0" />
          )}

          {/* A wash under the button, so a white play glyph cannot land on a
              pale frame of the thumbnail and disappear. */}
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-core-black/15 transition-colors duration-300 group-hover:bg-core-black/25"
          />

          <span
            aria-hidden="true"
            className={cx(
              'absolute left-1/2 top-1/2 inline-flex size-20 -translate-x-1/2 -translate-y-1/2',
              'items-center justify-center rounded-full bg-surface pl-1 text-ink shadow-[0_18px_40px_-16px_rgba(26,22,19,0.6)]',
              'transition-transform duration-300 ease-spring group-hover:scale-110',
              'motion-reduce:transition-none motion-reduce:group-hover:scale-100',
            )}
          >
            <Icon name="play" size={28} />
          </span>

          {duration ? (
            <span
              aria-hidden="true"
              className="absolute bottom-4 right-4 inline-flex items-center rounded-pill bg-surface/90 px-3 py-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.06em] text-ink backdrop-blur-[13px]"
            >
              {duration}
            </span>
          ) : null}
        </button>
      )}
    </div>
  );
}
