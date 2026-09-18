import { PageHero } from '@/components/layout/PageHero';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { CtaBanner } from '@/components/sections/CtaBanner';
import { ProjectGrid } from '@/components/sections/ProjectGrid';
import { projects, usedCategories } from '@/content/projects';
import { site } from '@/content/site';
import { pageMetadata } from '@/lib/seo';
import styles from './page.module.css';

export const metadata = pageMetadata({
  title: 'Projects',
  description:
    'Villa plots, farm villa plots, residential plots and apartments at Aler, Bhongir and Genome Valley.',
  path: '/projects',
});

/** Anchor id for a category, e.g. 'Farm Villa Plots' → 'farm-villa-plots'. */
function anchor(category: string) {
  return category.toLowerCase().replace(/\s+/g, '-');
}

/* Only categories that at least one project carries are rendered, so a
   category is never shown empty and none is forced onto a project. */
const categories = usedCategories();

export default function ProjectsPage() {
  return (
    <>
      <PageHero
        eyebrow="Projects"
        title="Our project catalogue"
        lead={`Every ${site.name} project, grouped by what it is — villa plots, farm villa plots, residential plots and apartments.`}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Projects' }]}
      />

      {/* Category jump links. Plain anchors rather than client-side filtering:
          with five projects, filtering would hide content for no benefit, and
          this stays keyboard- and crawler-friendly with no JavaScript. */}
      <Section size="sm" aria-label="Project categories">
        <nav className={styles.filters}>
          <ul className={styles.filterList}>
            {categories.map((category) => {
              const count = projects.filter((item) => item.category === category).length;
              return (
                <li key={category}>
                  <a className={styles.filter} href={`#${anchor(category)}`}>
                    {category}
                    <span className={styles.count}>{count}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </Section>

      {categories.map((category, index) => {
        const items = projects.filter((project) => project.category === category);
        const headingId = `${anchor(category)}-title`;

        return (
          <Section
            key={category}
            id={anchor(category)}
            tone={index % 2 === 1 ? 'surface' : 'default'}
            aria-labelledby={headingId}
          >
            <SectionHeading eyebrow={`${items.length} project${items.length === 1 ? '' : 's'}`} title={category} id={headingId} />
            <ProjectGrid items={items} />
          </Section>
        );
      })}

      <CtaBanner />
    </>
  );
}
