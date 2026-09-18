import { LinkButton } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Accordion } from '@/components/ui/Accordion';
import { Reveal } from '@/components/ui/Reveal';
import { ClosingCta } from '@/components/sections/ClosingCta';
import { Corridor } from '@/components/sections/Corridor';
import { Hero } from '@/components/sections/Hero';
import { MediaSequence } from '@/components/sections/MediaSequence';
import { PinnedProof } from '@/components/sections/PinnedProof';
import { ProjectCard } from '@/components/sections/ProjectCard';
import { Statement } from '@/components/sections/Statement';
import { StepList } from '@/components/sections/StepList';
import { Testimonials } from '@/components/sections/Testimonials';
import { amenities, contact, home, media } from '@/content/pages';
import { featuredProjects, projects } from '@/content/projects';
import { site } from '@/content/site';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Approved residential plots',
  description: site.description,
  path: '/',
});

/* The home page is a summary with a route behind each section, not the whole
   site flattened into one scroll. Each block ends in a link to the page that
   carries the detail. */

/* Until site photography exists, the media sequence borrows each project's own
   card image so the section shows real (if placeholder) artwork rather than an
   empty frame. Swap these for infrastructure photography when it lands.

   The sequence carries no copy — the titles below are keys and alt-text
   subjects only. The specifications themselves are listed in full on
   /amenities, which is where they belong. */
const sequence = amenities.specifications.slice(0, 3).map((spec, index) => ({
  title: spec.title,
  image: projects[index]?.image ?? media.masterPlan,
}));

export default function HomePage() {
  return (
    <>
      <Hero />

      <Statement
        id="why"
        label={home.intro.eyebrow}
        title={home.intro.title}
        titleAccent={home.intro.titleAccent}
        lead={home.intro.lead}
      />

      <MediaSequence items={sequence} />

      <PinnedProof stats={home.hero.stats} tiles={projects.slice(0, 4).map((p) => p.image)} />

      {/* ---- Featured projects: read from content/projects.ts, the same
              records the catalogue and the detail pages use. ---- */}
      <section className="px-gutter pt-section" aria-labelledby="projects-title">
        <div className="container-page">
          <Reveal className="flex flex-col items-start gap-6 tablet:flex-row tablet:items-end tablet:justify-between">
            <div>
              <p className="label-mono font-mono">Our projects</p>
              <h2 id="projects-title" className="mt-5 max-w-[18ch] text-heading-lg text-ink">
                Five layouts. <em>All of them walkable today.</em>
              </h2>
            </div>
            <LinkButton href="/projects" variant="ghost">
              All projects
              <Icon name="arrowRight" size={16} />
            </LinkButton>
          </Reveal>

          <ul className="mt-14 grid gap-4 mid:grid-cols-2 tablet:grid-cols-3">
            {featuredProjects.map((project, index) => (
              <Reveal as="li" key={project.slug} delay={index * 80}>
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <Corridor />

      <Testimonials />

      <Statement
        id="how"
        label="How buying works"
        title="Five steps,"
        titleAccent="no surprises in any of them"
        lead="The same sequence on every project, whether you are buying one plot or four."
      />
      <StepList items={home.steps} />

      <Statement id="faq" label="FAQ" title="The questions" titleAccent="we get asked first" />
      <div className="container-prose mt-14">
        <Accordion items={contact.faq} />
      </div>

      <ClosingCta />
    </>
  );
}
