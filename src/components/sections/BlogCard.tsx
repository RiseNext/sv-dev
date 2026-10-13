import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Icon, type IconName } from '@/components/ui/Icon';
import { YouTubeThumb } from '@/components/ui/YouTubeThumb';
import type { BlogPostCard } from '@/types/blog';
import { formatPostDate, hasPlayableVideo, postHref, youtubeId } from '@/lib/blog';
import { cx } from '@/lib/cx';

/* =============================================================================
   BLOG CARDS — the grid card and the feature card for the latest post.

   BOTH LIVE IN ONE FILE because they are the same card at two sizes: identical
   media resolution, identical meta line, identical destination rule, different
   proportions. Splitting them would mean exporting four internals to keep them
   in step, and the first time one is edited alone they stop matching.

   Deliberately in `ProjectCard`'s idiom — media on top, mono meta, name in the
   display serif, one arrow label, the whole card a single link. A visitor
   should not be able to tell that the blog was built months after the
   catalogue.

   🔴 THE WHOLE CARD IS ONE LINK, which is why the topic and the date are plain
   text rather than filter links: a card with three anchors in it gives a
   screen-reader user three stops for one destination.
   ========================================================================== */

/* ---------------------------------------------------------------------------
   THE MEDIA BOX

   Three states, and the third is the interesting one:

     cover          → next/image, the only path that gets resizing and AVIF
     video, no cover→ YouTube's thumbnail through a plain <img>, which may
                      itself fail and unmount — see YouTubeThumb
     neither        → NO BOX AT ALL. Returns null, and the card becomes a
                      type-only card.

   That last state is a design decision, not a gap. The site already renders a
   type-only hero when there is no footage, and the alternative here — an empty
   grey panel where a photograph should be — is the one thing a placeholder
   should never look like. An article with no cover reads as deliberately
   editorial; an article with a blank rectangle reads as broken.

   The sand panel underneath is what the play glyph sits on when the thumbnail
   fails, so it is on the CONTAINER rather than on the image.
   --------------------------------------------------------------------------- */
