import type { ReactNode } from 'react';
import { Reveal } from '@/components/ui/Reveal';
import { TestimonialCard, TestimonialCarousel } from '@/components/sections/TestimonialCarousel';
import type { Testimonial } from '@/types/content';

/* White card, serif quote, mono attribution — the reference's story card
   without the video, which we do not have.

   🔴 THE REAL LIST IS A RAIL NOW, NOT A GRID. It used to be
   `grid gap-4 mid:grid-cols-2 tablet:grid-cols-3`, which below 640px collapses
   to one column — so on a phone every review became a full-width block stacked
   under the last, and the section's height grew without limit as the client
   published more. It is now `TestimonialCarousel`, built in the "Our projects"
   carousel's idiom on request. See that file for why it is a separate
   component and for the exact mechanism by which THE DESKTOP LAYOUT IS
   UNCHANGED (three-or-fewer reviews render a static three-up row with no
   controls, pixel-for-pixel what `grid-cols-3 gap-4` produced).

   The STUB below is still a grid, deliberately — see the note on it.

   ⚠️ Items arrive as a PROP and the CMS returns only PUBLISHED AND CONSENTED
   quotes. No invented review text exists anywhere in this repository, and none
   may be added here — see the tombstone in content/pages.ts. */
export function Testimonials({ items }: { items: readonly Testimonial[] }) {
  /* 🔶 TEMPORARY — the /testimonials endpoint may legitimately return no rows
     (it did for months before the admin was wired up), and this section used to
     vanish entirely when it did. `TestimonialsStub` stands in that gap so the
     reserved area stays visible.

     THE CMS WINS THE MOMENT IT RETURNS A ROW — the line below is the whole
     switchover. To retire the stub: restore `return null` here and delete
     `TestimonialsStub` with its widths constant. DO NOT put quote text in the
     stub. */
  if (!items.length) return <TestimonialsStub />;

  return (
    <Shell>
      <TestimonialCarousel items={items} />
    </Shell>
  );
}

/* The section shell is shared by the real rail and the stub deliberately: two
   copies of the heading block would drift the moment either is touched.

   🔶 IT NO LONGER OWNS THE <ul>. It used to render the grid itself and take
   `<li>`s as children, which cannot work now that the real list is a carousel
   with its own list, its own controls and its own region role. Each caller
   brings its own list markup; the shell brings the heading, the measure and
   the spacing. */
function Shell({ note, children }: { note?: string; children: ReactNode }) {
  return (
    <section className="px-gutter pt-section" aria-labelledby="reviews-title">
      <div className="container-page">
        <Reveal className="mx-auto max-w-[44rem] text-center">
          <p className="label-mono font-mono">What buyers say</p>
          <h2 id="reviews-title" className="mt-5 text-heading-lg text-ink">
            Bought here, <em>and still here.</em>
          </h2>
          {note ? <p className="mt-5 font-mono text-body-xs text-ink-faint">{note}</p> : null}
        </Reveal>

        <Reveal className="mt-14">{children}</Reveal>
      </div>
    </section>
  );
}

/* 🔶 TEMPORARY — delete with the branch in Testimonials() above.

   Ragged bar widths, so the body reads as a skeleton waiting to be filled
   rather than as text that failed to load. There is no quote text here and
   none may be added: a plausible-looking sentence in this position is a
   fabricated review, which is the one thing this site does not ship. The
   bracketed attributions render struck through and half-opacity through the
   existing `[data-placeholder]` rule in globals.css. */
const STUB_BARS = [
  ['w-full', 'w-11/12', 'w-2/3'],
  ['w-full', 'w-4/5', 'w-3/5'],
  ['w-full', 'w-11/12', 'w-1/2'],
];

/* 🔴 THE STUB STAYS A GRID AND IS NOT PUT THROUGH THE CAROUSEL. Three
   content-free skeletons do not need navigating, and wrapping them in a region
   labelled "Buyer reviews" with arrows and dots would announce a carousel of
   reviews that do not exist. It also keeps the stub honest as a LAYOUT
   placeholder: one column on a phone is what an empty reserved area should
   look like. It renders the same `TestimonialCard` chrome as the real thing,
   so the card itself cannot drift between the two. */
function TestimonialsStub() {
  return (
    <Shell note="Reviews are published from the admin.">
      {/* The stub's cards carry no readable content, so the list is hidden from
          assistive tech — the visible note above says the same thing in words
          and is read in its place. */}
      <ul aria-hidden="true" className="grid gap-4 mid:grid-cols-2 tablet:grid-cols-3">
        {STUB_BARS.map((widths, index) => (
          <li key={index}>
            <TestimonialCard
              body={
                <div className="flex flex-col gap-3">
                  {widths.map((width) => (
                    <span key={width} className={`block h-3 rounded-full bg-line ${width}`} />
                  ))}
                </div>
              }
              caption={
                <>
                  <span className="block font-mono text-body-xs text-ink" data-placeholder="">
                    [CLIENT NAME]
                  </span>
                  <span
                    className="mt-1 block font-mono text-body-xs text-ink-faint"
                    data-placeholder=""
                  >
                    [LOCALITY · YEAR]
                  </span>
                </>
              }
            />
          </li>
        ))}
      </ul>
    </Shell>
  );
}
