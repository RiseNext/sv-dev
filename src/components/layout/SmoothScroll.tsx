'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

/* Smooth scrolling is most of why the reference site feels expensive: the page
   glides rather than jumps, so pinned sections and scroll-driven reveals read
   as one continuous movement.

   ─── POINTER-GATED, NOT GLOBAL ────────────────────────────────────────────
   Lenis runs on DESKTOP ONLY. It is a wheel-scrolling enhancement, and on a
   touch device it is a straight downgrade: the browser scrolls touch on the
   compositor thread, independently of JavaScript, which is why native mobile
   scrolling stays smooth even while the main thread is busy. Lenis replaces
   that with rAF-driven scrolling on the main thread, so every frame then waits
   on React, layout and paint — the page visibly lags on a phone.

   The gate is `(min-width: 64rem) and (pointer: fine)`: a real pointer on a
   large viewport. A tablet in landscape is wide enough to pass the width test
   but reports a coarse pointer, so it keeps native scrolling too.

   Still progressive enhancement and still opt-out: with reduced motion set,
   Lenis never starts. It also stops while a dialog or the mobile menu is open,
   so the page behind a modal cannot be scrolled by the wheel. */

const DESKTOP_POINTER = '(min-width: 64rem) and (pointer: fine)';

export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const desktop = window.matchMedia(DESKTOP_POINTER);

    /* Everything Lenis owns lives in here so crossing the breakpoint can tear
       it down completely and hand scrolling back to the browser. */
    let teardown: (() => void) | null = null;

    const start = () => {
      if (teardown) return;

      /* SENSITIVITY AND FEEL ARE TWO SEPARATE KNOBS, and only one was turned.
         `wheelMultiplier` is how far one wheel notch travels: 1.2 is 20% more
         ground per notch than the browser's own step (100px → 120px on a
         standard Windows detent), so the page no longer feels heavy on a long
         read. `duration` + `easing` are the glide — how that distance is
         covered — and are left exactly as they were, so it moves further per
         notch without moving any less smoothly. Past ~1.4 a single notch starts
         to skip whole blocks of copy; keep it modest. */
      const lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        wheelMultiplier: 1.2,
      });

      let frame = requestAnimationFrame(function raf(time: number) {
        lenis.raf(time);
        frame = requestAnimationFrame(raf);
      });

      const syncLock = () => {
        if (document.body.dataset.scrollLocked) lenis.stop();
        else lenis.start();
      };
      const observer = new MutationObserver(syncLock);
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['data-scroll-locked'],
      });
      syncLock();

      teardown = () => {
        observer.disconnect();
        cancelAnimationFrame(frame);
        lenis.destroy();
        teardown = null;
      };
    };

    const sync = () => {
      if (desktop.matches) start();
      else teardown?.();
    };

    sync();
    desktop.addEventListener('change', sync);

    return () => {
      desktop.removeEventListener('change', sync);
      teardown?.();
    };
  }, []);

  return null;
}
