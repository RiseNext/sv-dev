import { LinkButton } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import { FaqSection } from '@/components/sections/FaqSection';
import { Hero } from '@/components/sections/Hero';
import { MediaSequence } from '@/components/sections/MediaSequence';
import { PinnedProof } from '@/components/sections/PinnedProof';
import { ProjectCarousel } from '@/components/sections/ProjectCarousel';
import { Testimonials } from '@/components/sections/Testimonials';
import { contact } from '@/content/pages';
import { getFeaturedProjects, getProject, getProjects } from '@/lib/api/projects';
import { getSiteSettings } from '@/lib/api/site';
import { getFaqs, getStatistics, getTestimonials } from '@/lib/api/content';
/* 🔶 TEMPORARY — delete with the `??` below when the CMS ships `heroVideos`. */
import { previewHeroVideos } from '@/lib/dev/previewHeroVideos';
import { pageMetadata } from '@/lib/seo';
import type { ImageRef, Project } from '@/types/content';

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

/* The media sequence is a plain column of the projects themselves: one white
   card each, picture on the left, name, place and summary on the right with a
   link to its page and a share control. It used to be a scroll-driven deck;
   that was removed on request — see the header of MediaSequence.tsx. */
export default async function HomePage() {
  /* `getStatistics()` is still called, and its slot in the destructure is
     deliberately empty. The proof band's four counters were removed on request
     (see PinnedProof.tsx), so nothing on this page renders them today — but the
     reader and its cache tag are part of the CMS seam, and the counters are the
     kind of thing that comes back. Dropping the call would quietly unwire it. */
  const [site, projects, featured, , faqs, testimonials] = await Promise.all([
    getSiteSettings(),
    getProjects(),
    getFeaturedProjects(),
    getStatistics(),
    getFaqs(),
    getTestimonials(),
  ]);

  /* THE DECK'S CARDS STEP THROUGH EACH PROJECT'S OWN PHOTOGRAPHS, and `/projects`
     carries one image per project — `gallery` is only on the single-project
     record. So each one is read here, through the SAME `getProject()` the
     detail route already uses: same endpoint, same cache tags (`projects`,
     `project:<slug>`), so a publish still revalidates this page through the
     existing webhook. Server-side at build/revalidate, never per visitor.

     `getProject` returns null for a slug the CMS 404s, which is why the card
     falls back to the list record rather than disappearing: the list is what
     decides which projects exist, and this read only enriches them. */
  const details = await Promise.all(projects.map((project) => getProject(project.slug)));

  /* 🔶 `logo` IS AHEAD OF THE CONTRACT, and read here rather than declared.
     `src/types/content.ts` has no logo on a project and is left alone on
     purpose, so the cast below is the whole of the coupling: it says "if the
     record happens to carry a logo, the card may have it", and nothing else in
     the codebase gains a field that the CMS does not emit.

     Today that is always `undefined` and the card's logo slot renders empty.
     When the backend adds `logo` to `/projects/{slug}` the cards fill on the
     next revalidation with no code change; the cast can then be dropped in
     favour of the real field. */
  type WithLogo = Project & { logo?: ImageRef };

  const cards = projects.map((project, i) => {
    const detail = details[i] as WithLogo | null;
    return { ...project, gallery: detail?.gallery, logo: detail?.logo };
  });

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
      <Hero
        siteName={site.name}
        whatsapp={site.whatsapp}
        videos={site.heroVideos ?? previewHeroVideos()}
      />

      {/* The "Why SV Developers" statement ("Finished infrastructure, not a
          promise of it") was removed on request — eyebrow, heading and
          sub-line together. Nothing linked to its `#why` anchor, so no
          navigation broke, and the deck below now follows the hero directly. */}

      {/* Every published project, in CMS order: a new one joins the deck
          without any change here. Each card's picture is that project's cover
          photograph plus its own gallery, stepped with arrows in place. */}
      <MediaSequence items={cards} />

      {/* Above the proof band on request. Renders a reserved, visibly inert
          placeholder until the CMS returns its first consented row — see the
          🔶 marker in Testimonials.tsx. */}
      <Testimonials items={testimonials} />

      <PinnedProof tiles={projects.slice(0, 4).map((p) => p.image)} />

      {/* ---- Featured projects: read from content/projects.ts, the same
              records the catalogue and the detail pages use. ---- */}
      <section className="px-gutter pt-section" aria-labelledby="projects-title">
        <div className="container-page">
          <Reveal className="flex flex-col items-start gap-6 tablet:flex-row tablet:items-end tablet:justify-between">
            <div>
              <p className="label-mono font-mono">Our projects</p>
              <h2 id="projects-title" className="mt-5 max-w-[18ch] text-heading-lg text-ink">
                {spelled} layout{projects.length === 1 ? '' : 's'}.{' '}
                <em>All of them walkable today.</em>
              </h2>
            </div>
            <LinkButton href="/projects" variant="ghost">
              All projects
              <Icon name="arrowRight" size={16} />
            </LinkButton>
          </Reveal>

          {/* A carousel that runs once and stops: 1 → 2 → … → last. Nothing is
              repeated. Count-agnostic — every project marked "featured" in the
              CMS is in it. Only the fields a card reads cross to the browser
              (ProjectCarousel is a client component). */}
          <Reveal className="mt-14">
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
        </div>
      </section>

      {/* The "Connectivity" section — eyebrow, "On the corridor, not beyond
          it", the corridor lead and the eight-row proximity list — was removed
          on request, and Corridor.tsx deleted with it. Its brochure location
          map had already gone from the section a step earlier. Nothing linked
          to its `#corridor-title` anchor, so no navigation broke.

          It leaves the whole `location` export in content/pages.ts unused, plus
          `media.locationMap` and /images/location-thumb.svg — see the 🔶 note
          there. They are kept rather than deleted on assumption: those eight
          drive times are the only place the corridor claims are written down. */}

      {/* The "How buying works" Statement and its StepList were removed on
          request — the whole area, heading and steps together. Nothing linked
          to its `#how` anchor, so no navigation broke. */}

      <FaqSection
        title="The questions"
        titleAccent="we get asked first"
        items={faqs.length ? faqs.map((f) => ({ q: f.question, a: f.answer })) : contact.faq}
      />

      {/* The closing "Come and walk the layout" band was removed on request —
          heading, sub-line and "Book a site visit" together, from every page
          that carried it. The action is still on the nav bar, on the hero
          enquiry pill and on /contact, so nothing became unreachable. */}

      <div className="pb-section-sm" />
    </>
  );
}
