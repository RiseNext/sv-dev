import Image from 'next/image';
import type { CSSProperties } from 'react';
import { LinkButton } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ShareButton } from '@/components/ui/ShareButton';
import { ProjectPhotoFrame } from '@/components/sections/ProjectPhotoFrame';
import { YouTubeEmbed } from '@/components/ui/YouTubeEmbed';
import type { ProjectPromoVideo } from '@/lib/projectVideo';
import type { ImageRef, Project } from '@/types/content';
/* The YouTube link parser. It lives in `lib/blog.ts` because the blog was the
   first thing to need it, and it is pure — no network, no `server-only` — so
   the project cards share it rather than keeping a second copy of the one
   function that must not get an id wrong. */
import { youtubeId } from '@/lib/blog';
import { cx } from '@/lib/cx';

/* =============================================================================
   MEDIA SEQUENCE — the project cards on the home page.

   One white card per published project: the photograph on the left, the name,
   place, summary, a link and a share control on the right. They are a plain
   column and they scroll like a plain column.

   ─── THERE IS DELIBERATELY NO SCROLL EFFECT ───────────────────────────────
   This was a scroll-driven deck: the cards stacked with `position: sticky`,
   each one parking below the nav while the next rose over it, and each card
   opened as it landed — its edges sweeping out from a centred photograph to
   reveal the copy from behind it, with a parallax on the photograph inside.
   Every value was a function of scroll offset, so it ran backwards on the way
   up.

   All of it was removed on request, in that order: the parallax first (a
   photograph sliding inside a card that is standing still reads as a fault),
   then the hover on the picture, then the reveal and the stacking together.
   What is here now is what that effect was always resolving TO — so if it is
   ever wanted back, the layout below is the finished state to animate toward,
   and the history has the arithmetic.

   Nothing in this file runs in the browser any more. It is a server component:
   no state, no effects, no refs, no scroll listener, and no JavaScript shipped
   for the section beyond the share button, which brings its own.

   ─── THE CARD ─────────────────────────────────────────────────────────────
   A white card with 8px of padding holding both halves. The radii are
   concentric, which is what makes the inset read as deliberate rather than as
   a misaligned overlay: the card is 40px, the padding is 8px, so the picture
   is 40 − 8 = 32px (`rounded-4xl`). Change the padding and the inner radius
   has to move with it.

   ─── THE LAYOUT, PER THE CLIENT'S SKETCH ──────────────────────────────────
   From 1024px the card is a flex row: the photographs down the left, and a
   column on the right whose top line is the promotion video BESIDE the logo
   tab, the project's details under both, and the two controls at the foot.

     ┌───────────────┬───────────────────────┐
     │               │ ┌─────────┐ ┌───────┐ │
     │               │ │  video  │ │ logo  │ │
     │    images     │ └─────────┘ └───────┘ │
     │     45%       │ 01 / 04 · CATEGORY    │
     │               │ Name      locality    │
     │               │ summary ……………………      │
     │               │ [view project]   (sh) │
     └───────────────┴───────────────────────┘

   Below 1024px it is a column, in the order the sketch reads top to bottom:
   photographs, video, details, controls.

   The picture stretches to the row's height with a floor, so a long summary
   makes the CARD taller and the picture grows with it rather than leaving the
   column hanging past the white.

   🔴 THE VIDEO HAS TO CLEAR THE LOGO TAB, AND THE TAB'S WIDTH IS NOT A
   CONSTANT. It is the logo's own aspect ratio inside a bounding box, so it
   differs per project — a square mark is 176px at desktop and a wordmark is
   240px. The pane therefore reserves `--tab-width`, THE SAME EXPRESSION THE
   TAB SIZES ITSELF WITH, plus the 8px seam; both read it off the card, which
   is why those custom properties are declared there rather than on the tab.
   Hard-code a width here and the first wide logo an admin uploads lands on
   top of the video.

   ─── THE PANE IS RESERVED WHETHER OR NOT THERE IS A VIDEO IN IT ───────────
   No project carries a link today, so a card that dropped the pane without
   one would change shape project by project as links arrived — four
   different cards in one column, and a layout nobody could sign off until the
   last video existed. `VideoSlot` holds the space instead: same box, same
   radius, visibly empty. The card does not move when a link lands, exactly as
   the logo tab holds its corner before a logo arrives.

   ─── THE PLAYER IS A FACADE, NOT AN EMBED ─────────────────────────────────
   `<YouTubeEmbed>` is the blog's component, and it loads NOTHING from YouTube
   until the visitor clicks — a poster and a play button, then the iframe on
   the gesture. Four cards on the home page would otherwise cost four
   megabytes of third-party script and set tracking cookies on every visitor
   who scrolled past. The reasoning is in that file; this card just passes it
   a box.

   The pane is a true 16:9 here, which it could not be in the full-height
   partition this replaced: a thumbnail is shown uncropped and playback does
   not letterbox inside a box taller than the video. It is the one thing the
   sketch's arrangement buys for free.

   ─── THE PICTURE IS A SET, NOT A PHOTOGRAPH ───────────────────────────────
   `gallery` is optional and often absent, so the picture half is `image`
   followed by that project's own site photography, de-duplicated — a project
   with nothing but a cover image gets a set of one and the frame renders
   exactly what it used to, controls and all withheld. The stepping lives in
   ProjectPhotoFrame; the card still owns the frame's size and radius, which
   is why they are passed to it as `className` rather than set inside it.
   ========================================================================== */

