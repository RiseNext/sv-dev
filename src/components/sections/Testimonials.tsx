import type { ReactNode } from 'react';
import { Reveal } from '@/components/ui/Reveal';
import type { Testimonial } from '@/types/content';
import { isPlaceholder } from '@/lib/href';

/* White card, serif quote, mono attribution — the reference's story card
   without the video, which we do not have.

   `isPlaceholder` still guards the attribution: a CMS row may legitimately be
   saved with a `[BRACKETED]` name while an admin is mid-edit, and that must
   render visibly inert rather than looking like a real person. */

/* ⚠️ Items arrive as a PROP and the CMS returns only PUBLISHED AND CONSENTED
   quotes. No invented review text exists anywhere in this repository, and none
   may be added here — see the tombstone in content/pages.ts. */
export function Testimonials({ items }: { items: readonly Testimonial[] }) {
  /* 🔶 TEMPORARY — the /testimonials endpoint is not live yet, so
     `getTestimonials()` falls back to [] and this section used to vanish
     entirely. `TestimonialsStub` stands in that gap so the reserved area is
     visible while the backend team wires the admin up.

     THE CMS WINS THE MOMENT IT RETURNS A ROW — the line below is the whole
     switchover, so nothing needs unpicking the day the endpoint ships. To
     retire the stub: restore `return null` here and delete `TestimonialsStub`
     with its widths constant. DO NOT put quote text in the stub. */
  if (!items.length) return <TestimonialsStub />;

  return (
    <Shell>
      {items.map((item, index) => (
        <Reveal as="li" key={item.id} delay={index * 80}>
          <Card
            body={<p className="text-heading-xs leading-relaxed text-ink">“{item.body}”</p>}
            caption={
              <>
                <span
                  className="block font-mono text-body-xs text-ink"
                  data-placeholder={isPlaceholder(item.name) ? '' : undefined}
                >
                  {item.name}
                </span>
                <span className="mt-1 block font-mono text-body-xs text-ink-faint">
                  {item.role}
                </span>
              </>
            }
          />
        </Reveal>
      ))}
    </Shell>
  );
}

/* The section shell and the card chrome are shared by the real list and the
   stub deliberately: two copies of this markup would drift the moment either
   is touched, and the stub's entire job is to show the real layout. */
function Shell({
  note,
  listHidden,
  children,
}: {
  note?: string;
  listHidden?: boolean;
  children: ReactNode;
}) {
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

        {/* The stub's cards carry no readable content, so they are hidden from
            assistive tech — the visible note above says the same thing in words
            and is read in their place. */}
        <ul
          aria-hidden={listHidden || undefined}
          className="mt-14 grid gap-4 mid:grid-cols-2 tablet:grid-cols-3"
        >
          {children}
        </ul>
      </div>
    </section>
  );
}

function Card({ body, caption }: { body: ReactNode; caption: ReactNode }) {
  return (
    <figure className="flex h-full flex-col rounded-media bg-surface p-6 tablet:p-8">
      <blockquote className="flex-1">{body}</blockquote>
      <figcaption className="mt-8 border-t border-line pt-5">{caption}</figcaption>
    </figure>
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

function TestimonialsStub() {
  return (
    <Shell note="Reviews are published from the admin." listHidden>
      {STUB_BARS.map((widths, index) => (
        <Reveal as="li" key={index} delay={index * 80}>
          <Card
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
        </Reveal>
      ))}
    </Shell>
  );
}
