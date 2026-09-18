import { Reveal } from '@/components/ui/Reveal';
import { ClosingCta } from '@/components/sections/ClosingCta';
import { FeatureList } from '@/components/sections/FeatureList';
import { PageHero } from '@/components/sections/PageHero';
import { about, home } from '@/content/pages';
import { site } from '@/content/site';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'About us',
  description: about.hero.lead,
  path: '/about',
});

export default function AboutPage() {
  return (
    <>
      <PageHero
        label={about.hero.eyebrow}
        title="A plot business built"
        titleAccent="on finishing things"
        lead={about.hero.lead}
      />

      <section className="px-gutter pt-section-sm" aria-label="Track record">
        <dl className="container-page grid gap-px overflow-hidden rounded-card bg-line tablet:grid-cols-4">
          {home.hero.stats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse gap-1 bg-bg p-6 tablet:p-8">
              <dt className="label-mono font-mono">{stat.label}</dt>
              <dd className="font-display text-heading-md text-ink">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="px-gutter pt-section" aria-labelledby="story-title">
        <div className="container-page grid gap-10 tablet:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] tablet:gap-16">
          <Reveal className="tablet:sticky tablet:top-28 tablet:self-start">
            <p className="label-mono font-mono">{about.story.eyebrow}</p>
            <h2 id="story-title" className="mt-5 max-w-[14ch] text-heading-lg text-ink">
              We sell <em>what is already built</em>
            </h2>
          </Reveal>

          <Reveal delay={100} className="flex flex-col gap-6">
            {about.story.body.map((paragraph) => (
              <p key={paragraph} className="text-body-lg text-ink-soft">
                {paragraph}
              </p>
            ))}
          </Reveal>
        </div>
      </section>

      <FeatureList
        id="values"
        label="How we work"
        title="Four rules"
        titleAccent="we do not bend"
        items={about.values}
      />

      <FeatureList
        id="approvals"
        label={about.approvals.eyebrow}
        title="What we can show you"
        titleAccent="in writing"
        lead={about.approvals.lead}
        items={about.approvals.items}
      />

      <section className="px-gutter pt-section-sm">
        <Reveal className="container-prose rounded-card bg-surface p-8 text-center tablet:p-12">
          <p className="label-mono font-mono">Office</p>
          <address className="mt-5 font-display text-heading-sm not-italic text-ink">
            {site.address.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
          <p className="mt-5 text-body-sm text-ink-soft">{site.officeHours}</p>
        </Reveal>
      </section>

      <ClosingCta />
    </>
  );
}
