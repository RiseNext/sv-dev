'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cx } from '@/lib/cx';
import { heroKey, heroLabel } from '@/lib/heroMedia';
import { youtubeEmbedUrl, youtubeId } from '@/lib/blog';
import type { HeroMediaItem } from '@/types/heroMedia';

/* =============================================================================
   HERO MEDIA STAGE — the bordered pane the hero type sits on.

   ONE COMPONENT, TWO LAYOUTS, chosen by how many items the CMS returns:
     · exactly one   → a still pane. No dots and no arrows, because a carousel
                       with one slide is furniture that does nothing. (A single
                       self-playing MP4 still gets its pause control — see
                       `hasSelfPlaying`.)
     · more than one → the same pane, plus a crossfade and a control cluster.
   The frame, the wash and the type treatment are IDENTICAL across both, so
   adding a second item changes what moves, never how the hero looks.

   ─── 🔴 VISITORS CAN NOW STEP THE SLIDES BY HAND ──────────────────────────
   The cluster was pause + dots. It is now PREVIOUS · PAUSE · DOTS · NEXT, in
   `ProjectCarousel`'s idiom, because dots alone are a POSITION INDICATOR that
   doubles as navigation — they say "there are four" without ever saying "go
   forward", and with four or more slides the targets are small enough that
   nobody treats them as a stepper. The arrows are the explicit affordance.

   THE ARROWS WRAP, THE CAROUSEL'S DO NOT, and the difference is not an
   oversight: `ProjectCarousel` runs once and stops at the last project, so its
   arrows disable at the ends. This rotation is a loop — auto-advance already
   carries slide N back to slide 1 — so an arrow that disabled at an end would
   contradict what the pane does on its own three seconds later.

   EVERY CONTROL IS 44px. The pause button and the dots were `size-8` (32px),
   under the 44×44 target size that WCAG 2.5.8 asks for and genuinely awkward
   with a thumb. The DOTS THEMSELVES are still 8px of paint — only the hit area
   grew, exactly as the project carousel does it.

   ─── IT NOW TAKES THREE KINDS OF SLIDE, NOT ONE ───────────────────────────
   🔴 THIS FILE USED TO RENDER EVERY SLIDE AS `<video src>`, and that is the
   whole reason it had to change. An image URL in that attribute renders
   nothing, and a YouTube watch URL renders nothing — so "the admin can choose
   images or videos" was never a backend-only feature, however it looked from
   the API. What was already here and is DELIBERATELY UNCHANGED:

     · the crossfade, the 7s auto-advance and the dot navigation
     · the pause control and WCAG 2.2.2 compliance
     · `prefers-reduced-motion` handling
     · hover/focus pause
     · only-the-visible-slide-plays
     · the scroll-shrink that opens the pane full-screen
     · `on-dark` focus rings

   Only the per-slide RENDERER is new, plus the two things that follow from it:
   a key that works for an item with no `src`, and a YouTube slide holding the
   rotation while it plays.

   ─── WHY A YOUTUBE SLIDE DOES NOT AUTOPLAY ────────────────────────────────
   🔴 It renders its poster with a play control and mounts the iframe on the
   click — the same facade `YouTubeEmbed` uses everywhere else on this site. In
   a hero the argument is stronger than anywhere else: a YouTube iframe is
   roughly a megabyte of third-party script and several connections, and the
   hero is on every visit, so autoplaying one would spend the first screen's
   whole budget before anyone decided to watch, and set tracking cookies on
   every visitor. iOS Low Power Mode and Data Saver would refuse it anyway.
   An administrator who needs silent background motion uploads an MP4, and the
   admin field says so.

   ─── NOTHING IS LAID OVER THE FOOTAGE ─────────────────────────────────────
   🔶 REMOVED ON REQUEST, 28 Sep 2026: this carried a dark vertical gradient
   over the video — a scrim — and it is gone. The type's legibility comes from
   the frosted panel in Hero.tsx instead. If a pale slide ever makes the
   headline hard to read, raise that panel's fill; the tint is not coming back.

   ─── HEIGHT IS CONTENT-DRIVEN, NOT ASPECT-DRIVEN ──────────────────────────
   No `aspect-[16/9]` on the frame, in either state. An aspect ratio fixes the
   height from the WIDTH, so on a narrow phone the pane becomes short exactly
   as the headline wraps to four lines. Padding plus a `min-height` FLOOR lets
   the pane grow to whatever the type needs at every width, which is what makes
   this survive translation, a longer headline, or a 320px screen. Every slide
   fills whatever height results via `object-cover`.
   ========================================================================== */

