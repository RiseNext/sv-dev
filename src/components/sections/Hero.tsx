import { EnquiryPill } from '@/components/sections/EnquiryPill';
import { HeroVideoStage } from '@/components/sections/HeroVideoStage';
import { home } from '@/content/pages';
import type { HeroMediaItem } from '@/types/heroMedia';

/* =============================================================================
   HERO

   Two states, decided entirely by how many media items the CMS returns:

     none  → type on the off-white field. Not a broken state: the reference site
             runs the same treatment on its company page, and it is what the
             hero renders when an administrator has configured no media at all.
     one +  → the same type, set on a bordered media pane (HeroVideoStage,
             which also handles the crossfade when there is more than one).

   🔴 THE PROP IS NOW `items`, NOT `videos`, AND IT IS A UNION. A slide may be a
   photograph, an uploaded MP4 or a YouTube link — see `src/types/heroMedia.ts`.
   The page resolves which list to use with `heroItems()`, which prefers the new
   `heroMedia` and falls back to the legacy `heroVideos` that is still serving
   production today. Nothing here knows or cares which one it got.

   🔴 THE OLD `media` PROP IS GONE, and deliberately. It took a single
   `{ src, poster }` that nothing ever passed. Two mechanisms for one job, one
   of them never used, was worse than either.

   🔴 THE VISIBLE HEADLINE AND THE GLASS PANEL AROUND IT ARE GONE, REMOVED ON
   REQUEST (13 Oct 2026). What stood here was `hero-glass` — a frosted white
   card holding "Land you can build on the week you buy it." — and it covered
   the middle of the footage on every slide. The hero is now the MEDIA plus the
   enquiry capture, and nothing else is laid over the picture.

   🔴 THE <h1> ITSELF SURVIVES, `visually-hidden`. That is not a loophole, it
   is the reason the removal is safe: this is the home page's ONLY level-one
   heading, and deleting the element outright would leave the site's most
   important route with no document title in the accessibility tree and no h1
   for a crawler. Hidden, it keeps both and paints nothing. The copy is still
   `home.hero.title` — no new string was invented to fill the slot.

   The EnquiryPill needs no panel behind it: it is already a light frosted pill
   with dark type inside it, which reads correctly on both states — and with
   the card gone it is now the brightest object in the frame, which is exactly
   where the CTA belongs. Its own `bg-surface/90` + `backdrop-blur-[13px]` is
   what carries its legibility over a bright image or a dark clip, so that is
   the knob to turn if a future upload ever fights it.

   ─── WHAT IS DELIBERATELY NOT HERE ────────────────────────────────────────
   The eyebrow, the supporting claim line, the rotating Ticker and the locality
   strip were all removed on request before the headline was. The hero is the
   footage and the enquiry capture.
   ========================================================================== */

export function Hero({
  siteName,
  whatsapp,
  items,
}: {
  /* Threaded down from the page, because EnquiryPill is a 'use client' module
     and cannot read the CMS itself. */
  siteName: string;
  whatsapp: string;
  /** From `heroItems()` — the resolved hero list, whichever CMS field supplied
   *  it. Absent or empty → the type-only state. */
  items?: readonly HeroMediaItem[];
}) {
  const { title, titleAccent } = home.hero;

  /* Absent and empty are treated identically, so the backend can omit the
     field, return `[]`, or return rows — all three are valid and none of them
     needs a frontend change. */
  const hasMedia = (items?.length ?? 0) > 0;

  /* One definition of the type block, used in both states. The alternative —
     duplicating it into each branch — is how the two states quietly drift
     apart. */
  const type = (
    <>
      {/* 🔴 HIDDEN, NOT DELETED — see the header note. `visually-hidden` keeps
          the element in the DOM and in the accessibility tree while painting
          nothing, so `aria-labelledby="hero-title"` on the section below still
          resolves and the page keeps its one h1. `display: none` would break
          both. */}
      <h1 id="hero-title" className="visually-hidden">
        {title} {titleAccent}
      </h1>

      {/* No `mt-*` and no delay: with the headline gone the pill LEADS the
          fold, so it leads the rise stagger at 0ms. The 160ms it used to wait
          was time spent following a headline that is no longer drawn, and a
          delay tuned for second place reads as a stall in first. */}
      <div
        className="w-full"
        style={{ animation: 'rise 700ms var(--ease-out-soft) backwards' }}
      >
        <EnquiryPill siteName={siteName} whatsapp={whatsapp} />
      </div>
    </>
  );

  if (!hasMedia) {
    return (
      <section
        className="relative flex min-h-svh flex-col items-center justify-center px-gutter pb-8 pt-28 tablet:pt-36"
        aria-labelledby="hero-title"
      >
        {type}
      </section>
    );
  }

  /* THE MEDIA ARRIVES FULL SCREEN AND SETTLES INTO ITS PANE AS YOU SCROLL.
     The section is one screen tall plus a run to shrink over; the child inside
     it is `position: sticky`, so the footage is held against the viewport for
     that run and then releases and scrolls away like any other section.

     There is no padding here any more: the gutter, the nav clearance and the
     pane's own width, height, border and radius are all interpolated from
     `--hero-p` in globals.css (see "THE HERO'S SCROLL-SHRINK"), which
     HeroVideoStage drives from the scroll position. `data-hero-scroll` is what
     it looks up to find this element — a class would do, but an attribute says
     it is a handle for script rather than styling. */
  return (
    <section className="hero-scroll" data-hero-scroll aria-labelledby="hero-title">
      <div className="hero-sticky">
        {/* 🔴 NO WRAPPER AROUND THE TYPE ANY MORE. `hero-glass` — the frosted
            white card — was removed on request along with the headline inside
            it. The pill is handed to the stage bare, carrying its own frosted
            surface, so the footage is unobstructed from edge to edge.

            `hero-glass` itself is KEPT in globals.css rather than deleted: it
            is a self-contained rule with no other caller, and the panel is the
            kind of thing that comes back. It costs nothing while unused, and
            its `:focus-visible` override goes with it when it does. */}
        <HeroVideoStage items={items ?? []}>{type}</HeroVideoStage>
      </div>
    </section>
  );
}