/* The card shape — exactly the fields read here. The project list from the
   data layer satisfies all of it but `gallery`, which only the single-project
   endpoint returns; the page merges that in. */
type Item = Pick<Project, 'slug' | 'name' | 'category' | 'locality' | 'summary' | 'image'> &
  Partial<Pick<Project, 'gallery'>> & {
    /**
     * The project's own logo, for the slot at the card's top-right corner.
     *
     * 🔶 NOT ON THE CMS CONTRACT. `src/types/content.ts` has no `logo` on a
     * project and is deliberately left alone, so this field is declared HERE
     * and nowhere else: the card is the only thing that wants it. The page
     * reads it off the project record opportunistically — see the note there —
     * which means it is `undefined` on every project today and the slot
     * renders its empty state.
     *
     * The moment the backend emits `logo` on `/projects/{slug}`, every card
     * fills with no change to this file. Nothing here has to be unpicked when
     * it does: this declaration simply stops being ahead of the contract.
     */
    logo?: ImageRef | null;
    /**
     * That project's promotion video.
     *
     * 🔶 NOT ON THE CMS CONTRACT EITHER, and declared here for the same reason
     * `logo` is: `src/types/content.ts` describes what the backend actually
     * emits, and a project record carries no video field yet.
     *
     * The page resolves it through `projectVideo()`, which asks the CMS first
     * and the slug-keyed stop-gap second — the same call for every project,
     * including ones published long after this was written. Nothing here, and
     * nothing on the page, knows a project by name.
     *
     * `youtubeUrl` is whatever was pasted — a watch URL, a `youtu.be` link, a
     * Shorts link, tracking tail and all. It is parsed at the render site, and
     * an unparseable value drops the pane and renders the approved card
     * instead of an empty player.
     */
    promoVideo?: ProjectPromoVideo | null;
  };