function PostMedia({
  post,
  ratio,
  sizes,
  priority,
}: {
  post: BlogPostCard;
  ratio: string;
  sizes: string;
  priority: boolean;
}) {
  const videoId = youtubeId(post.video?.youtubeUrl);
  const cover = post.cover?.src ? post.cover : null;

  /* 🔴 THE PLAY GLYPH NOW REQUIRES A VIDEO WE CAN ACTUALLY PLAY, and the
     inverted comment that used to sit here is the bug it describes: "a video
     whose URL would not parse still counts as a video for the glyph". It does
     not. A glyph is a PROMISE OF PLAYBACK, and the detail page mounts a player
     only when `youtubeId()` returns an id — so under the old rule a post with
     an empty or malformed `youtubeUrl` showed a play button on the index and
     then had nothing to play when you arrived.

     An article with only a cover, and an article with neither, both correctly
     show no glyph: this is false for both. See `hasPlayableVideo()`. */
  const isVideo = videoId !== null;
  if (!cover && !isVideo) return null;

  return (
    <div className={cx('relative overflow-hidden rounded-[1.125rem] bg-sand', ratio)}>
      {cover ? (
        <Image
          src={cover.src}
          alt={cover.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      ) : videoId ? (
        <YouTubeThumb
          videoId={videoId}
          className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.03]"
        />
      ) : null}

      {/* The play glyph is layered over BOTH routes: over the picture when
          there is one, over the bare sand panel when every thumbnail failed.
          It is the only thing distinguishing a video card from an article card
          at a glance, so it must not depend on an image loading. */}
      {isVideo ? (
        <span
          aria-hidden="true"
          className={cx(
            'absolute left-1/2 top-1/2 inline-flex size-14 -translate-x-1/2 -translate-y-1/2',
            'items-center justify-center rounded-full bg-surface/90 pl-0.5 text-ink backdrop-blur-[13px]',
            'transition-transform duration-300 ease-spring group-hover:scale-110',
            'motion-reduce:transition-none motion-reduce:group-hover:scale-100',
          )}
        >
          <Icon name="play" size={20} />
        </span>
      ) : null}

      {/* Admin-typed, so it is absent far more often than not — and a badge
          that is sometimes there is better than a badge that invents a value.
          Gold, in the slot ProjectCard puts its status chip.

          🔶 GATED ON `isVideo` TOO. A running time printed on a card with no
          playable video is the same false promise the play glyph was, in
          smaller type — and the one record that carries a duration without a
          parseable URL is exactly the half-finished row this change is for. */}
      {isVideo && post.video?.duration ? (
        <span className="absolute right-3 top-3 inline-flex items-center rounded-pill bg-gold px-3 py-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.06em] text-core-black">
          {post.video.duration}
        </span>
      ) : null}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   THE MONO META LINE — date, then topic.

   The date is a real `<time dateTime>`, so the machine-readable value is the
   ISO one and the human-readable one is ours. A post whose `publishedAt` will
   not parse drops the date rather than printing "Invalid Date" — see
   formatPostDate.
   --------------------------------------------------------------------------- */
function PostMeta({ post, className }: { post: BlogPostCard; className?: string }) {
  const date = formatPostDate(post.publishedAt);
  if (!date && !post.topic) return null;

  return (
    <p className={cx('flex flex-wrap items-center gap-x-2 font-mono text-body-xs text-ink-faint', className)}>
      {date ? <time dateTime={date.iso}>{date.label}</time> : null}
      {date && post.topic ? <span aria-hidden="true">·</span> : null}
      {post.topic ? <span>{post.topic}</span> : null}
    </p>
  );
}

/* ---------------------------------------------------------------------------
   THE ACTION LABEL

   🔴 THE "Read on <host>" BRANCH IS GONE, AND IT HAD TO BE. It read "Read on
   geeksforgeeks.org" beside an outbound icon — an accurate promise while the
   card linked straight out, and a LIE the moment it stopped. Every card now
   goes to `/blog/<slug>` on this site (see `postHref`), so a label naming a
   third-party host beside an arrow that does not go there is worse than no
   label: it is the card telling the visitor the wrong destination.

   WHERE THE HOST WENT, because it was genuinely useful: onto the outbound
   button INSIDE the article, which is the one control that really does leave
   the site. A link that leaves should still say where it goes — just at the
   point where it actually does.

   Two labels left, and both are now true of every card that carries them. The
   video one is gated on PLAYABILITY rather than on the presence of a `video`
   object, for the same reason the glyph above is.
   --------------------------------------------------------------------------- */
function postAction(post: BlogPostCard): { label: string; icon: IconName } {
  if (hasPlayableVideo(post)) return { label: 'Watch the video', icon: 'play' };
  return { label: 'Read the article', icon: 'arrowRight' };
}

function ActionLabel({ post, className }: { post: BlogPostCard; className?: string }) {
  const action = postAction(post);

  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 text-body-sm font-medium text-ink',
        'transition-[gap] duration-300 group-hover:gap-3',
        className,
      )}
    >
      {action.label}
      <Icon name={action.icon} size={16} />
    </span>
  );
}

/* ---------------------------------------------------------------------------
   THE SHELL

   🔴 ALWAYS A <Link>, NEVER AN <a>. The external branch that used to be here —
   `isExternal(href)` → `anchorProps()` → `target="_blank"` — is gone with the
   rule that produced it: `postHref()` returns an internal route for every post
   now, so `isExternal()` was dead code that could only ever answer false.

   What that branch bought is not lost. The outbound `[BRACKETED]`-safe
   treatment it provided still guards the external link where it now lives —
   the "Read the full article" button on the detail page, through `LinkButton`,
   which calls the same `anchorProps()` this used to.

   One consequence worth stating: every card is a real client-side navigation
   with prefetch again. The external ones were full page loads to another
   origin.
   --------------------------------------------------------------------------- */
