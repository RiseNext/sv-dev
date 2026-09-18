import { LinkButton } from '@/components/ui/Button';
import { ClosingCta } from '@/components/sections/ClosingCta';
import { PageHero } from '@/components/sections/PageHero';
import { sortedPosts } from '@/content/blog';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Blog',
  description: 'Notes on buying land on the Warangal highway corridor from SV Developers.',
  path: '/blog',
});

/* content/blog.ts is deliberately empty: no posts were supplied, and inventing
   articles would be fabricating content. The index renders an honest empty
   state rather than filler, and starts working the moment a post is added. */

export default function BlogPage() {
  const posts = sortedPosts();

  return (
    <>
      <PageHero
        label="Blog"
        title="Notes from the corridor."
        titleAccent="Written when we have something to say."
        lead="Approvals, registration, and what to check before you buy land here."
      />

      {posts.length ? (
        <section className="px-gutter pt-16" aria-label="Articles">
          <ul className="container-page grid gap-4 tablet:grid-cols-3">
            {posts.map((post) => (
              <li key={post.slug} className="flex flex-col rounded-media bg-surface p-7">
                <time
                  dateTime={post.date}
                  className="font-mono text-body-xs uppercase tracking-[0.06em] text-ink-faint"
                >
                  {post.date}
                </time>
                <h2 className="mt-4 text-heading-sm text-ink">{post.title}</h2>
                <p className="mt-3 text-body-sm text-ink-soft">{post.excerpt}</p>
                {post.author ? (
                  <p className="mt-6 font-mono text-body-xs text-ink-faint">{post.author}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="px-gutter pt-16" aria-label="No articles yet">
          <div className="container-prose rounded-media bg-surface p-10 text-center tablet:p-14">
            <p className="font-mono text-body-xs uppercase tracking-[0.06em] text-ink-faint">
              Nothing published yet
            </p>
            <h2 className="mt-5 text-heading-sm text-ink">
              The first post is not written. <em>Rather that than filler.</em>
            </h2>
            <p className="mt-5 text-body-md text-ink-soft">
              Everything we would put here is already on the project pages: approvals, what is
              built, and what you get at booking.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              <LinkButton href="/projects">Browse the projects</LinkButton>
              <LinkButton href="/contact" variant="ghost">
                Ask us directly
              </LinkButton>
            </div>
          </div>
        </section>
      )}

      <ClosingCta />
    </>
  );
}
