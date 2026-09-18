import { PageHero } from '@/components/layout/PageHero';
import { LinkButton } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { CtaBanner } from '@/components/sections/CtaBanner';
import { sortedPosts } from '@/content/blog';
import { pageMetadata } from '@/lib/seo';
import styles from './page.module.css';

export const metadata = pageMetadata({
  title: 'Blog',
  description: 'Updates and notes from the team.',
  path: '/blog',
});

const posts = sortedPosts();

/* The index renders whatever is in content/blog.ts. With nothing there it
   shows an honest empty state rather than placeholder articles — see the note
   at the top of that file. */
export default function BlogPage() {
  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Notes and updates"
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Blog' }]}
      />

      <Section aria-labelledby="posts-title">
        <SectionHeading eyebrow="Latest" title="Posts" id="posts-title" />

        {posts.length > 0 ? (
          <ul className={styles.list}>
            {posts.map((post) => (
              <Reveal as="li" key={post.slug} className={styles.item}>
                <time className={styles.date} dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </time>
                <h3 className={styles.title}>{post.title}</h3>
                <p className={styles.excerpt}>{post.excerpt}</p>
                {post.author ? <p className={styles.author}>{post.author}</p> : null}
              </Reveal>
            ))}
          </ul>
        ) : (
          <Reveal className={styles.empty}>
            <p className={styles.emptyLead}>No posts have been published yet.</p>
            <p className={styles.emptyBody}>
              In the meantime, the project pages carry the full detail on every layout — approvals,
              amenities, location and plot plans.
            </p>
            <LinkButton href="/projects">View our projects</LinkButton>
          </Reveal>
        )}
      </Section>

      <CtaBanner />
    </>
  );
}
