import { PageHero } from '@/components/layout/PageHero';
import { LinkButton } from '@/components/ui/Button';
import { FeatureGrid } from '@/components/ui/FeatureGrid';
import { IconList } from '@/components/ui/IconList';
import { Lightbox } from '@/components/ui/Lightbox';
import { ProximityList } from '@/components/ui/ProximityList';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { StatRow } from '@/components/ui/StatRow';
import { CtaBanner } from '@/components/sections/CtaBanner';
import { ProjectGrid } from '@/components/sections/ProjectGrid';
import { projects } from '@/content/projects';
import type { Project } from '@/types/content';
import styles from './ProjectDetail.module.css';

/* =============================================================================
   ONE template for every project. There are no per-project pages: the route
   /projects/[slug] resolves a record from content/projects.ts and hands it
   here, so publishing a new project means adding an object, nothing else.

   Every section below is CONDITIONAL on its data. A project without a layout
   plan renders no layout section — it does not render an empty frame or a
   placeholder, because a section that exists only to look complete is an
   invitation to invent content to fill it.
   ========================================================================== */

export function ProjectDetail({ project }: { project: Project }) {
  const others = projects.filter((item) => item.slug !== project.slug).slice(0, 3);

  /* Alternate default/surface tones down the page. Because sections are
     conditional, this counter is what keeps the banding regular regardless of
     which sections a given project happens to have. */
  let band = 0;
  const tone = () => (band++ % 2 === 1 ? ('surface' as const) : ('default' as const));

  return (
    <>
      <PageHero
        eyebrow={`${project.category} · ${project.locality}`}
        title={project.name}
        lead={project.tagline ?? project.summary}
        image={project.image}
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Projects', href: '/projects' },
          { label: project.name },
        ]}
      >
        {project.stats && project.stats.length > 0 ? <StatRow items={project.stats} /> : null}
      </PageHero>

      {/* ---------- Overview ------------------------------------------------ */}
      <Section tone={tone()} aria-labelledby="overview-title">
        <SectionHeading
          eyebrow="Overview"
          title={`About ${project.name}`}
          lead={project.description}
          id="overview-title"
          action={<LinkButton href="/contact">Enquire now</LinkButton>}
        />

        {project.developer ? (
          <Reveal className={styles.developerNote}>
            <p>
              Developed by <strong>{project.developer}</strong>.
            </p>
          </Reveal>
        ) : null}

        {project.highlights.length > 0 ? <FeatureGrid items={project.highlights} /> : null}
      </Section>

      {/* ---------- Approvals ----------------------------------------------- */}
      {project.approvals && project.approvals.length > 0 ? (
        <Section tone={tone()} aria-labelledby="approvals-title">
          <SectionHeading
            eyebrow="Approvals"
            title="Title and approvals"
            lead="As stated on the project brochure. Ask for copies at a site visit."
            id="approvals-title"
          />
          <IconList items={project.approvals} />
        </Section>
      ) : null}

      {/* ---------- Amenities / infrastructure ------------------------------ */}
      {project.amenities && project.amenities.length > 0 ? (
        <Section tone={tone()} aria-labelledby="amenities-title">
          <SectionHeading
            eyebrow="Infrastructure"
            title="Amenities and development"
            lead={project.roadDetails ? `Internal roads: ${project.roadDetails}.` : undefined}
            id="amenities-title"
          />
          <FeatureGrid items={project.amenities} />
        </Section>
      ) : null}

      {/* ---------- Location ------------------------------------------------ */}
      {(project.locationHighlights && project.locationHighlights.length > 0) ||
      (project.proximity && project.proximity.length > 0) ? (
        <Section tone={tone()} aria-labelledby="location-title">
          <SectionHeading
            eyebrow="Location"
            title="Location advantages"
            lead="Landmarks and connectivity named on the project brochure."
            id="location-title"
          />
          {/* Distances render only where the brochure printed one. */}
          {project.proximity && project.proximity.length > 0 ? (
            <ProximityList items={project.proximity} />
          ) : null}
          {project.locationHighlights && project.locationHighlights.length > 0 ? (
            <IconList items={project.locationHighlights} />
          ) : null}
        </Section>
      ) : null}

      {/* ---------- Location map -------------------------------------------- */}
      {project.locationMap ? (
        <Section tone={tone()} aria-labelledby="map-title">
          <SectionHeading
            eyebrow="Location map"
            title="Where the project is"
            lead="Tap the map to open it full screen."
            id="map-title"
          />
          {/* contain — a cropped map loses the landmarks that give it meaning. */}
          <Lightbox image={project.locationMap} fit="contain" />
        </Section>
      ) : null}

      {/* ---------- Layout plan --------------------------------------------- */}
      {project.layoutImage ? (
        <Section tone={tone()} aria-labelledby="layout-title">
          <SectionHeading
            eyebrow="Layout plan"
            title="Plot layout"
            lead="Tap the plan to open it full screen, then zoom to read the plot numbering."
            id="layout-title"
          />
          <Lightbox image={project.layoutImage} fit="contain" />
        </Section>
      ) : null}

      {/* ---------- Gallery -------------------------------------------------- */}
      {project.gallery && project.gallery.length > 0 ? (
        <Section tone={tone()} aria-labelledby="gallery-title">
          <SectionHeading eyebrow="Gallery" title={`${project.name} in pictures`} id="gallery-title" />
          <ul className={styles.gallery}>
            {project.gallery.map((image) => (
              <li key={image.src}>
                <Lightbox image={image} fit="cover" />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {/* ---------- Brochure pages ------------------------------------------- */}
      {project.brochureImages && project.brochureImages.length > 0 ? (
        <Section tone={tone()} aria-labelledby="brochure-title">
          <SectionHeading
            eyebrow="Brochure"
            title="Project brochure"
            lead="The pages below are reproduced from the project brochure."
            id="brochure-title"
          />
          <ul className={styles.gallery}>
            {project.brochureImages.map((image) => (
              <li key={image.src}>
                <Lightbox image={image} fit="contain" />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {/* ---------- Other projects ------------------------------------------- */}
      {others.length > 0 ? (
        <Section tone={tone()} aria-labelledby="others-title">
          <SectionHeading eyebrow="More from us" title="Other projects" id="others-title" />
          <ProjectGrid items={others} />
        </Section>
      ) : null}

      {/* ---------- CTA ------------------------------------------------------ */}
      {project.cta ? (
        <Section tone="darkAlt" size="sm" aria-labelledby="project-cta-title">
          <Reveal className={styles.cta}>
            <div>
              <h2 id="project-cta-title" className={styles.ctaTitle}>
                {project.cta.title}
              </h2>
              <p className={styles.ctaBody}>{project.cta.description}</p>
            </div>
            <div className={styles.ctaActions}>
              <LinkButton href="/contact" variant="accent" size="lg">
                Enquire now
              </LinkButton>
              <LinkButton href="/contact" variant="outline" size="lg">
                Request a site visit
              </LinkButton>
            </div>
          </Reveal>
        </Section>
      ) : (
        <CtaBanner />
      )}
    </>
  );
}
