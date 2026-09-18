/** Reveal stagger offset in ms: 60ms per item, capped at 8 items so the tail of
 *  a long list is never left waiting most of a second.
 *
 *  This lives outside Reveal.tsx on purpose. Reveal.tsx is a 'use client'
 *  module, and a plain function exported from one cannot be *called* by a
 *  server component — only rendered as a component or passed as a prop. */
export const stagger = (index: number): number => Math.min(index, 7) * 60;
