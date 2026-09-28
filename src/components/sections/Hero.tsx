import { EnquiryPill } from '@/components/sections/EnquiryPill';
import { HeroVideoStage } from '@/components/sections/HeroVideoStage';
import { home } from '@/content/pages';
import type { VideoRef } from '@/types/content';

/* =============================================================================
   HERO

   Two states, decided entirely by how many videos the CMS returns:

     none  → type on the off-white field. Not a broken state: the reference site
             runs the same treatment on its company page, and it is what the
             hero renders until the backend ships `site-settings.heroVideos`.
     one +  → the same type, set on a bordered video pane (HeroVideoStage,
             which also handles the crossfade when there is more than one).

   🔴 THE OLD `media` PROP IS GONE, and deliberately. It took a single
   `{ src, poster }` that nothing ever passed. `heroVideos` supersedes it —
   two mechanisms for one job, one of them never used, was worse than either.

   THE TYPE IS NOW IDENTICAL IN BOTH STATES, which it was not before. Over
   video the headline and the pill sit on a FROSTED WHITE PANEL (`hero-glass`,
   added on request — see globals.css), so the headline is `text-ink` there
   just as it is on the off-white field. It used to be `text-white` over a dark
   scrim; the scrim is gone, the panel carries the type instead, and with it
   went the text shadow that briefly stood in for the scrim.

   Legibility is therefore a property of the PANEL, not of the type. If a clip
   ever leaves the headline hard to read, raise the panel's fill in
   globals.css — the whole point of the panel is that a change there cannot be
   undone by the next upload.

   The EnquiryPill needs no such switch: it is already a light frosted pill
   with dark type inside it, which reads correctly on both — and over video it
   becomes the brightest object in the frame, which is where the CTA belongs.

   ─── WHAT IS DELIBERATELY NOT HERE ────────────────────────────────────────
   The eyebrow, the supporting claim line, the rotating Ticker and the locality
   strip were all removed on request. The hero is the headline and the enquiry
   capture, so those two carry the whole fold and the rise stagger is a
   two-step rather than a five-step.
   ========================================================================== */

export function Hero({
  siteName,
  whatsapp,
  videos,
}: {
  /* Threaded down from the page, because EnquiryPill is a 'use client' module
     and cannot read the CMS itself. */
  siteName: string;
  whatsapp: string;
  /** From `site-settings.heroVideos`. Absent or empty → the type-only state. */
  videos?: readonly VideoRef[];
}) {
  const { title, titleAccent } = home.hero;

  /* Absent and empty are treated identically, so the backend can omit the
     field, return `[]`, or return rows — all three are valid and none of them
     needs a frontend change. */
  const hasVideo = (videos?.length ?? 0) > 0;

  /* One definition of the type block, used in both states. The alternative —
     duplicating the headline into each branch — is how the two states quietly
     drift apart. */
  const type = (
    <>
      {/* No `mt-*`: the headline leads the fold now that the eyebrow above it
          is gone, and it leads the rise stagger at 0ms for the same reason. */}
      <h1
        id="hero-title"
        /* `heading-lg` (36 → 70px), not `heading-xl` (50 → 104px): stepped
           down on request. The glass panel behind it did NOT change size with
           it, so the smaller type is what buys the headline its margins rather
           than filling the panel edge to edge. Both hero states take it — one
           size, per the note above, so the two cannot drift apart. */
        className="max-w-[16ch] text-balance text-center text-heading-lg text-ink"
        style={{ animation: 'rise 700ms var(--ease-out-soft) backwards' }}
      >
        {title} <em>{titleAccent}</em>
      </h1>

      {/* 160ms, not 380ms: it follows the headline directly now that the claim
          line and Ticker that used to sit between them are gone. A delay tuned
          for fifth place reads as a stall in second. */}
      <div
        className="mt-10 w-full tablet:mt-12"
        style={{ animation: 'rise 700ms var(--ease-out-soft) 160ms backwards' }}
      >
        <EnquiryPill siteName={siteName} whatsapp={whatsapp} />
      </div>
    </>
  );

  if (!hasVideo) {
    return (
      <section
        className="relative flex min-h-svh flex-col items-center justify-center px-gutter pb-8 pt-28 tablet:pt-36"
        aria-labelledby="hero-title"
      >
        {type}
      </section>
    );
  }

  /* THE VIDEO ARRIVES FULL SCREEN AND SETTLES INTO ITS PANE AS YOU SCROLL.
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
        <HeroVideoStage videos={videos ?? []}>
          {/* THE GLASS PANEL, over video only. On the type-only state the page
              is already off-white, so a white panel on it would be a card with
              nothing to separate itself from — which is why this wraps the
              type here rather than inside `type` itself.

              A FIXED CEILING, not a shrink-wrap: the headline is balanced to
              16ch and the pill is capped at 30rem, so a panel sized to its
              content would change width every time the copy changed.

              🔶 THE PADDING IS EVEN ON ALL FOUR SIDES, and that is the whole
              rule. It was `px-6 py-10 / mid:px-10 mid:py-12 / tablet:px-14`,
              which left the vertical padding larger than the horizontal on a
              phone and SMALLER than it from 1024px — the panel's proportions
              inverted halfway up the breakpoints, which is what read as
              uneven. One value per breakpoint cannot drift that way. */}
          <div className="hero-glass w-full max-w-[42rem] rounded-card p-5 mid:p-8 tablet:rounded-media tablet:p-10">
            {type}
          </div>
        </HeroVideoStage>
      </div>
    </section>
  );
}
