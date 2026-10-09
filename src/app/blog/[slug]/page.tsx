import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { Frame } from '@/components/ui/Media';
import { LinkButton } from '@/components/ui/Button';
import { ShareButton } from '@/components/ui/ShareButton';
import { YouTubeEmbed } from '@/components/ui/YouTubeEmbed';
import { getBlogPost, getBlogPosts } from '@/lib/api/blog';
import { getSiteSettings } from '@/lib/api/site';
import { previewBlogPost } from '@/lib/dev/previewBlogPosts';
import { formatPostDate, youtubeId, youtubeWatchUrl } from '@/lib/blog';
import { pageMetadata } from '@/lib/seo';

/* =============================================================================
   /blog/[slug] — one post.

   ─── THE HEADER IS NOT `PageHero`, DELIBERATELY ───────────────────────────
   PageHero sets its h1 at `text-heading-xl` (50 → 104px) inside `max-w-[18ch]`,
   which is tuned for the three-word page titles it was written for — "Five
   layouts.", "Gallery". An article title is a sentence: at 87px inside 18
   characters, "What to check before you buy a plot" becomes four lines of
   display serif and pushes the article itself off the first screen. So this
   header uses the next step down and a wider measure. Everything else — the
   mono label above, the centred column, the rise animation — is PageHero's
   treatment, so the page still opens like every other page on the site.

   ─── A POST WITH AN `externalUrl` STILL GETS THIS PAGE ────────────────────
   Its card links straight out, so this route is normally unreachable for such
   a post — but it is NOT a 404. An admin who adds an external URL to a post
   that was already shared would otherwise break every link already sent, and
   a page carrying the title, the summary and one prominent button to the real
   article is a better landing than a dead end. The body, if there is one, is
   not rendered here: `externalUrl` means the writing lives elsewhere.
   ========================================================================== */

type Params = { slug: string };

/** Pre-renders every published post. `dynamicParams` stays at its default
 *  `true` — the natural ISR hook for a post published after the last build:
 *  it renders on first request and is cached from then on, so publishing does
 *  not need a redeploy. */
