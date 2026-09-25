import { EnquiryPill } from '@/components/sections/EnquiryPill';
import { HeroVideoStage } from '@/components/sections/HeroVideoStage';
import { home } from '@/content/pages';
import { cx } from '@/lib/cx';
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

   THE HEADLINE'S COLOUR IS THE ONE THING THAT DIFFERS between the two states,
   and it is forced rather than chosen: the video pane dims the footage with a
   dark scrim so the footage still reads, and near-black type on darkened
   footage is unreadable at any scrim strength worth having. So it is
   `text-white` over video and `text-ink` on the off-white field, driven from
   one place below so the two cannot drift apart.

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
        className={cx(
          'max-w-[16ch] text-balance text-center text-heading-xl',
          /* See the header note: white over the dimmed footage, ink on the
             off-white field. The pane's dark scrim makes this a legibility
             requirement, not a preference. */
          hasVideo ? 'text-white' : 'text-ink',
        )}
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
        className="relative flex min-h-svh flex-col items-center justify-center px-gutter pb-8 pt-28"
        aria-labelledby="hero-title"
      >
        {type}
      </section>
    );
  }

  /* `pt-24 tablet:pt-28` (96/112px) clears the fixed bar (64/80px) with air to
     spare, so the pane's top edge and its rounded corners are never tucked
     under the nav. The pane is inside `container-page`, which is what gives it
     a margin from the viewport edge at every width — the "boundary" the video
     runs inside rather than bleeding to the screen edge. */
  return (
    <section className="px-gutter pb-12 pt-24 tablet:pb-16 tablet:pt-28" aria-labelledby="hero-title">
      <div className="container-page">
        <HeroVideoStage videos={videos ?? []}>{type}</HeroVideoStage>
      </div>
    </section>
  );
}
