import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import type { Project } from '@/types/content';
import { cx } from '@/lib/cx';

/* The design template's project card: the picture flush along the top, then a
   gold category label, the name in the display serif, the place and the
   tagline. A hairline border rather than a shadow, as in the template. The
   whole card is one link — a card with three separate links in it gives a
   screen-reader user three stops for one destination. */

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
      className={cx(
        'theme-light group flex w-full flex-col overflow-hidden rounded-card border border-line bg-surface',
        'transition-[transform,box-shadow] duration-300 hover:-translate-y-1',
        'hover:shadow-[0_24px_50px_-30px_rgba(26,43,40,0.45)]',
      )}
    >
      <div className="relative overflow-hidden">
        <Image
          src={project.image.src}
          alt={project.image.alt}
          width={project.image.width}
          height={project.image.height}
          sizes="(min-width: 1024px) 33vw, 100vw"
          priority={priority}
          className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {project.status ? (
          <span className="absolute right-3 top-3 inline-flex items-center rounded-pill bg-gold px-3 py-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.06em] text-core-black">
            {project.status}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-5 pb-6 pt-5">
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-gold-ink">{project.category}</p>
        <h3 className="mt-2 text-heading-sm text-ink">{project.name}</h3>
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
