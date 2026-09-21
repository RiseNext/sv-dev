import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import type { Project } from '@/types/content';
import { cx } from '@/lib/cx';

/* Media on top with a mono category label over it, name in the display serif,
   tagline in sans. The whole card is one link — a card with three separate
   links in it gives a screen-reader user three stops for one destination. */

/* The prop is the CARD SHAPE, not the whole record — these are exactly the
   fields this component reads. A full `Project` still satisfies it, so nothing
   that passed before stops passing; the list endpoint can now feed it directly
   without over-fetching every paragraph and every feature array. */
export type ProjectCardData = Pick<
  Project,
  'slug' | 'name' | 'category' | 'locality' | 'image'
> &
  Partial<Pick<Project, 'status' | 'tagline' | 'featured'>>;

export function ProjectCard({
  project,
  priority = false,
}: {
  project: ProjectCardData;
  priority?: boolean;
}) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex flex-col rounded-media bg-surface p-2 transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="relative overflow-hidden rounded-[1.125rem]">
        <Image
          src={project.image.src}
          alt={project.image.alt}
          width={project.image.width}
          height={project.image.height}
          sizes="(min-width: 1024px) 33vw, 100vw"
          priority={priority}
          className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute left-3 top-3 inline-flex items-center rounded-pill bg-surface/90 px-3 py-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.06em] text-ink backdrop-blur-[13px]">
          {project.category}
        </span>
        {project.status ? (
          <span className="absolute right-3 top-3 inline-flex items-center rounded-pill bg-gold px-3 py-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.06em] text-core-black">
            {project.status}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-3 pb-4 pt-5">
        <h3 className="text-heading-sm text-ink">{project.name}</h3>
        <p className="mt-1 inline-flex items-center gap-1.5 font-mono text-body-xs text-ink-faint">
          <Icon name="mapPin" size={13} />
          {project.locality}
        </p>
        {project.tagline ? (
          <p className="mt-3 text-body-sm text-ink-soft">{project.tagline}</p>
        ) : null}

        <span
          className={cx(
            'mt-5 inline-flex items-center gap-1.5 text-body-sm font-medium text-ink',
            'transition-[gap] duration-300 group-hover:gap-3',
          )}
        >
          View project
          <Icon name="arrowRight" size={16} />
        </span>
      </div>
    </Link>
  );
}