/** Long enough to read the headline and watch a few seconds of footage. */
const ADVANCE_MS = 7000;

/* The frame. A two-layer lift, same family as the nav's glass: a tight contact
   shadow and a wide deep ambient. The hairline that went with it is in
   globals.css, because it has to fade in as the pane settles — at full bleed a
   white hairline is a seam along the edge of the screen. */
const FRAME_SHADOW =
  'shadow-[0_2px_6px_rgba(43,34,23,0.06),0_24px_60px_-24px_rgba(43,34,23,0.28)]';

/* How much of the pin's travel the shrink uses, leaving the rest as a settled
   hold before the section releases. Derived from the section's own height, so
   `--hero-run` in globals.css stays the single place the distance is set. */
const SETTLE_AT = 0.7;

/* Shared by all three slide kinds, so a crossfade cannot behave differently
   depending on what is fading. Opacity is composited, so the transition never
   touches layout on a full-bleed element. */
const SLIDE_BASE = 'absolute inset-0 -z-10 size-full object-cover';
const SLIDE_FADE =
  'transition-opacity duration-700 ease-out-soft motion-reduce:transition-none';

/* One appearance for every control in the cluster — arrows, pause and dots
   alike — so the pill cannot end up with three different hit areas in it.
   44px is WCAG 2.5.8's target size, and on a phone it is the difference
   between stepping the hero and missing it. */
const CONTROL =
  'inline-flex size-11 shrink-0 items-center justify-center rounded-pill text-ink transition-colors hover:bg-white/60 motion-reduce:transition-none';

