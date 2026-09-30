import Image from 'next/image';
import type { CSSProperties } from 'react';
import { LinkButton } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ShareButton } from '@/components/ui/ShareButton';
import { ProjectPhotoFrame } from '@/components/sections/ProjectPhotoFrame';
import type { ImageRef, Project } from '@/types/content';
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

   From 1024px the card is a flex row, 60/40. The picture stretches to the
   row's height with a floor, so a long summary makes the CARD taller and the
   picture grows with it rather than leaving the copy hanging past the white.
   Below 1024px the same card is a column: picture, then copy.

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
 * ─── THE FALLBACK IS NOT COSMETIC ───────────────────────────────────────────
 * `width`/`height` cross the network, so neither is a guarantee: a record can
 * arrive with one missing, with a zero, or with a string. Anything that is not
 * two usable positive numbers falls back to square, because `aspect-ratio: 0`
 * or a `NaN` in `calc()` collapses the tab to nothing and the logo vanishes
 * entirely — far worse than a slightly wrong shape.
 */
const TAB_RATIO_MIN = 0.5; /* no narrower than 1:2  */
const TAB_RATIO_MAX = 3.5; /* no wider   than 3.5:1 */

function logoBox(logo: ImageRef | null | undefined): CSSProperties {
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
  const ratio = Math.min(Math.max(raw, TAB_RATIO_MIN), TAB_RATIO_MAX);

  return {
    aspectRatio: String(ratio),
    '--logo-r': String(ratio),
  } as CSSProperties;
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

          return (
            <li key={item.slug} className="mb-10 last:mb-0 tablet:mb-16">
              <div
                className={cx(
                  'relative rounded-band bg-surface p-2',
                  'shadow-[0_40px_90px_-45px_rgba(92,68,28,0.45)]',
                  'tablet:flex tablet:items-stretch',
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

                    🔴 HOW BIG IT MAY GET IS NOT A TASTE QUESTION — the copy
                    beside it sets a ceiling, and the ceiling is DIFFERENT at
                    each width. Read this before enlarging it again.

                    The copy is centred vertically in a card whose height comes
                    from the photograph, so its rows land at roughly:

                      label     123 → 139     short, left-aligned
                      name      151 → 187     short, left-aligned
                      locality  195 → 211     short, left-aligned
                      summary   227 → 367     RUNS THE FULL COLUMN WIDTH

                    A tab of height H, flush at the top, covers the rightmost H
                    pixels down to H. Two rules fall out:

                      1. H MUST STAY ABOVE 227. The summary uses the whole
                         column, so there is no width left to share with it.
                         This is the hard limit at every size.
                      2. Below 227 it may overlap the label, name and locality,
                         because those are short and left-aligned. What matters
                         is that the column keeps roughly 240px of usable width
                         for the longest label.

                    Rule 2 is what makes the ceiling width-dependent. From
                    1280px the column carries ~430px of text, so a 176px tab
                    still leaves ~296px — comfortable. Between 1024 and 1280 the
                    same column is only ~274px wide, and a tab that big would
                    leave ~130px, which the mono label cannot fit into. So there
                    the tab stays at 112px, just under the 123px where the label
                    begins, and overlaps nothing at all.

                    On a phone there is no constraint of this kind: the card is
                    a column, the tab is on the PHOTOGRAPH, and the copy starts
                    below it. It is sized for the picture, not the text.

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
                  style={logoBox(logo)}
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
                    /* The BOX the tab must fit inside, per width. Not the tab's
                       size — its bounds. See `THE TAB HUGS THE LOGO` above. */
                    '[--tab-h:6rem] [--tab-w:13rem]',
                    'tablet:[--tab-h:7rem] tablet:[--tab-w:14rem]',
                    'desktop:[--tab-h:11rem] desktop:[--tab-w:15rem]',
                    /* Width is whichever bound the logo hits first; height then
                       falls out of `aspect-ratio`. */
                    'w-[min(var(--tab-w),calc(var(--tab-h)*var(--logo-r)))]',
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
                  sizes="(min-width: 1400px) 840px, (min-width: 1024px) 60vw, 100vw"
                  className={cx(
                    'h-[min(42svh,20rem)] w-full rounded-4xl',
                    'tablet:h-auto tablet:min-h-[min(66svh,36rem)] tablet:w-[60%] tablet:shrink-0',
                  )}
                />

                {/* The copy stands on the card's own white — it carries no
                    background of its own, which would be white on white with a
                    seam where the two met. All it holds is the room around the
                    words: `pl-12` off the photograph's edge, `pr-10` off the
                    card's. */}
                <div
                  className={cx(
                    'flex flex-col px-4 pb-4 pt-5',
                    'tablet:w-[40%] tablet:justify-center tablet:py-10 tablet:pl-12 tablet:pr-10',
                  )}
                >
                  <p className="label-mono font-mono">
                    {String(index + 1).padStart(2, '0')} / {count} · {item.category}
                  </p>
                  <h3 className="mt-3 text-heading-md text-ink tablet:mt-5">{item.name}</h3>
                  <p className="mt-2 inline-flex items-center gap-1.5 font-mono text-body-xs text-ink-faint">
                    <Icon name="mapPin" size={13} />
                    {item.locality}
                  </p>

                  {/* Rendered only when present: a type is not a runtime
                      guarantee across the network, and an unsaved field should
                      leave no empty gap in the card. */}
                  {item.summary ? (
                    <p
                      className={cx(
                        'mt-4 line-clamp-3 text-body-md text-ink-soft',
                        'tablet:mt-6 tablet:line-clamp-5 tablet:text-body-lg',
                      )}
                    >
                      {item.summary}
                    </p>
                  ) : null}

                  {/* The card's foot: where the project goes, and how to pass
                      it on. `justify-between` rather than a margin, so the
                      share control sits on the card's right edge at every
                      width.

                      VIEW PROJECT IS THE PRIMARY ACTION, in the espresso
                      variant rather than the gold one: this button stands on
                      the card's warm white, where solid gold goes heavy, and
                      espresso is the colour the card's own type is already set
                      in. The gold returns on hover. See the variant table in
                      Button.tsx.

                      The three tones read as one set: espresso button, pale
                      gold share, white card. Share is a step down in weight
                      rather than a second equal button, and its 44px circle
                      matches the pill's height exactly. */}
                  <div className="mt-5 flex items-center justify-between gap-4 tablet:mt-8">
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

                    <ShareButton href={href} name={item.name} text={item.summary} />
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
