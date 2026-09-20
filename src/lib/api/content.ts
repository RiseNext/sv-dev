import 'server-only';
import { cache } from 'react';
import type { Testimonial } from '@/types/content';
import { getJson } from './client';

/* =============================================================================
   TIER-2 CONTENT.

   Each uses `fallback: []` so an empty or unreachable collection renders an
   absent section rather than failing the build. That matches the site's own
   honesty rule: an empty section is better than an invented one.

   ⚠️ TESTIMONIALS arrive PUBLISHED AND CONSENTED only — the backend enforces
   that at the hook, at the access function AND at a database CHECK constraint.
   The three testimonials in the old static content were invented placeholders
   with bracketed names, so this endpoint correctly returns nothing until real,
   consented quotes exist.
   ========================================================================== */

export const getTestimonials = cache(async (): Promise<Testimonial[]> => {
  return getJson<Testimonial[]>('/testimonials', { tags: ['testimonials'], fallback: [] });
});

export type Faq = { id: string; question: string; answer: string };

export const getFaqs = cache(async (): Promise<Faq[]> => {
  return getJson<Faq[]>('/faqs', { tags: ['faqs'], fallback: [] });
});

/** `value` is TEXT and is AUTHORED — "250+", "100%", "Immediate". Nothing
 *  derives it from a row count: the database does not know how many plots have
 *  been handed over. */
export type Statistic = { id: string; label: string; value: string };

export const getStatistics = cache(async (): Promise<Statistic[]> => {
  return getJson<Statistic[]>('/statistics', { tags: ['statistics'], fallback: [] });
});