/**
 * The tab's own shape, from the logo's.
 *
 * ─── THE TAB HUGS THE LOGO, IN BOTH DIRECTIONS ──────────────────────────────
 * `--tab-h` and `--tab-w` are a BOUNDING BOX, not a size. The tab is the
 * largest box of the logo's own proportions that fits inside it, which is
 * `object-contain` applied to the CONTAINER rather than to the picture.
 *
 * This matters because fixing the height and letting only the width follow
 * looked wrong for anything but a square mark: a 3:1 wordmark got a 240×176
 * tab and filled 208×69 of it, floating in empty bands, and a 10:1 banner
 * filled 208×20 of the same box. Now the wordmark gets a 240×80 tab and the
 * banner a 240×24 strip — each one fills what it is given.
 *
 * It is also strictly SAFER for the copy beside it: a wide logo now produces a
 * SHORTER tab, so the shapes that reach furthest across the card are the ones
 * that stop highest up it.
 *
 * `--logo-r` is width ÷ height as a bare number, because `calc()` needs a
 * scalar; `aspectRatio` carries the same ratio for the height to fall out of.
 *
 * 🔴 THE TWO HALVES GO ON DIFFERENT ELEMENTS, and that is not tidiness. The
 * ratio is declared on the CARD so that the video pane beside the tab can
 * reserve exactly the tab's width (`--tab-width`, built from it in TAB_VARS);
 * the `aspectRatio` stays on the tab, because setting it on the card would
 * give the whole card the logo's shape.
 *
 * ─── THE FALLBACK IS NOT COSMETIC ───────────────────────────────────────────
 * `width`/`height` cross the network, so neither is a guarantee: a record can
 * arrive with one missing, with a zero, or with a string. Anything that is not
 * two usable positive numbers falls back to square, because `aspect-ratio: 0`
 * or a `NaN` in `calc()` collapses the tab to nothing and the logo vanishes
 * entirely — far worse than a slightly wrong shape.
 */
const TAB_RATIO_MIN = 0.5; /* no narrower than 1:2  */
const TAB_RATIO_MAX = 3.5; /* no wider   than 3.5:1 */

function logoRatio(logo: ImageRef | null | undefined): string {
  const width = Number(logo?.width);
  const height = Number(logo?.height);
  const usable =
    Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0;

  /* 🔴 CLAMPED, and not for taste. The tab carries a fixed padding, so past a
     certain thinness the padding is larger than the tab: a 10:1 banner taken
     literally produced a 240×24 tab whose inner box computed to −80×−8, and
     the logo disappeared. The clamp is what guarantees the tab always has an
     inside. Between these bounds it still takes the logo's own shape exactly;
     beyond them `object-contain` letterboxes the remainder, which is the
     correct place for the compromise to land. */
  const raw = usable ? width / height : 1;
  return String(Math.min(Math.max(raw, TAB_RATIO_MIN), TAB_RATIO_MAX));
}

/* ---------------------------------------------------------------------------
   THE TAB'S GEOMETRY, DECLARED ON THE CARD.

   `--tab-h` / `--tab-w` are the bounding box per width — not the tab's size,
   its bounds. `--tab-width` is what the tab actually computes to: whichever
   bound the logo's ratio hits first.

   🔴 THEY LIVE HERE, ON THE CARD, BECAUSE TWO ELEMENTS NEED THEM. The tab
   sizes itself with `--tab-width`, and the video pane reserves the same value
   so the two never overlap. Move them back onto the tab and the pane has no
   way to know how much room to leave.
   ------------------------------------------------------------------------ */
const TAB_VARS = cx(
  '[--tab-h:6rem] [--tab-w:13rem]',
  'tablet:[--tab-h:7rem] tablet:[--tab-w:14rem]',
  'desktop:[--tab-h:11rem] desktop:[--tab-w:15rem]',
  '[--tab-width:min(var(--tab-w),calc(var(--tab-h)*var(--logo-r)))]',
);

/* ---------------------------------------------------------------------------
   THE TWO HALVES, AND WHERE THE 8px SEAM BETWEEN THEM COMES FROM.

   `gap-2` is the card's own padding, so the white between the halves is
   exactly as wide as the white around them — and both give up HALF of it
   (`-0.25rem` each), which is what keeps the split a true 45/55 of the space
   rather than 45/55 plus an overflow of 8px.

   45/55 rather than the 60/40 this started at: the right-hand side is no
   longer just a column of type, it carries the video and the logo tab across
   its top, and at 40% there was not enough width left beside a wordmark-shaped
   tab to show a video at all.
   ------------------------------------------------------------------------ */