function CardShell({
  post,
  className,
  children,
}: {
  post: BlogPostCard;
  className: string;
  children: ReactNode;
}) {
  return (
    <Link href={postHref(post)} className={className}>
      {children}
    </Link>
  );
}

const SHELL =
  'group flex flex-col rounded-media bg-surface p-2 transition-transform duration-300 ' +
  'hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0';

/* ---------------------------------------------------------------------------
   THE GRID CARD
   --------------------------------------------------------------------------- */
export function BlogCard({ post, priority = false }: { post: BlogPostCard; priority?: boolean }) {
  return (
    <CardShell post={post} className={cx(SHELL, 'h-full')}>
      <PostMedia
        post={post}
        ratio="aspect-[3/2]"
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        priority={priority}
      />

      {/* `pt-5` with media above it, `pt-4` without — a type-only card would
          otherwise open with a hole where the picture was.

          🔶 THE TEST MUST MATCH `PostMedia`'s OWN, which is why it is
          `hasPlayableVideo` and not `post.video`: a post with an unplayable
          video and no cover renders NO media box, and under the old test this
          padded for one that is not there. */}
      <div
        className={cx(
          'flex flex-1 flex-col px-3 pb-4',
          post.cover || hasPlayableVideo(post) ? 'pt-5' : 'pt-4',
        )}
      >
        <PostMeta post={post} />
        <h3 className="mt-2 text-heading-sm text-ink">{post.title}</h3>
        <p className="mt-2.5 text-body-sm text-ink-soft">{post.excerpt}</p>
        <ActionLabel post={post} className="mt-5" />
      </div>
    </CardShell>
  );
}

/* ---------------------------------------------------------------------------
   THE FEATURE CARD — the first post, full width.

   WHICH POST THIS IS comes from the ORDER the API returns, not from a
   `featured` flag. See the note in `lib/api/blog.ts`: one slot with two
   possible owners is how a "featured" post and a "latest" post end up
   disagreeing.

   It is a two-column split from 1024px and a stacked card below that — the
   same card, not a second component with its own rules. With no media it
   collapses to one column of type rather than leaving half the card empty.
   --------------------------------------------------------------------------- */
export function BlogFeatureCard({ post }: { post: BlogPostCard }) {
  /* Same test as `PostMedia`'s, for the same reason the grid card's padding
     uses it: this drives the two-column split, and splitting the card for a
     media box that `PostMedia` then declines to render leaves half of the
     feature card empty. */
  const hasMedia = Boolean(post.cover || hasPlayableVideo(post));

  return (
    <CardShell post={post} className={cx(SHELL, hasMedia && 'tablet:grid tablet:grid-cols-[1.15fr_1fr]')}>
      <PostMedia
        post={post}
        ratio="aspect-[16/9] tablet:aspect-auto tablet:h-full"
        sizes="(min-width: 1024px) 55vw, 100vw"
        /* 🔴 THE ONLY `priority` ON THE PAGE. This is the blog index's LCP
           candidate — the one image above the fold at every width — and
           priority on more than one image is the same as priority on none. */
        priority
      />

      <div
        className={cx(
          'flex flex-1 flex-col justify-center px-3 pb-5 pt-5',
          hasMedia && 'tablet:px-8 tablet:py-10',
        )}
      >
        <p className="label-mono font-mono">Latest</p>
        <h2 className="mt-4 max-w-[20ch] text-heading-md text-ink">{post.title}</h2>
        <PostMeta post={post} className="mt-3" />
        <p className="mt-4 max-w-[52ch] text-body-lg text-ink-soft">{post.excerpt}</p>
        {post.author ? (
          <p className="mt-3 font-mono text-body-xs text-ink-faint">By {post.author}</p>
        ) : null}
        <ActionLabel post={post} className="mt-6" />
      </div>
    </CardShell>
  );
}
