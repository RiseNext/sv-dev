'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/* =============================================================================
   FOOTER WORDMARK — the name at full bleed, drawn up out of the band on scroll.

   ─── WHY THE SIZE IS MEASURED AND NOT A `vw` CLAMP ────────────────────────
   The look being matched has the name spanning the full width, edge to edge,
   letters touching both sides. A `vw` font-size can only do that for ONE
   string length: the reference word is six characters, "SV Developers" is
   thirteen, and the value that fills the width for one overflows or underfills
   for the other by a wide margin.

   🔴 AND THE STRING IS NOT OURS. `site.name` is a CMS field — an admin can
   change it to "SV Developers Pvt Ltd" this afternoon. A tuned `vw` would
   silently overflow the viewport or leave a third of the band empty, with
   nothing in the repo to explain why. So the text is measured at a probe size
   and scaled to whatever the frame actually is, which is correct for any name
   at any width by construction.

   ─── WHY THIS IS NOT `<Reveal>` ───────────────────────────────────────────
   The shared component puts `data-reveal` on the element it OBSERVES, and here
   those must be two different nodes: the transform belongs to the <p>, which
   its wrapper clips — that clipping is what makes a translate a reveal — while
   the observation belongs to the wrapper, which never moves.

   Observing the <p> would be a live bug. IntersectionObserver intersects an
   element's box with its ancestors' clip rects before comparing against the
   root, so a <p> sitting a full 100% below an `overflow-hidden` parent reports
   a ratio of ZERO and keeps reporting zero however far you scroll — the only
   thing that would bring it into view is the reveal that never fires.

   Progressive enhancement is inherited rather than rebuilt: `data-reveal` is
   the same attribute the shared mechanism uses, so the <noscript> block in
   layout.tsx keeps the name visible when the script never runs and the
   `prefers-reduced-motion` rule in globals.css skips the travel. See
   `.wordmark-rise` there.
   ========================================================================== */

/* Measure at a round number and scale from it. Large enough that sub-pixel
   glyph rounding is noise rather than a visible error in the result. */
const PROBE_PX = 100;

export function FooterWordmark({ name }: { name: string }) {
  /* The clipping frame: the observed node, the measured width, and the only
     part of this that never transforms. */
  const frameRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const [shown, setShown] = useState(false);

  /* 🔴 GUARDS AGAINST A RESIZE FEEDBACK LOOP. The observer watches the frame,
     and resizing the type changes the frame's HEIGHT — which would notify the
     observer, which would fit again, forever. Only a change in WIDTH is a
     reason to re-fit. */
  const lastWidth = useRef(0);

  const fit = useCallback(() => {
    const frame = frameRef.current;
    const text = textRef.current;
    if (!frame || !text) return;

    const available = frame.clientWidth;
    if (!available) return;
    lastWidth.current = available;

    /* Two writes and one read. `scrollWidth` rather than `clientWidth` because
       the type is `whitespace-nowrap` and at the probe size it is usually wider
       than the frame — clientWidth would return the frame and every name would
       "fit" at the probe size. */
    text.style.fontSize = `${PROBE_PX}px`;
    const measured = text.scrollWidth;
    if (!measured) return;

    text.style.fontSize = `${(available / measured) * PROBE_PX}px`;
  }, []);

  useEffect(() => {
    fit();

    const frame = frameRef.current;
    if (!frame || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(() => {
      if (frame.clientWidth === lastWidth.current) return;
      fit();
    });
    observer.observe(frame);
    return () => observer.disconnect();
  }, [fit]);

  /* RE-FIT ONCE THE DISPLAY SERIF ARRIVES. The fonts are self-hosted with
     `display: swap`, so the first measurement can land against the fallback
     (Iowan Old Style / Georgia), whose advance widths differ from Instrument
     Serif's by enough to leave a visible gap at one edge. Without this the name
     is correctly fitted to the wrong font. */
  useEffect(() => {
    if (typeof document === 'undefined' || !('fonts' in document)) return;
    let cancelled = false;
    void document.fonts.ready.then(() => {
      if (!cancelled) fit();
    });
    return () => {
      cancelled = true;
    };
  }, [fit]);

  useEffect(() => {
    const node = frameRef.current;
    if (!node || shown) return;

    /* No observer (very old browser, or a test environment) means the reveal
       cannot be driven — show the name outright rather than ending the page on
       an empty band. */
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setShown(true);
        /* Fires once. Rising again on the way back up would pull the eye to the
           bottom of the page every time it is scrolled. */
        observer.disconnect();
      },
      /* A fifth of the band in view. Lower and the name starts moving while
         still below the fold, so a fast scroll to the bottom arrives after it
         has already finished — and this is the one motion on the page a visitor
         is guaranteed to be looking at when it happens. */
      { threshold: 0.2 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [shown]);

  return (
    /* Decorative: `site.name` is already announced by the Logo above, so the
       whole block is hidden from assistive tech rather than read twice. */
    <div ref={frameRef} className="overflow-hidden" aria-hidden="true">
      {/* NO horizontal padding, unlike the rest of the page: the letters are
          meant to touch both edges.

          `text-[17vw]` is only the PRE-MEASUREMENT value — close enough for
          "SV Developers" that the correction on mount is imperceptible rather
          than a jump from tiny to huge. `fit()` overwrites it with an inline
          font-size immediately.

          🔴 `leading-[1.02]` AND NO NEGATIVE MARGIN — the whole name has to be
          intact. This carried `leading-[0.8]` with `-mb-[0.14em]`, which
          deliberately clipped the descenders against the band edge. That is
          fine for a word like the reference's, whose every letter sits on the
          baseline; "SV Developers" has a `p`, and between the short line box
          and the negative margin its tail was being sliced off by the wrapper's
          `overflow-hidden`.

          1.02 rather than 1: a serif's ascent plus descent is about 1em, so a
          1em line box puts the descender exactly on the boundary and a pixel of
          rounding is enough to shave it. The extra 2% is the margin of safety,
          and it is em-based so it holds at every computed size. */}
      <p
        ref={textRef}
        data-reveal={shown ? 'shown' : 'pending'}
        className="wordmark-rise mt-4 select-none whitespace-nowrap text-center font-display text-[17vw] leading-[1.02] text-white/70"
      >
        {name}
      </p>
    </div>
  );
}