const PHOTO_SIZES = '(min-width: 1400px) 630px, (min-width: 1024px) 45vw, 100vw';

/** Everything about the frame's box except its width: the phone's fixed height,
 *  the concentric radius (card 40px − 8px of padding), and the desktop floor it
 *  stretches up from. */
const PHOTO_BOX = cx(
  'h-[min(42svh,20rem)] w-full rounded-4xl',
  'tablet:h-auto tablet:min-h-[min(66svh,36rem)]',
);

/* The pane's box, and it is the same box whether a video is in it or not —
   which is what makes the card stay still when a link arrives. 16:9 at every
   width, so a thumbnail is never cropped; the WIDTH is the right-hand column
   minus the logo tab, which the wrapper around it owns. Same `rounded-4xl` as
   the picture: they are panes of one card. */
const VIDEO_BOX = 'aspect-video w-full rounded-4xl';

/* ---------------------------------------------------------------------------
   🔶 THE RESERVED PANE — delete this when every project has a link.

   The space the promotion video will occupy, held open and visibly empty. It
   is the same idea as `TestimonialsStub`: a reserved area reads as a slot
   waiting to be filled, where a section that simply vanishes reads as a
   feature nobody built.

   🔴 IT IS NOT A PLAY BUTTON AND MUST NOT LOOK LIKE ONE. The glyph is an
   outlined disc on the sand panel, not the solid white disc the real player
   uses — pressing a convincing play button that does nothing is worse than an
   obviously empty box. Nothing here is focusable and nothing takes a click.

   `aria-hidden`, because there is nothing to announce: a screen-reader user
   told "promotion video" and given no video has been misled, and the card's
   heading, summary and link are all still read normally.

   The label is the project's own `label-mono`, so the empty state is typeset
   like the rest of the card rather than like an error.
   ------------------------------------------------------------------------ */
function VideoSlot() {
  return (
    <div
      aria-hidden="true"
      className={cx(
        VIDEO_BOX,
        'flex flex-col items-center justify-center gap-4 bg-sand',
        /* The dashed hairline says "reserved" in the one way that cannot be
           read as "broken": a solid border would read as a frame around
           nothing, and no border at all as a panel that failed to load. */
        'border border-dashed border-gold-line',
      )}
    >
      <span className="inline-flex size-16 items-center justify-center rounded-full border border-gold-line text-gold-ink/70">
        <Icon name="play" size={24} />
      </span>
      <p className="label-mono font-mono">Promotion video</p>
    </div>
  );
}

