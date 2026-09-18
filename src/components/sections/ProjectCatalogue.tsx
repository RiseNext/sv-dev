'use client';

import { useState } from 'react';
import { ProjectCard } from '@/components/sections/ProjectCard';
import type { Project, ProjectCategory } from '@/types/content';
import { cx } from '@/lib/cx';

/* Filter pills in the nav's own idiom. Client-side because the catalogue is
   five records: a round trip per filter would be slower and would lose scroll
   position for nothing. Categories come from the data — a category with no
   project in it is never rendered. */

export function ProjectCatalogue({
  projects,
  categories,
}: {
  projects: readonly Project[];
  categories: readonly ProjectCategory[];
}) {
  const [active, setActive] = useState<ProjectCategory | 'all'>('all');
  const visible = active === 'all' ? projects : projects.filter((p) => p.category === active);

  const pill =
    'inline-flex min-h-11 items-center rounded-pill px-4 text-body-sm font-medium transition-colors';

  return (
    <section className="px-gutter pt-16" aria-label="Project catalogue">
      <div className="container-page">
        <div className="flex flex-wrap justify-center gap-1.5 rounded-card">
          <button
            type="button"
            onClick={() => setActive('all')}
            aria-pressed={active === 'all'}
            className={cx(pill, active === 'all' ? 'bg-ink text-white' : 'bg-surface text-ink')}
          >
            All projects
          </button>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActive(category)}
              aria-pressed={active === category}
              className={cx(pill, active === category ? 'bg-ink text-white' : 'bg-surface text-ink')}
            >
              {category}
            </button>
          ))}
        </div>

        <ul className="mt-12 grid gap-4 mid:grid-cols-2 tablet:grid-cols-3">
          {visible.map((project, index) => (
            <li key={project.slug}>
              <ProjectCard project={project} priority={index < 3} />
            </li>
          ))}
        </ul>

        <p className="mt-8 text-center font-mono text-body-xs text-ink-faint">
          {visible.length} {visible.length === 1 ? 'project' : 'projects'}
          {active === 'all' ? '' : ` in ${active}`}
        </p>
      </div>
    </section>
  );
}
