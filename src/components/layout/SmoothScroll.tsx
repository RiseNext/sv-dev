'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

/* Smooth scrolling is most of why the reference site feels expensive: the page
   glides rather than jumps, so pinned sections and scroll-driven reveals read
   as one continuous movement.

   It is progressive enhancement and it is opt-out: with reduced motion set,
   Lenis never starts and the browser's native scrolling is left alone. It also
   stops while a dialog or the mobile sheet is open, so the page behind a modal
   cannot be scrolled by the wheel. */

export function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.6,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    const syncLock = () => {
      if (document.body.dataset.scrollLocked) lenis.stop();
      else lenis.start();
    };
    const observer = new MutationObserver(syncLock);
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-scroll-locked'] });
    syncLock();

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return null;
}
