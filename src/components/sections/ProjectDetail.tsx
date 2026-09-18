import Link from 'next/link';
import { LinkButton } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Lightbox } from '@/components/ui/Lightbox';
import { Frame } from '@/components/ui/Media';
import { Reveal } from '@/components/ui/Reveal';
import { ClosingCta } from '@/components/sections/ClosingCta';
import { FeatureList } from '@/components/sections/FeatureList';
import { site } from '@/content/site';
import { telHref } from '@/lib/href';
import type { Project } from '@/types/content';

/* One template for every project, driven entirely by the record in
   content/projects.ts. Optional fields drop their whole section rather than
   rendering an empty shell — a project with no location map simply does not
   have that band, which is what keeps the page honest when a brochure is thin. */

export function ProjectDetail({ project }: { project: Project }) {
  return (
    <>
      <header className="px-gutter pt-40 tablet:pt-52">
        <div className="container-page">
          <nav aria-label="Breadcrumb" className="flex justify-center">
            <ol className="flex items-center gap-2 font-mono text-body-xs text-ink-faint">
              <li>
                <Link href="/projects" className="hover:text-ink">
                  Projects
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-ink">
                {project.name}
              </li>
            </ol>
          </nav>

          <div className="mt-8 flex flex-col items-center text-center">
            <p className="label-mono font-mono">{project.category}</p>
            <h1 className="mt-5 max-w-[16ch] text-heading-xl text-ink">{project.name}</h1>
            {project.tagline ? (
              <p className="mt-6 max-w-[42ch] font-display text-heading-sm text-ink-soft">
                <em>{project.tagline}</em>
              </p>
            ) : null}

            <ul className="mt-8 flex flex-wrap justify-center gap-2">
              <li className="inline-flex items-center gap-2 rounded-pill bg-surface px-4 py-2 font-mono text-body-xs text-ink">
                <Icon name="mapPin" size={14} />
                {project.locality}
              </li>
              {project.area ? (
                <li className="inline-flex items-center gap-2 rounded-pill bg-surface px-4 py-2 font-mono text-body-xs text-ink">
                  <Icon name="ruler" size={14} />
                  {project.area}
                </li>
              ) : null}
              {project.roadDetails ? (
                <li className="inline-flex items-center gap-2 rounded-pill bg-surface px-4 py-2 font-mono text-body-xs text-ink">
                  <Icon name="road" size={14} />
                  {project.roadDetails}
                </li>
              ) : null}
              {project.developer ? (
                <li className="inline-flex items-center gap-2 rounded-pill bg-surface px-4 py-2 font-mono text-body-xs text-ink">
                  <Icon name="briefcase" size={14} />
                  {project.developer}
                </li>
              ) : null}
            </ul>

            <div className="mt-8 flex flex-wrap justify-center gap-2">
              <LinkButton href="/contact" size="lg">
                Book a site visit
              </LinkButton>
              <LinkButton href={telHref(site.phone)} variant="ghost" size="lg">
                <Icon name="phone" size={16} />
                Call about this project
              </LinkButton>
            </div>
          </div>

          <Reveal className="mt-14">
            <Frame
              image={project.image}
              ratio="aspect-[16/9]"
              priority
              sizes="(min-width: 1024px) 90vw, 100vw"
            />
          </Reveal>
        </div>
      </header>

      {/* ---- Summary ---- */}
      <section className="px-gutter pt-section-sm" aria-labelledby="summary-title">
        <Reveal className="container-prose text-center">
          <h2 id="summary-title" className="text-heading-md text-ink">
            {project.summary}
          </h2>
          <div className="mt-8 flex flex-col gap-5 text-left">
            {project.description.map((paragraph) => (
              <p key={paragraph} className="text-body-md text-ink-soft">
                {paragraph}
              </p>
            ))}
          </div>
        </Reveal>
      </section>

      {project.stats?.length ? (
        <section className="px-gutter pt-section-sm" aria-label="Project at a glance">
          <dl className="container-page grid gap-px overflow-hidden rounded-card bg-line tablet:grid-cols-4">
            {project.stats.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse gap-1 bg-bg p-6">
                <dt className="label-mono font-mono">{stat.label}</dt>
                <dd className="font-display text-heading-sm text-ink">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      <FeatureList
        id="highlights"
        label="Project highlights"
        title="What this layout"
        titleAccent="is made of"
        items={project.highlights}
      />

      {project.approvals?.length ? (
        <FeatureList
          id="approvals"
          label="Approvals and title"
          title="What we can show you"
          titleAccent="in writing"
          items={project.approvals}
        />
      ) : null}

      {project.amenities?.length ? (
        <FeatureList
          id="amenities"
          label="Amenities"
          title="Already built,"
          titleAccent="before the first sale"
          items={project.amenities}
        />
      ) : null}

      {project.layoutImage ? (
        <section className="px-gutter pt-section" aria-labelledby="layout-title">
          <div className="container-page">
            <Reveal className="mx-auto max-w-[44rem] text-center">
              <p className="label-mono font-mono">Layout plan</p>
              <h2 id="layout-title" className="mt-5 text-heading-lg text-ink">
                Every plot, <em>numbered.</em>
              </h2>
            </Reveal>
            <Reveal delay={100} className="mt-12">
              <Lightbox image={project.layoutImage} />
            </Reveal>
          </div>
        </section>
      ) : null}

      {project.locationHighlights?.length ? (
        <FeatureList
          id="surroundings"
          label="Location highlights"
          title="What is"
          titleAccent="around it"
          items={project.locationHighlights}
        />
      ) : null}

      {project.proximity?.length ? (
        <section className="px-gutter pt-section-sm" aria-label="Proximity">
          <ul className="container-page grid gap-px overflow-hidden rounded-card bg-line tablet:grid-cols-2">
            {project.proximity.map((item) => (
              <li key={item.place} className="flex items-baseline gap-4 bg-bg px-6 py-4">
                <span className="inline-flex w-24 shrink-0 items-center gap-2 font-mono text-body-xs text-ink">
                  <Icon name={item.icon} size={14} className="text-ink-faint" />
                  {item.measure}
                </span>
                <span className="text-body-sm text-ink-soft">{item.place}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {project.locationMap ? (
        <section className="px-gutter pt-section-sm" aria-label="Location map">
          <Reveal className="container-page">
            <Lightbox image={project.locationMap} />
          </Reveal>
        </section>
      ) : null}

      {project.gallery?.length ? (
        <section className="px-gutter pt-section" aria-label="Site photography">
          <ul className="container-page grid gap-4 tablet:grid-cols-3">
            {project.gallery.map((image, index) => (
              <Reveal as="li" key={image.src} delay={index * 60}>
                <Frame image={image} ratio="aspect-[4/3]" sizes="(min-width: 1024px) 33vw, 100vw" />
              </Reveal>
            ))}
          </ul>
        </section>
      ) : null}

      <ClosingCta
        title={project.cta?.title ?? `Walk ${project.name} this week`}
        body={
          project.cta?.description ??
          'Site visits run seven days a week. We will send directions and have someone meet you at the gate.'
        }
      />
    </>
  );
}
