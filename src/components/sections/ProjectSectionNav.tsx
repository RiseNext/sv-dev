'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cx } from '@/lib/cx';

/* =============================================================================
   PROJECT SECTION RAIL — the project page's own contents bar.

   A project page is long: overview, highlights, the plan, amenities, approvals,
   location, gallery, enquiry. Before this the only way through it was the
   scrollbar. The rail is a floating capsule that sticks under the top bar and
   names every section the CMS record actually filled, so a buyer who came for
   the layout plan reaches it in one tap.

   ─── WHY A CENTRED CAPSULE, NOT A FULL-WIDTH BAR ──────────────────────────
   From 1024px the nav's medallion hangs 44px BELOW the bar (see the numbers in
   PillNav). A full-width strip pinned directly under the bar would run behind
   it. A capsule held to the middle of the page clears it at every width, and it
   matches the nav's own pill idiom rather than inventing a second one.

   ─── WITHOUT JAVASCRIPT ───────────────────────────────────────────────────
   Every item is a plain `<a href="#id">`, so the rail navigates with no script
   at all. The script adds one thing: which item is lit.

   ─── HOW "CURRENT" IS DECIDED ─────────────────────────────────────────────
   A scroll listener, not an IntersectionObserver. The question here is "which
   section have I scrolled INTO", and the answer is the last one whose top has
   passed under the rail — one deterministic answer at every scroll position,
   including at the very bottom of the page and for a section shorter than the
   viewport. An observer answers "which sections are visible", which is a
   different question and needs a tie-break in both of those cases.
   ========================================================================== */

export type ProjectSection = { id: string; label: string };

/** Where a section counts as arrived: the bar (88px at desktop) plus this rail
 *  plus a little air. Moves with the numbers recorded in PillNav. */
const CROSSED_PX = 190;

export function ProjectSectionNav({ sections }: { sections: readonly ProjectSection[] }) {
  const [current, setCurrent] = useState(sections[0]?.id ?? '');
  const railRef = useRef<HTMLElement>(null);

  const sync = useCallback(() => {
    let found = sections[0]?.id ?? '';
    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el && el.getBoundingClientRect().top <= CROSSED_PX) found = section.id;
    }
    setCurrent(found);
  }, [sections]);

  /* rAF-coalesced: a scroll event can fire many times per frame, and reading
     `getBoundingClientRect()` on every one of them forces a layout each time. */
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        sync();
      });
    };

    sync();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [sync]);

  /* On a phone the rail is wider than the screen and scrolls sideways, so the
     lit item has to be brought into view or it is lit off-screen.

     `scrollTo` ON THE RAIL, NOT `scrollIntoView` ON THE PILL: the rail is
     sticky and the page is mid-scroll, and `scrollIntoView` is free to scroll
     ANY ancestor scroller — including the document — to satisfy the request.
     Setting the rail's own `scrollLeft` cannot move the page. */
  useEffect(() => {
    const rail = railRef.current;
    const pill = rail?.querySelector<HTMLElement>('[data-current="true"]');
    if (!rail || !pill) return;
    rail.scrollTo({
      left: Math.max(0, pill.offsetLeft - (rail.clientWidth - pill.offsetWidth) / 2),
      behavior: 'smooth',
    });
  }, [current]);

  /* One section is not a table of contents. Hooks above run either way, so the
     order never changes. */
  if (sections.length < 2) return null;

  return (
    <div className="sticky top-16 z-30 flex justify-center px-gutter tablet:top-22">
      <nav
        ref={railRef}
        aria-label="On this page"
        /* `relative` is load-bearing, not decoration: the effect above reads
           `pill.offsetLeft`, which is measured from the nearest POSITIONED
           ancestor. Without it the offsets come from somewhere up the page and
           the rail scrolls to the wrong place. */
        className={cx(
          'relative flex max-w-full gap-1 overflow-x-auto overscroll-x-contain rounded-full',
          'border border-gold-line bg-surface/85 p-1.5 backdrop-blur-[13px]',
          'shadow-[0_12px_30px_-18px_rgba(122,90,34,0.55)]',
          '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        )}
      >
        {sections.map((section) => {
          const lit = section.id === current;
          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              data-current={lit}
              aria-current={lit ? 'true' : undefined}
              className={cx(
                'inline-flex min-h-9 shrink-0 items-center rounded-full px-3.5 text-body-sm font-medium',
                'transition-colors duration-200 motion-reduce:transition-none',
                lit ? 'bg-gold-mid text-ink' : 'text-ink-soft hover:bg-gold-soft/60',
              )}
            >
              {section.label}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
