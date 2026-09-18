import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import { stagger } from '@/lib/stagger';
import { cx } from '@/lib/cx';
import type { Project } from '@/types/content';
import styles from './ProjectGrid.module.css';

function statusClass(status: Project['status']) {
  if (status === 'Open for booking') return styles.statusOpen;
  if (status === 'Coming soon') return styles.statusSoon;
  return undefined;
}

export function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  /* The card's key highlight: the approval line and the total extent, but only
     where the brochure supplied them. Nothing is substituted when it did not. */
  const approval = project.approvals?.[0]?.title;
  const meta = [
    approval ? { icon: 'shield' as const, text: approval } : null,
    project.area ? { icon: 'ruler' as const, text: project.area } : null,
  ].filter((item) => item !== null);

  return (
    <Reveal as="li" className={styles.card} delay={stagger(index)}>
      <div className={styles.media}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.image.src}
          alt={project.image.alt}
          width={project.image.width}
          height={project.image.height}
          loading="lazy"
          decoding="async"
        />
        {/* The badge carries the CATEGORY, so the card says what kind of
            project this is at a glance. Status is a separate, optional pill
            because no brochure states one. */}
        <span className={styles.category}>{project.category}</span>
        {project.status ? (
          <span className={cx(styles.status, statusClass(project.status))}>{project.status}</span>
        ) : null}
      </div>

      <div className={styles.body}>
        <span className={styles.locality}>
          <Icon name="mapPin" size={14} />
          {project.locality}
        </span>

        <h3 className={styles.title}>
          {/* Stretched link: ::after covers the whole card, so the real hit
              area is the card, not this 28px-tall text box. data-stretched-link
              tells the target-size audit to measure the card instead. */}
          <Link
            href={`/projects/${project.slug}`}
            className={styles.link}
            data-stretched-link=""
          >
            {project.name}
          </Link>
        </h3>

        {/* Shown only for a project built by someone else, so the catalogue
            never implies authorship it cannot support. */}
        {project.developer ? (
          <span className={styles.developer}>By {project.developer}</span>
        ) : null}

        <p className={styles.summary}>{project.summary}</p>

        {meta.length > 0 ? (
          <ul className={styles.meta}>
            {meta.map((item) => (
              <li key={item.text}>
                <Icon name={item.icon} size={14} />
                {item.text}
              </li>
            ))}
          </ul>
        ) : null}

        <span className={styles.more}>
          View project
          <Icon name="arrowRight" size={16} />
        </span>
      </div>
    </Reveal>
  );
}

export function ProjectGrid({ items }: { items: readonly Project[] }) {
  return (
    <ul className={styles.grid}>
      {items.map((project, index) => (
        <ProjectCard key={project.slug} project={project} index={index} />
      ))}
    </ul>
  );
}
