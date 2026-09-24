import { LinkButton } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Accordion } from '@/components/ui/Accordion';
import { Reveal } from '@/components/ui/Reveal';
import { ClosingCta } from '@/components/sections/ClosingCta';
import { Corridor } from '@/components/sections/Corridor';
import { Hero } from '@/components/sections/Hero';
import { ProjectCarousel } from '@/components/sections/ProjectCarousel';
import { ProjectRows } from '@/components/sections/ProjectRows';
import { Statement } from '@/components/sections/Statement';
import { Testimonials } from '@/components/sections/Testimonials';
import { WhyChooseUs } from '@/components/sections/WhyChooseUs';
import { contact, home } from '@/content/pages';
import { getFeaturedProjects, getProjects } from '@/lib/api/projects';
import { getSiteSettings } from '@/lib/api/site';
import { getFaqs, getTestimonials } from '@/lib/api/content';
/* 🔶 TEMPORARY — delete with the `??` below when the CMS ships `heroVideos`. */
import { previewHeroVideos } from '@/lib/dev/previewHeroVideos';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata() {
  const site = await getSiteSettings();
  return pageMetadata({
    title: 'Approved residential plots',
    description: site.description ?? site.tagline ?? site.name,
    path: '/',
    siteName: site.name,
  });
}

/* The home page is a summary with a route behind each section, not the whole
   site flattened into one scroll. Each block ends in a link to the page that
   carries the detail. */
export default async function HomePage() {
  /* No `getStatistics()` here any more: its only reader on this page was the
     "Built, walked and handed over" stats band, which was removed on request.
     /about still reads the same endpoint. */
  const [site, projects, featured, faqs, testimonials] = await Promise.all([
    getSiteSettings(),
    getProjects(),
    getFeaturedProjects(),
    getFaqs(),
    getTestimonials(),
  ]);

  /* The project rows under "Why SV Developers": the first three projects in
     admin order, each with its picture, name, place and summary and a link
     through to its page. Straight from the `getProjects()` call above; nothing
     extra is fetched. With no projects published the section renders nothing. */
  const rows = projects.slice(0, 3).map((p) => ({
    slug: p.slug,
    name: p.name,
    category: p.category,
    locality: p.locality,
    summary: p.summary,
    image: p.image,
  }));

  /* ⚠️ COUNT-COUPLED COPY, now derived. This read "Five layouts." — a hardcoded
     number that silently becomes a LIE the first time an admin publishes a
     sixth project, which is exactly when the CMS starts being useful. */
  const spelled =
    ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'][
      projects.length
    ] ?? String(projects.length);

  return (
    <>
      {/* `heroVideos` is absent from the API today, so the `??` falls through to
          the local preview folder (public/media/hero) — DEVELOPMENT ONLY, see
          lib/dev/previewHeroVideos.ts.

          🔶 THE `??` IS THE TEMPORARY HALF, not the prop. The CMS wins the
          moment it returns anything, so nothing here needs unpicking when the
          backend ships: delete `?? previewHeroVideos()` and its import. */}
      {/* The page follows the design template's order: hero (with the
          category strip), the "Why SV Developers" image-and-text rows, the dark
          "Why choose us" band, the project carousel, then the site's own
          Connectivity and FAQ, and the closing image-and-text ask. */}
      <Hero
        siteName={site.name}
        whatsapp={site.whatsapp}
        videos={site.heroVideos ?? previewHeroVideos()}
      />

      {/* ---- "Why SV Developers": the statement, then one row per project —
              picture left, text right, no scroll-driven motion. ---- */}
      <Statement
        id="why"
        label={home.intro.eyebrow}
        title={home.intro.title}
        titleAccent={home.intro.titleAccent}
        lead={home.intro.lead}
      />

      <ProjectRows items={rows} />

      <WhyChooseUs />

      {/* ---- Featured projects: a centred heading over the looping
              carousel, as in the template. ---- */}
      <section className="px-gutter pt-section" aria-labelledby="projects-title">
        <div className="container-page">
          <Reveal className="flex flex-col items-center text-center">
            <p className="eyebrow">Our projects</p>
            <h2 id="projects-title" className="mt-5 max-w-[22ch] text-heading-lg text-ink">
              {spelled} layout{projects.length === 1 ? '' : 's'}.{' '}
              <em>All of them walkable today.</em>
            </h2>
          </Reveal>

          {/* A looping carousel: 1 → 2 → … → last → 1. Count-agnostic — every
              project marked "featured" in the CMS is in the loop. Only the
              fields a card reads cross to the browser (ProjectCarousel is a
              client component; see contact/page.tsx for the same pattern). */}
          <Reveal className="mt-12">
            <ProjectCarousel
              projects={featured.map((p) => ({
                slug: p.slug,
                name: p.name,
                category: p.category,
                locality: p.locality,
                image: p.image,
                status: p.status,
                tagline: p.tagline,
              }))}
            />
          </Reveal>

          <div className="mt-6 flex justify-center">
            <LinkButton href="/projects" variant="ghost">
              All projects
              <Icon name="arrowRight" size={16} />
            </LinkButton>
          </div>
        </div>
      </section>

      <Corridor />

      <Testimonials items={testimonials} />

      {/* The "How buying works" Statement and its StepList were removed on
          request — the whole area, heading and steps together. Nothing linked
          to its `#how` anchor, so no navigation broke. */}

      <Statement id="faq" label="FAQ" title="The questions" titleAccent="we get asked first" />
      <div className="container-prose mt-14">
        <Accordion
          items={faqs.length ? faqs.map((f) => ({ q: f.question, a: f.answer })) : contact.faq}
        />
      </div>

      <ClosingCta />
    </>
  );
}