export async function generateStaticParams(): Promise<Params[]> {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const [fetched, site] = await Promise.all([getBlogPost(slug), getSiteSettings()]);
  const post = fetched ?? previewBlogPost(slug);
  if (!post) return {};

  const base = pageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    siteName: site.name,
    ...(post.cover
      ? {
          image: {
            url: post.cover.src,
            alt: post.cover.alt,
            width: post.cover.width,
            height: post.cover.height,
          },
        }
      : {}),
  });

  /* The two article-specific OpenGraph fields `pageMetadata()` does not model,
     because every other page on this site is a `website` and giving the shared
     helper a second shape would make every caller declare which one it is. */
  const date = formatPostDate(post.publishedAt);
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      type: 'article' as const,
      ...(date ? { publishedTime: date.iso } : {}),
      ...(post.author ? { authors: [post.author] } : {}),
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;

  /* 🔶 The dev preview again — see the note in `app/blog/page.tsx`. The CMS
     wins: `previewBlogPost()` is only consulted when the API has no such post,
     and it returns null outside development, so production 404s exactly as it
     will once the endpoint exists. */
  const post = (await getBlogPost(slug)) ?? previewBlogPost(slug);

  /* An unpublished or archived post 404s because the API returns 404 — never
     403, which would confirm the document exists. */
  if (!post) notFound();

  const date = formatPostDate(post.publishedAt);
  const videoId = post.video ? youtubeId(post.video.youtubeUrl) : null;
  const external = post.externalUrl?.trim();

  return (
    <article>
      <header className="px-gutter pb-4 pt-40 tablet:pt-56">
        <div className="container-page flex flex-col items-center text-center">
          <Link
            href="/blog"
            className="label-mono animate-rise inline-flex items-center gap-1.5 font-mono transition-colors hover:text-ink"
          >
            <Icon name="arrowRight" size={13} className="rotate-180" />
            All posts
          </Link>

          <h1
            className="mt-6 max-w-[26ch] text-heading-lg text-ink"
            style={{ animation: 'rise 700ms var(--ease-out-soft) 120ms backwards' }}
          >
            {post.title}
          </h1>

          {/* Date, topic and byline on one mono line — the same meta row the
              cards carry, so arriving from a card is continuous. */}
          <p
            className="mt-6 flex flex-wrap items-center justify-center gap-x-2 font-mono text-body-xs text-ink-faint"
            style={{ animation: 'rise 700ms var(--ease-out-soft) 200ms backwards' }}
          >
            {date ? <time dateTime={date.iso}>{date.label}</time> : null}
            {date && post.topic ? <span aria-hidden="true">·</span> : null}
            {post.topic ? <span>{post.topic}</span> : null}
            {post.author && (date || post.topic) ? <span aria-hidden="true">·</span> : null}
            {post.author ? <span>{post.author}</span> : null}
          </p>

          <p
            className="mt-7 max-w-[56ch] text-body-lg text-ink-soft"
            style={{ animation: 'rise 700ms var(--ease-out-soft) 280ms backwards' }}
          >
            {post.excerpt}
          </p>
        </div>
      </header>

      {/* ---------- The media ----------
          A video post gets the click-to-load player; an article with a cover
          gets the cover. A video post whose URL would not parse falls through
          to its cover if it has one, and to nothing if it does not — the post
          is still readable, which is the right failure. */}
      {videoId || post.cover ? (
        <div className="px-gutter pt-10">
          <div className="container-page mx-auto max-w-[68rem]">
            {videoId ? (
              <YouTubeEmbed
                videoId={videoId}
                title={post.title}
                cover={post.cover}
                duration={post.video?.duration}
              />
            ) : post.cover ? (
              <Frame image={post.cover} ratio="aspect-[16/9]" priority sizes="(min-width: 1024px) 68rem, 100vw" />
            ) : null}
          </div>
        </div>
      ) : null}

      {/* ---------- The article ----------
          One <p> per string, at the reading measure `container-prose` exists
          for. No rich-text renderer and no `dangerouslySetInnerHTML`: the
          contract is paragraphs, for the reasons set out on `BlogPost.body`. */}
      {!external && post.body?.length ? (
        <div className="px-gutter pt-12 tablet:pt-16">
          <div className="container-prose flex flex-col gap-6">
            {post.body.map((paragraph, index) => (
              <p key={index} className="text-body-lg text-ink-soft">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      ) : null}

      {/* ---------- Where to go next ----------
          The outbound button for an external post, "Watch on YouTube" for a
          video — for anyone who would rather watch it in the app, with their
          own subscriptions and playback speed — and the share control, which
          on a phone opens the share sheet. A plot or a layout gets forwarded to
          family before it is discussed, and so does an article about one. */}
      <div className="px-gutter pt-12 tablet:pt-16">
        <div className="container-prose flex flex-wrap items-center gap-3">
          {external ? (
            <LinkButton href={external} size="lg">
              Read the full article
              <Icon name="external" size={16} />
            </LinkButton>
          ) : null}

          {videoId ? (
            <LinkButton href={youtubeWatchUrl(videoId)} variant="ghost">
              Watch on YouTube
              <Icon name="external" size={15} />
            </LinkButton>
          ) : null}

          <ShareButton href={`/blog/${post.slug}`} name={post.title} text={post.excerpt} />

          <Link
            href="/blog"
            className="ml-auto inline-flex items-center gap-1.5 text-body-sm font-medium text-ink transition-[gap] duration-300 hover:gap-3"
          >
            All posts
            <Icon name="arrowRight" size={16} />
          </Link>
        </div>
      </div>

      <div className="pb-section-sm" />
    </article>
  );
}