export function HeroVideoStage({
  items,
  children,
}: {
  /** From `heroItems()` — `heroMedia` when the CMS has rows, the mapped
   *  `heroVideos` otherwise. Array order IS slideshow order; never sorted. */
  items: readonly HeroMediaItem[];
  children: ReactNode;
}) {
  /* Returns false on the server and for the first paint, then syncs. That
     default is the safe one here: auto-advance is started from an effect, so it
     can never fire before the query has resolved. */
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const multi = items.length > 1;
  const [index, setIndex] = useState(0);
  /* Set by the user via the control, and separately by hover/focus. Kept apart
     so moving the pointer away does not silently undo an explicit pause. */
  const [userPaused, setUserPaused] = useState(false);
  const [hoverPaused, setHoverPaused] = useState(false);
  /* 🔴 THE THIRD HOLD, AND IT IS NOT OPTIONAL. A YouTube slide starts playing
     on a click, and a 7-second rotation would then carry the visitor off the
     video they just chose to watch. Keyed by the slide's own key rather than a
     boolean so that advancing away and coming back does not leave a stale
     "playing" flag holding the rotation for ever. */
  const [playingKey, setPlayingKey] = useState<string | null>(null);

  /* 🔴 WHICH MP4s FAILED TO LOAD. `<video>` does NOT fall back to its `poster`
     when the source 404s or decodes badly — it holds the poster only until it
     has enough data to paint, then shows a black box if the data never comes.
     A wrong Cloudinary path is therefore invisible in review and a black slide
     in production, which is exactly the failure `HeroVideo` warns about in
     `types/heroMedia.ts`. Recording the failure lets the slide fall back to
     the poster image it already has, so a broken upload degrades to a
     photograph rather than to a hole. A Set keyed by slide key, because the
     same clip may legitimately appear twice and both copies fail together. */
  const [failedVideos, setFailedVideos] = useState<ReadonlySet<string>>(() => new Set());

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const paneRef = useRef<HTMLDivElement>(null);

  /* 🔴 WHETHER ANY SLIDE PLAYS BY ITSELF — the gate for showing a pause
     control at all. Previously the whole control cluster was gated on `multi`,
     so a hero holding ONE auto-playing MP4 rendered no pause button: motion
     with no way to stop it, which is the plain reading of a WCAG 2.2.2
     failure. Images and YouTube facades do not move on their own, so a
     single-image hero correctly still shows nothing. */
  /* A clip that failed does not count: once it has fallen back to its poster
     nothing on that slide moves, so a hero of one broken MP4 correctly stops
     offering a pause button for motion that is not happening. */
  const hasSelfPlaying = items.some(
    (item) => item.kind === 'video' && !failedVideos.has(heroKey(item)),
  );

  const activeKey = items[index] ? heroKey(items[index]!) : null;
  const youtubePlaying = playingKey !== null && playingKey === activeKey;
  const advancing = multi && !reduceMotion && !userPaused && !hoverPaused && !youtubePlaying;

  /* THE VISITOR'S OWN NAVIGATION. Wrapping, for the reason in the header note:
     the rotation already carries the last slide round to the first, so an
     arrow that stopped there would disagree with the pane. `items.length` is
     read inside the updater rather than captured, so a CMS change between
     renders cannot leave a stale modulus behind. */
  const goTo = useCallback((target: number) => {
    setIndex(target);
  }, []);

  const prev = useCallback(() => {
    setIndex((current) => (current - 1 + items.length) % items.length);
  }, [items.length]);

  const next = useCallback(() => {
    setIndex((current) => (current + 1) % items.length);
  }, [items.length]);

  /* THE SCROLL-SHRINK. Writes `--hero-p` onto the SECTION, not onto the pane:
     the sticky wrapper's gutter and nav clearance are interpolated from the
     same number, and a custom property set on the section inherits down to
     both. See globals.css for the geometry it drives.

     Nothing here is React state. A `setState` per scroll frame would re-render
     the whole stage — slides, controls and all — sixty times a second to move
     one number; writing the property straight onto the node moves it without
     React in the loop at all. */
  useEffect(() => {
    const section = paneRef.current?.closest<HTMLElement>('[data-hero-scroll]');
    if (!section) return;
    /* Reduced motion keeps the settled pane, which globals.css already sets.
       Bailing out before the first write is what leaves it in charge — an
       inline property here would beat the media query. */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      /* The pin's travel: everything the section is taller than one screen. */
      const travel = section.offsetHeight - window.innerHeight;
      if (travel <= 0) {
        section.style.setProperty('--hero-p', '1');
        return;
      }
      const scrolled = Math.min(Math.max(-section.getBoundingClientRect().top, 0), travel);
      const progress = Math.min(scrolled / (travel * SETTLE_AT), 1);
      section.style.setProperty('--hero-p', progress.toFixed(4));
    };

    /* Coalesced to one write per frame: scroll fires far more often than the
       screen refreshes, and Lenis drives it from its own rAF loop. */
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      section.style.removeProperty('--hero-p');
    };
  }, []);

  /* ONLY THE VISIBLE VIDEO PLAYS. Leaving all of them running decodes N video
     streams for one visible pane — the single most expensive thing a hero can
     do on a phone — and it is invisible while it happens, so nothing about the
     page suggests why scrolling has gone rough.

     ⚠️ `videoRefs` IS SPARSE NOW. Only `kind: 'video'` slides register a ref,
     so the array has holes wherever an image or a YouTube slide sits. The
     `if (!el) return` guard that was already here is what makes that a
     non-event — but it is now load-bearing rather than defensive. */
  useEffect(() => {
    videoRefs.current.forEach((el, i) => {
      if (!el) return;

      if (i !== index) {
        el.pause();
        /* Rewound so a returning slide starts from its opening frame rather
           than resuming mid-shot, which reads as a glitch on a loop. */
        el.currentTime = 0;
        return;
      }

      /* 🔴 `userPaused` IS HONOURED HERE, AND ITS ABSENCE WAS A REAL WCAG
         2.2.2 FAILURE. The pause control only ever cleared `advancing`, which
         stops the ROTATION — the `<video>` elements kept looping underneath it.
         The success criterion covers "moving, blinking or scrolling"
         information, and a looping clip is exactly that, so a pause button that
         visibly does nothing to the motion it sits on top of only half-met the
         criterion. Hover-pause is deliberately NOT included: an incidental
         pointer crossing the pane should not stop playback, only the explicit
         control should. */
      if (reduceMotion || userPaused) {
        el.pause();
        return;
      }

      /* `play()` REJECTS rather than throws — a browser is entitled to refuse
         autoplay, and on iOS Low Power Mode it always does. Swallowing it is
         correct: the poster frame stays up and the hero is still complete. An
         unhandled rejection here would surface as a console error on a page
         that is working as designed. */
      void el.play().catch(() => {});
    });
  }, [index, reduceMotion, userPaused, items.length]);

  /* A slide change unmounts any playing YouTube iframe, so the hold is
     released with it. Without this, clicking play and then pressing a dot
     would leave `playingKey` pointing at a slide nobody is watching. */
  useEffect(() => {
    setPlayingKey(null);
  }, [index]);

  useEffect(() => {
    if (!advancing) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % items.length);
    }, ADVANCE_MS);
    return () => clearInterval(timer);
  }, [advancing, items.length]);

  const label = useCallback(
    (item: HeroMediaItem, i: number) => heroLabel(item, i, items.length),
    [items.length],
  );

  return (
    <div
      ref={paneRef}
      className={cx(
        'relative isolate w-full overflow-hidden',
        /* `on-dark` switches focus rings to white — see globals.css. Without it
           the keyboard outline is `--color-core-black` on the footage, i.e.
           invisible, which is a real failure and not a cosmetic one. */
        'on-dark',
        /* Width, the height floor, the border and the radius all live in this
           class in globals.css, because every one of them is interpolated
           between the full-screen and settled states. */
        'hero-pane',
        FRAME_SHADOW,
        /* `justify-end`, not `justify-center`: the glass panel sits LOW in the
           frame on request — centred across, down at the bottom. The pane's
           own bottom padding is what holds it off the edge, so it keeps the
           same clearance at every breakpoint and at every point of the shrink. */
        'flex flex-col items-center justify-end',
        /* 🔴 THE BOTTOM PADDING IS NO LONGER THE TOP'S TWIN, and the asymmetry
           is the whole point: the control cluster sits in the bottom band, and
           `justify-end` parks the enquiry pill against this padding. It was
           `py-16` (64px) against a 44px-tall cluster at `bottom-4` — 4px of
           clearance, which the taller 44px controls would have closed into an
           overlap, and which a wrapped second row of dots on a 320px screen
           would have turned into the cluster sitting ON the booking form.

           `pb-32` (128px) clears the cluster at its tallest (two wrapped rows,
           ~104px from the pane's bottom edge) at every width. The top padding
           is unchanged — nothing is anchored up there. */
        'px-5 pb-32 pt-16 mid:px-8 mid:pt-20 tablet:px-12 tablet:pt-28',
      )}
      /* Hover and focus pause the rotation, so a slide cannot change out from
         under someone reading it or tabbing through the controls.

         🔶 WORTH KNOWING. The pane covers the whole screen on arrival, so "the
         pointer is over the pane" means "the pointer is anywhere on the page"
         until it settles — on a desktop the rotation therefore sits paused
         through the opening. If a second slide is added and the first never
         hands over, that is the cause: gate this on `--hero-p` being past the
         settle point rather than on hover alone. */
      onPointerEnter={() => setHoverPaused(true)}
      onPointerLeave={() => setHoverPaused(false)}
      onFocusCapture={() => setHoverPaused(true)}
      onBlurCapture={() => setHoverPaused(false)}
    >
      {/* ---------- Layer 1: the slides ----------
          One branch per `kind`. Every branch produces the same box — absolutely
          positioned, `object-cover`, crossfaded on opacity — so the pane cannot
          change shape depending on what is in it. */}
      {items.map((item, i) => {
        const key = heroKey(item);
        const active = i === index;
        const fade = cx(SLIDE_BASE, SLIDE_FADE, active ? 'opacity-100' : 'opacity-0');

        /* ---- A PHOTOGRAPH ----
           Through `next/image`, which is why the backend must emit it on the
           allowlisted Cloudinary path: an unlisted host is a BUILD failure, not
           a broken slide. `priority` on the first slide only — it is the LCP
           candidate; marking all of them priority would start N full-size
           downloads for one visible image. */
        if (item.kind === 'image') {
          return (
            <Image
              key={key}
              src={item.src}
              /* Decorative at this size: the headline carries the page's
                 meaning and the dot controls are separately labelled, so
                 announcing the backdrop would be duplication. The CMS `alt` is
                 still what names the slide in those controls. */
              alt=""
              fill
              sizes="100vw"
              quality={90}
              priority={i === 0}
              aria-hidden="true"
              className={fade}
            />
          );
        }

        /* ---- A YOUTUBE LINK ----
           The poster fills the pane; the iframe is mounted only by the click on
           the control in Layer 3. An unparseable URL drops the slide's player
           but KEEPS its poster, so the hero still looks finished — the same
           degradation the blog's player chose. */
        if (item.kind === 'youtube') {
          const videoId = youtubeId(item.youtubeUrl);

          if (active && playingKey === key && videoId) {
            return (
              <iframe
                key={key}
                src={youtubeEmbedUrl(videoId)}
                title={item.title ?? 'Hero video'}
                /* The narrowest set that leaves a normal player working. No
                   camera, no microphone, no payment, no geolocation. */
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                /* 🔴 `z-20`, NOT the slide layer's `-z-10`. A playing iframe
                   carries YouTube's OWN controls, and at the slide depth they
                   sat underneath the glass type panel and the controls pill —
                   so the visitor could start a video and then not pause,
                   seek or fullscreen it. A background slide belongs behind the
                   type; a video someone is actively watching does not. */
                className={cx('absolute inset-0 z-20 size-full border-0')}
              />
            );
          }

          return (
            <Image
              key={key}
              src={item.poster}
              alt=""
              fill
              sizes="100vw"
              quality={90}
              priority={i === 0}
              aria-hidden="true"
              className={fade}
            />
          );
        }

        /* ---- AN UPLOADED MP4 ----
           🔴 A FAILED CLIP FALLS BACK TO ITS POSTER rather than staying a
           black rectangle — see `failedVideos` above. `poster` is optional on
           `HeroVideo` (the CMS always sends one, but the type does not promise
           it), so a failure with nothing to fall back to drops the slide's
           picture entirely and lets the slides underneath show through. That
           is still better than a black box, and it is the one case an
           administrator will actually notice and fix.

           A plain `<img>`, NOT next/image: this path is reached only when
           something is already wrong, and next/image would throw at BUILD time
           for a poster host outside the allowlist — turning one bad upload
           into a failed deploy. */
        if (failedVideos.has(key)) {
          return item.poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={key} src={item.poster} alt="" aria-hidden="true" className={fade} />
          ) : null;
        }

        return (
          <video
            key={key}
            ref={(el) => {
              videoRefs.current[i] = el;
            }}
            src={item.src}
            poster={item.poster}
            /* Fires for a 404, a DNS failure, an unsupported codec — every way
               a `<video src>` can fail to become playable. Guarded on "not
               already recorded" so a browser that fires it repeatedly cannot
               spin the state. */
            onError={() => {
              setFailedVideos((failed) =>
                failed.has(key) ? failed : new Set(failed).add(key),
              );
            }}
            /* `muted` and `playsInline` are not preferences — every browser
               refuses to autoplay without both. `loop` because a single clip
               ending on a frozen frame is worse than no video. */
            muted
            loop
            playsInline
            /* The active clip is worth bytes; the rest fetch enough to have a
               first frame ready for the crossfade and no more. */
            preload={active ? 'auto' : 'metadata'}
            aria-hidden="true"
            tabIndex={-1}
            className={fade}
          />
        );
      })}

      {/* ---------- Layer 2: the type ----------
          There is no layer between this and the slides any more. The scrim that
          used to sit here is gone on request — see the header note. */}
      <div className="relative flex w-full flex-col items-center">{children}</div>

      {/* ---------- Layer 3: the YouTube play control ----------
          🔴 BOTTOM-RIGHT, DELIBERATELY. The glass panel is centred and the dot
          controls are bottom-centre, so this is the one corner where a
          focusable control collides with neither. It only exists for a YouTube
          slide, and it unmounts once playing — the iframe carries its own
          controls from that point. */}
      {(() => {
        const active = items[index];
        if (!active || active.kind !== 'youtube') return null;
        if (playingKey === heroKey(active)) return null;
        if (!youtubeId(active.youtubeUrl)) return null;

        return (
          <button
            type="button"
            onClick={() => setPlayingKey(heroKey(active))}
            className={cx(
              /* 🔴 LIFTED CLEAR OF THE DOTS PILL. Both controls previously
                 occupied the same bottom band at the same z-index, so on a
                 narrow viewport the play button and the slideshow dots
                 overlapped and the upper one swallowed the other's clicks.
                 The pill is centred at bottom-4/6; this sits above it, still
                 in the corner, and at a higher z so it is never the one that
                 loses.

                 🔶 RAISED FROM 16/20 TO 28/32 when the cluster's controls grew
                 to 44px: the pill's top edge is now ~72px off the pane bottom,
                 which `bottom-16` (64px) sat inside. These two numbers move
                 together with CONTROL's height — if one changes, check the
                 other. */
              'absolute bottom-28 right-4 z-30 inline-flex items-center gap-2 tablet:bottom-32 tablet:right-6',
              'rounded-pill border border-white/50 bg-surface/80 py-2 pl-3 pr-4 backdrop-blur-[13px]',
              'text-body-sm font-medium text-ink transition-colors hover:bg-surface',
            )}
          >
            <Icon name="play" size={15} />
            {active.title?.trim() ? `Play: ${active.title.trim()}` : 'Play video'}
          </button>
        );
      })()}

      {/* ---------- Layer 4: controls, only when they have a job ---------- */}
      {multi || (hasSelfPlaying && !reduceMotion) ? (
        <div
          className={cx(
            /* 🔴 `inset-x-0 mx-auto w-fit`, NOT `left-1/2 -translate-x-1/2`,
               AND THE DIFFERENCE IS LOAD-BEARING NOW THAT THIS WRAPS.

               An absolutely positioned box with no width is SHRINK-TO-FIT, and
               shrink-to-fit resolves against "the containing block minus the
               inset" — so `left: 50%` gave this element HALF the pane to size
               itself in. With `flex-wrap` added, a 244px cluster that fits a
               320px screen four times over was being wrapped into two rows
               inside a 159px box. Measured: 159×104 at 320px, 214×104 at 430px.

               `inset-x-0` makes the available width the whole pane, `w-fit`
               takes the cluster's natural width, and `mx-auto` centres it —
               which is also simpler than a transform. */
            'absolute inset-x-0 bottom-4 z-10 mx-auto w-fit tablet:bottom-6',
            /* `max-w` + `flex-wrap` remain the 320px insurance, and now they
               only fire when they are actually needed. Today's cluster is
               ~244px (two arrows, a pause and four dots) against a 288px cap at
               320px, so it stays on one row; a hero of six or more slides wraps
               the dots to a second row rather than pushing the arrows off the
               edge of the pane. */
            'flex max-w-[calc(100vw-2rem)] flex-wrap items-center justify-center gap-0.5',
            'rounded-pill border border-white/50 bg-surface/80 p-1.5 backdrop-blur-[13px]',
          )}
          role="group"
          aria-label="Hero slideshow controls"
          /* 🔴 ARROW KEYS, scoped to the cluster rather than to the window. A
             listener on the pane would swallow Left/Right for anyone using
             them to move the caret inside the enquiry field, which also lives
             in this subtree. Here it fires only while a control has focus,
             which is the behaviour the APG's carousel pattern describes. */
          onKeyDown={(event) => {
            if (!multi) return;
            if (event.key === 'ArrowLeft') {
              event.preventDefault();
              prev();
            } else if (event.key === 'ArrowRight') {
              event.preventDefault();
              next();
            }
          }}
        >
          {/* The arrows bracket the cluster and exist only when there is
              somewhere to go — the same rule the dots have always followed. */}
          {multi ? (
            <button type="button" onClick={prev} className={CONTROL}>
              <span className="visually-hidden">Previous slide</span>
              <Icon name="arrowRight" size={16} className="rotate-180" />
            </button>
          ) : null}

          {/* WCAG 2.2.2 (Pause, Stop, Hide): content that moves or auto-updates
              for more than five seconds needs a way to stop it. Both the
              rotation AND the footage qualify, so this is required, not a
              nicety. Hidden under `prefers-reduced-motion` because nothing is
              moving there to pause. */}
          {!reduceMotion ? (
            <button
              type="button"
              onClick={() => setUserPaused((paused) => !paused)}
              aria-pressed={userPaused}
              className={CONTROL}
            >
              <span className="visually-hidden">
                {userPaused ? 'Play hero slideshow' : 'Pause hero slideshow'}
              </span>
              <Icon name={userPaused ? 'play' : 'pause'} size={14} />
            </button>
          ) : null}

          {/* The dots navigate BETWEEN slides, so they appear only when there
              is somewhere to go. A single-MP4 hero shows the pause button
              alone. The hit area is 44px tall and 28px wide — the carousel's
              exact figures — while the paint stays an 8px dot. */}
          {multi
            ? items.map((item, i) => (
                <button
                  key={heroKey(item)}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-current={i === index ? 'true' : undefined}
                  className="inline-flex h-11 w-7 shrink-0 items-center justify-center rounded-pill"
                >
                  <span className="visually-hidden">{label(item, i)}</span>
                  <span
                    aria-hidden="true"
                    className={cx(
                      'block size-2 rounded-full transition-all duration-300 ease-out-soft',
                      'motion-reduce:transition-none',
                      i === index ? 'w-5 bg-ink' : 'bg-ink/30',
                    )}
                  />
                </button>
              ))
            : null}

          {multi ? (
            <button type="button" onClick={next} className={CONTROL}>
              <span className="visually-hidden">Next slide</span>
              <Icon name="arrowRight" size={16} />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