export function MediaSequence({ items }: { items: readonly Item[] }) {
  if (items.length === 0) return null;

  const count = String(items.length).padStart(2, '0');

  return (
    <section className="mt-16 px-gutter tablet:mt-28" aria-label="Our layouts">
      <ol className="container-page">
        {items.map((item, index) => {
          const href = `/projects/${item.slug}`;

          /* THIS PROJECT'S PHOTOGRAPHS AND NOTHING ELSE. Filtered rather than
             trusted: `gallery` crosses the network, a row with no `src` would
             render an empty slide, and a gallery that repeats the cover image
             would open the set on the same picture twice. The layout plan is
             deliberately left out — the frame crops to fill, and a cropped
             plan drawing loses the edges that make it a plan. */
          const photos = [item.image, ...(item.gallery ?? [])].filter(
            (photo, i, all) => photo?.src && all.findIndex((p) => p?.src === photo.src) === i,
          );

          /* 🔶 THE CMS IS THE ONLY SOURCE. A logo committed to `public/` stood
             here briefly while the admin field was being built; it was removed
             on request so that uploading a logo is the one and only way one
             appears. Until the backend emits the field this is `undefined` on
             every project and the tab renders its empty state. */
          const logo = item.logo;

          /* 🔴 THE PARSE IS THE SWITCH. `youtubeId()` returns null for anything
             it cannot read a real 11-character id out of, so a half-pasted
             link, a Vimeo URL or an empty string all land on the approved
             card rather than on a pane with a dead player in it. Nothing here
             guesses: see the note on that function. */
          const videoId = youtubeId(item.promoVideo?.youtubeUrl);

          return (
            <li key={item.slug} className="mb-10 last:mb-0 tablet:mb-16">
              <div
                /* `--logo-r` rides the CARD so the video pane can reserve the
                   tab's width — see `logoRatio` and TAB_VARS. */
                style={{ '--logo-r': logoRatio(logo) } as CSSProperties}
                className={cx(
                  'relative rounded-band bg-surface p-2',
                  'shadow-[0_40px_90px_-45px_rgba(92,68,28,0.45)]',
                  TAB_VARS,
                  /* The row: pictures down the left, everything else in the
                     column on the right. `items-stretch` is the default and is
                     what makes the picture match the column's height. */
                  'tablet:flex tablet:items-stretch tablet:gap-2',
                )}
              >
                {/* ---- THE PROJECT'S LOGO, straddling the card's top-right
                    corner, per the template.

                    An image FIELD, not a picture: it holds the corner whether
                    or not there is a logo to put in it, so the card does not
                    move when one arrives. No project has one today — see the
                    🔶 note on `logo` above — so what ships is the empty plate.

                    ─── THE PLATE TAKES THE LOGO'S SHAPE ─────────────────────
                    🔴 ITS WIDTH IS NOT A CONSTANT. Only the HEIGHT is fixed;
                    the width comes from `aspect-ratio`, set per project from
                    the CMS's own `logo.width / logo.height`. A circular badge
                    gets a square plate, a wordmark gets a wide one, and both
                    fill the plate they are given.

                    This was a fixed 2.5:1 box, and that is wrong for a badge:
                    `object-contain` scales a 1:1 mark to the HEIGHT, so the SV
                    emblem would have sat 96px wide inside a 240px plate with
                    70px of dead margin either side — a logo marooned in a box
                    rather than a logo. Sizing the box instead of padding the
                    picture is what makes one field hold either shape.

                    `max-w-*` is the guard, not the size: an extreme banner of a
                    logo stops at the old width rather than reaching across the
                    card, and letterboxes inside it. CONTAIN throughout — a logo
                    cropped to fill its box is a ruined logo.

                    With no logo there is no aspect to take, so the empty plate
                    falls back to 1:1 — square, because that is the shape of the
                    mark this site actually uses.

                    ─── IT SITS INSIDE THE CARD ──────────────────────────────
                    Fully within the white container, inset 20px from its top
                    and right edges. It used to straddle the corner, and the
                    only reason was width: at a fixed 240px the plate reached
                    far enough across the copy column to run under the heading,
                    so it had to be lifted out of the flow. Taking its shape
                    from the logo fixed that — a square mark is 96px wide, which
                    clears the copy, so the overhang bought nothing and is gone.

                    🔴 HOW BIG IT MAY GET IS NOT A TASTE QUESTION, AND WHAT
                    SETS THE CEILING HAS CHANGED. Read this before enlarging
                    it again.

                    It used to land on the COPY, which was a 40% column beside
                    the photograph, and the ceiling was the summary: that
                    paragraph ran the full width of the column from about
                    227px down, so a tab reaching past it would have covered
                    live text at every width. Between 1024 and 1280 the column
                    was only ~274px wide and the tab had to stay at 112px to
                    leave the mono label room at all. (The history has the
                    arithmetic, if that layout ever comes back.)

                    The copy is now UNDER the media row, so none of that
                    applies: the tab lands on the top-right of the video pane
                    instead — or on the photograph on a phone, which is where
                    it already sat.

                    What it must not swallow is the play control, and it does
                    not: that control is centred in a pane the full height of
                    the row (36rem at the desktop floor), so at the tab's
                    largest — 11rem down from the top edge — there is more than
                    10rem of clear pane between the two. The duration badge is
                    bottom-right, further still. Enlarging `--tab-h` past about
                    16rem is what would start to reach it.

                    ─── IT IS A CORNER TAB, NOT A FLOATING BADGE ─────────────
                    Per the sketch: NO INSET. It shares the card's top edge and
                    the card's right edge, so two of its own corners are the
                    card's corners and two are interior.

                    That is what the radii say, and they are not decoration:
                      · top-right  `rounded-tr-band` — the CARD's own 40px
                        radius. Anything smaller and the tab's corner would
                        stand proud of the card's curve; anything larger and it
                        would cut inside it. It must be the same number.
                      · bottom-left `rounded-bl-3xl` — the one free corner, the
                        only one that reads as the tab's own shape.
                      · top-left and bottom-right stay SQUARE, because they sit
                        on the card's top and right edges. Rounding them would
                        open a notch against a straight edge.

                    The border follows the same logic: left and bottom only. The
                    top and right are the card's outline, and a border there
                    would double it. No drop shadow either — flush in the
                    corner it would spill outside the card.

                    `p-4` is doing more than breathing room from 1024px: a 40px
                    corner curve reaches about 12px diagonally into the box, so
                    the padding is what keeps a square logo clear of it.

                    Solid `bg-surface`, not a tint, and above the photograph's
                    own arrows (`z-10`): it stands on the card's white at
                    desktop and on the photograph on a phone, and has to read
                    the same on both.

                    It is `aria-hidden` ONLY while empty: an empty plate is
                    nothing to announce, but a real logo is the project's mark
                    and carries the CMS's alt text. ---- */}
                <div
                  aria-hidden={logo?.src ? undefined : 'true'}
                  /* The ratio itself is on the card; this is the shape it
                     gives THIS box. */
                  style={{ aspectRatio: 'var(--logo-r)' }}
                  className={cx(
                    'absolute right-0 top-0 z-20 overflow-hidden',
                    'rounded-bl-3xl rounded-tr-band',
                    /* RECESSED, not flush. The floor is the PAGE's cream
                       rather than the card's white, so the well reads as a
                       hole cut through the card to what lies under it; the
                       paired inset shadows are the walls — warm shade at the
                       top-left where the light does not reach, a white
                       highlight at the bottom-right where it pools. Flip
                       those two and the tab pops out instead of sinking in. */
                    'border-b border-l border-line bg-bg',
                    'shadow-[inset_3px_3px_7px_-1px_rgba(92,68,28,0.24),inset_-2px_-2px_5px_-1px_rgba(255,255,255,0.85)]',
                    /* Whichever bound the logo's ratio hits first — computed
                       on the card, in TAB_VARS, because the video pane beside
                       this reserves the very same value. The height falls out
                       of `aspect-ratio`. */
                    'w-(--tab-width)',
                  )}
                >
                  {logo?.src ? (
                    <Image
                      src={logo.src}
                      alt={logo.alt || `${item.name} logo`}
                      fill
                      sizes="(min-width: 1280px) 240px, (min-width: 1024px) 208px, 144px"
                      className="object-contain p-3 tablet:p-4"
                    />
                  ) : null}
                </div>
                {/* THE PICTURE IS STILL A LINK, but a pointer-only one: it
                    goes to the same place as "View project" in the copy, and
                    two tab stops for one destination is noise for a keyboard
                    or screen-reader user. The frame keeps it out of the tab
                    order and out of the accessibility tree; the button is the
                    one they get, and the arrows over it are their own.

                    Nothing happens on hover — no zoom, no chip. The copy
                    beside it carries a real button, so a hover state here would
                    only repeat an action the card already offers.

                    `min-h` rather than `h`: stretched by the row, it matches
                    the card's height whatever the copy needs, and never drops
                    below the floor on a short one. The photographs step INSIDE
                    this box — its height is the same whether the project has
                    one photograph or five. */}
                <ProjectPhotoFrame
                  images={photos}
                  name={item.name}
                  href={href}
                  sizes={PHOTO_SIZES}
                  className={cx(PHOTO_BOX, 'tablet:w-[calc(45%-0.25rem)] tablet:shrink-0')}
                />

                {/* ---- THE RIGHT-HAND COLUMN: video and logo across the top,
                     the details under them, the controls at the foot. On a
                     phone it is simply the rest of the card, stacked. ---- */}
                <div className="flex flex-col tablet:w-[calc(55%-0.25rem)] tablet:shrink-0">
                  {/* ---- THE TOP LINE: the video, and the strip the logo tab
                       stands in.

                       `mt-2` is the same 8px seam the photograph carries, and
                       it is a margin rather than a gap because the copy below
                       must NOT get one — it brings its own padding. ---- */}
                  <div className="mt-2 flex flex-col gap-2 tablet:mt-0 tablet:flex-row">
                    <div className="min-w-0 flex-1">
                      {/* The title is the player's ONLY accessible name — it
                          labels the play button ("Play: <name> promotion
                          video") and titles the iframe. One page carries
                          several of these, so it has to name the project.

                          No `cover` is passed, deliberately: the project's own
                          photograph is already beside this, and using it as
                          the poster too would make the card read as the same
                          picture twice. The pane falls back to YouTube's own
                          thumbnail for the video that is actually being
                          offered. */}
                      {videoId ? (
                        <YouTubeEmbed
                          videoId={videoId}
                          title={`${item.name} promotion video`}
                          duration={item.promoVideo?.duration}
                          className={VIDEO_BOX}
                        />
                      ) : (
                        <VideoSlot />
                      )}
                    </div>

                    {/* ---- THE SHARE CONTROL, UNDER THE LOGO.

                         🔴 THE SPACER IS THE TAB'S OWN FOOTPRINT, and it is
                         load-bearing: the tab is positioned on the CARD, not
                         in this flow, so without something holding its place
                         the control would sit behind the mark. It takes the
                         same width AND the same aspect ratio as the tab, so it
                         tracks it exactly whatever shape a logo turns out to
                         be — a wordmark gives a short tab and the control
                         rises with it.

                         The strip also sets the video's width: `flex-1` beside
                         `--tab-width` is what makes the pane end exactly where
                         the tab begins, with `gap-2` as the seam. The two can
                         never disagree because they are the same value.

                         On a phone the tab is on the PHOTOGRAPH, not here, so
                         the spacer goes and the strip becomes a full-width row
                         with the control on its right. ---- */}
                    <div
                      className={cx(
                        'flex justify-end',
                        /* The FLOOR is for the button, not the logo: a very
                           tall, narrow mark computes a tab only 5.5rem wide,
                           and the Share pill is about 6.7rem. Below that the
                           strip stops following the tab so the pill is never
                           wider than the space it stands in. Every real logo
                           so far is well past it, so nothing moves. */
                        'tablet:w-[max(var(--tab-width),7rem)]',
                        'tablet:shrink-0 tablet:flex-col tablet:items-center tablet:justify-start',
                      )}
                    >
                      {/* The tab's footprint — its width, not the strip's, so
                          the height this reserves stays exactly the tab's. */}
                      <div
                        aria-hidden="true"
                        className="hidden tablet:block tablet:aspect-(--logo-r) tablet:w-(--tab-width)"
                      />
                      <ShareButton
                        href={href}
                        name={item.name}
                        text={item.summary}
                        label="Share"
                        className="tablet:mt-4"
                      />
                    </div>
                  </div>

                  {/* The copy stands on the card's own white — it carries no
                      background of its own, which would be white on white with
                      a seam where the two met. All it holds is the room around
                      the words: `pl-12` off the photograph's edge, `pr-10` off
                      the card's.

                      `flex-1` so this fills what the video leaves, which is
                      what lets the controls sit at the FOOT of the card rather
                      than floating under the summary — see `mt-auto` on them. */}
                  <div
                    className={cx(
                      'flex flex-col px-4 pb-4 pt-5',
                      'tablet:flex-1 tablet:pb-8 tablet:pl-12 tablet:pr-10 tablet:pt-8',
                    )}
                  >
                    {/* The position-and-category label used to open the copy
                        here. It is at the card's FOOT now, where the share
                        control used to be — see the note down there. */}
                    <h3 className="text-heading-md text-ink tablet:text-heading-lg">
                      {item.name}
                    </h3>
                    <p className="mt-2 inline-flex items-center gap-1.5 font-mono text-body-xs text-ink-faint">
                      <Icon name="mapPin" size={13} />
                      {item.locality}
                    </p>

                    {/* Rendered only when present: a type is not a runtime
                        guarantee across the network, and an unsaved field
                        should leave no empty gap in the card. */}
                    {item.summary ? (
                      <p
                        className={cx(
                          'mt-4 line-clamp-3 text-body-md text-ink-soft',
                          'tablet:mt-5 tablet:line-clamp-4 tablet:text-body-lg',
                        )}
                      >
                        {item.summary}
                      </p>
                    ) : null}

                    {/* The card's foot: where the project goes, and how to
                        pass it on. `justify-between` rather than a margin, so
                        the share control sits on the column's right edge at
                        every width.

                        `mt-auto` is what puts this at the BOTTOM of the card,
                        per the sketch: the copy block is `flex-1`, so any
                        height the photograph has over the column's content
                        collects above this row rather than under it. `pt-8`
                        is the floor for when there is no slack to collect.

                        THE LABEL SITS WHERE THE SHARE CONTROL USED TO, on
                        request, and `justify-between` lands it on the column's
                        right edge.

                        🔴 IT GETS ITS OWN LINE ON A PHONE. Beside the button
                        there are about 140px left at 390px, and
                        "RESIDENTIAL PLOTS" needs about 145 — so it broke to
                        three ragged lines, which is worse than either
                        alternative. Stacked, it has the whole width and sets
                        on one.

                        VIEW PROJECT IS THE PRIMARY ACTION, in the espresso
                        variant rather than the gold one: this button stands on
                        the card's warm white, where solid gold goes heavy, and
                        espresso is the colour the card's own type is already
                        set in. The gold returns on hover. See the variant
                        table in Button.tsx.

                        The three tones read as one set: espresso button, pale
                        gold share, white card. Share is a step down in weight
                        rather than a second equal button, and its 44px circle
                        matches the pill's height exactly. */}
                    <div
                      className={cx(
                        'mt-5 flex flex-col items-start gap-3',
                        'tablet:mt-auto tablet:flex-row tablet:items-center',
                        'tablet:justify-between tablet:gap-4 tablet:pt-8',
                      )}
                    >
                      <LinkButton href={href} variant="ink" className="group">
                        View project
                        {/* One page carries several of these; the name is what
                            tells a screen-reader user which project this is. */}
                        <span className="visually-hidden">: {item.name}</span>
                        {/* The nudge is a TRANSFORM, not a widening gap: the
                            button's own `transition-colors` owns the transition
                            property, and a second `transition-*` class on the
                            same element would silently replace it — taking the
                            colour hover with it. */}
                        <Icon
                          name="arrowRight"
                          size={16}
                          className={cx(
                            'transition-transform duration-200 ease-out-soft',
                            'group-hover:translate-x-0.5 motion-reduce:transition-none',
                          )}
                        />
                      </LinkButton>

                      <p className="label-mono font-mono tablet:text-right">
                        {String(index + 1).padStart(2, '0')} / {count} · {item.category}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
