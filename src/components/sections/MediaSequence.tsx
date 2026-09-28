import Image from 'next/image';
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

                    ─── WIDE, NOT SQUARE ─────────────────────────────────────
                    A property logo is a wordmark far more often than a badge,
                    and a square starves it: 240px of width fits a name, where
                    the same area as a square fits about five letters. Roughly
                    18% of the card's width at every size, which is the
                    proportion the template draws. A square logo simply centres
                    in it — CONTAIN, never cover, because a logo cropped to fill
                    its box is a ruined logo.

                    ─── WHY IT SITS OVER THE EDGE ────────────────────────────
                    NOT decoration — it is what buys the size. The copy beside
                    it is vertically centred in a tall card, and a plate this
                    large sitting fully inside the corner would run under the
                    heading of any project with a long name. Lifted onto the
                    edge, about a third of it is above the card and the rest
                    lands in the empty band over the copy, clearing it at every
                    width. The overhang is a few pixels short of the page
                    gutter, so nothing can push a horizontal scrollbar, and it
                    is smaller than the gap between cards, so it cannot touch
                    the card above.

                    Solid `bg-surface`, not a tint: it crosses the card's edge,
                    so it stands on the page's cream, on the card's white and on
                    the photograph all at once, and it has to read the same on
                    all three. Above the photograph's own arrows (`z-10`) —
                    at phone widths the card is a column and this corner belongs
                    to the PHOTOGRAPH.

                    It is `aria-hidden` ONLY while empty: an empty plate is
                    nothing to announce, but a real logo is the project's mark
                    and carries the CMS's alt text. ---- */}
                <div
                  aria-hidden={item.logo?.src ? undefined : 'true'}
                  className={cx(
                    'absolute -right-2 -top-5 z-20 h-16 w-36 overflow-hidden rounded-2xl',
                    'border border-line-strong bg-surface',
                    'shadow-[0_12px_28px_-16px_rgba(92,68,28,0.65)]',
                    'tablet:-right-3 tablet:-top-7 tablet:h-22 tablet:w-52',
                    'desktop:-right-4 desktop:-top-8 desktop:h-24 desktop:w-60',
                  )}
                >
                  {item.logo?.src ? (
                    <Image
                      src={item.logo.src}
                      alt={item.logo.alt || `${item.name} logo`}
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
