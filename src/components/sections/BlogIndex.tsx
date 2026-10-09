'use client';

import { useState } from 'react';
import { BlogCard, BlogFeatureCard } from '@/components/sections/BlogCard';
import type { BlogPostCard, BlogPostKind } from '@/types/blog';
import { postKind } from '@/lib/blog';
import { cx } from '@/lib/cx';

/* =============================================================================
   THE BLOG INDEX — feature card, filter pills, grid.

   Client-side filtering in the catalogue's own idiom, for the catalogue's own
   reason: this is a list of a few dozen records at most, so a round trip per
   filter would be slower and would lose scroll position for nothing. The
   filter is NOT in the URL — `?kind=video` would be a shareable state nobody
   shares, and it would turn a static page into one with search params.

   🔴 THE PILLS APPEAR ONLY WHEN BOTH KINDS EXIST. A blog holding nothing but
   articles has no use for an "Articles" filter that selects everything and a
   "Videos" filter that selects nothing — the same rule `usedCategories()`
   applies to the project catalogue, where a category is never shown empty.
   A consequence worth knowing: because the pills require one of each, no
   filter can ever produce an empty grid.

   THE FEATURE CARD IS THE FIRST OF THE VISIBLE SET, not the first post
   outright. Filter to Videos and the feature becomes the latest video, which
   is the only behaviour that does not leave an article sitting at the top of a
   video-only page.
   ========================================================================== */

type Filter = 'all' | BlogPostKind;

const FILTERS: readonly { value: Filter; label: string }[] = [
  { value: 'all', label: 'Everything' },
  { value: 'article', label: 'Articles' },
  { value: 'video', label: 'Videos' },
];

/* The count line's suffix. Written out rather than interpolating the filter
   value, so it reads as English — "4 posts on video", not "4 posts in video". */
const SUFFIX: Record<Filter, string> = {
  all: '',
  article: ' in writing',
  video: ' on video',
};

const PILL =
  'inline-flex min-h-11 items-center rounded-pill px-4 text-body-sm font-medium transition-colors';

export function BlogIndex({ posts }: { posts: readonly BlogPostCard[] }) {
  const [active, setActive] = useState<Filter>('all');

  /* ---------- The empty state ----------
     This is what production renders TODAY, and it is not a placeholder: the
     endpoint does not exist yet, the data layer falls back to an empty list,
     and an honest "nothing yet" is the correct page. It is deliberately not a
     grid of skeleton cards — a loading shimmer for content that was never
     requested is a lie about what is happening. */
  if (posts.length === 0) {
    return (
      <section className="px-gutter pt-10" aria-label="Blog">
        <div className="container-page">
          <div className="mx-auto max-w-[44rem] rounded-media bg-surface px-6 py-14 text-center tablet:py-20">
            <p className="label-mono font-mono">Nothing published yet</p>
            <p className="mx-auto mt-5 max-w-[40ch] text-body-lg text-ink-soft">
              Articles and site videos will appear here as they go up. Until then, the project pages
              carry the plans, the approvals and the photographs.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const kinds = new Set(posts.map(postKind));
  const showFilter = kinds.has('article') && kinds.has('video');

  const visible = active === 'all' ? posts : posts.filter((post) => postKind(post) === active);
  const [feature, ...rest] = visible;

  return (
    <section className="px-gutter pt-10" aria-label="Blog">
      <div className="container-page">
        {showFilter ? (
          <div className="flex flex-wrap justify-center gap-1.5 rounded-card">
            {FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActive(filter.value)}
                aria-pressed={active === filter.value}
                className={cx(
                  PILL,
                  active === filter.value ? 'bg-gold text-core-black' : 'bg-surface text-ink',
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        ) : null}

        {feature ? (
          <div className={showFilter ? 'mt-10' : ''}>
            <BlogFeatureCard post={feature} />
          </div>
        ) : null}

        {rest.length > 0 ? (
          <ul className="mt-4 grid gap-4 mid:grid-cols-2 tablet:grid-cols-3">
            {rest.map((post) => (
              <li key={post.slug} className="flex">
                <BlogCard post={post} />
              </li>
            ))}
          </ul>
        ) : null}

        <p className="mt-8 text-center font-mono text-body-xs text-ink-faint">
          {visible.length} {visible.length === 1 ? 'post' : 'posts'}
          {SUFFIX[active]}
        </p>
      </div>
    </section>
  );
}
