/* =============================================================================
   BLOG

   Deliberately EMPTY. The client's navigation calls for a Blog section, but no
   posts were supplied, and inventing articles — or the readership/engagement
   figures that usually decorate a blog index — would be fabricating content.

   To publish a post, add an object to `posts` below. The index page picks it
   up, sorts by date and renders it; nothing else needs editing. `date` is an
   ISO yyyy-mm-dd string so sorting is a plain string comparison.
   ========================================================================== */

export type BlogPost = {
  slug: string;
  title: string;
  /** ISO yyyy-mm-dd. */
  date: string;
  /** One- or two-sentence standfirst shown on the index. */
  excerpt: string;
  author?: string;
};

export const posts: readonly BlogPost[] = [];

/** Newest first. */
export function sortedPosts(): readonly BlogPost[] {
  return [...posts].sort((a, b) => b.date.localeCompare(a.date));
}
