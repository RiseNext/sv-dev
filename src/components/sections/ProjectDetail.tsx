import Image from 'next/image';
import { Suspense } from 'react';
import { LinkButton } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Lightbox } from '@/components/ui/Lightbox';
import { Reveal } from '@/components/ui/Reveal';
import { ShareButton } from '@/components/ui/ShareButton';
import { ContactForm } from '@/components/sections/ContactForm';
import { ProjectActionBar } from '@/components/sections/ProjectActionBar';
import { ProjectCard } from '@/components/sections/ProjectCard';
import { ProjectPhotos } from '@/components/sections/ProjectPhotos';
import { ProjectSectionNav, type ProjectSection } from '@/components/sections/ProjectSectionNav';
import { contact } from '@/content/pages';
import { getProjects } from '@/lib/api/projects';
import { getSiteSettings } from '@/lib/api/site';
import { anchorProps, isPlaceholder, mailHref, telHref, whatsappHref } from '@/lib/href';
import { cx } from '@/lib/cx';
import type { FeatureItem, Project } from '@/types/content';

/* =============================================================================
   PROJECT PAGE — one template, every project, driven entirely by the CMS record.

   ─── THE SHAPE OF IT ──────────────────────────────────────────────────────
     1. a cinematic cover: the photograph, the name bottom-left, the category
        and status as chips, and the two asks that matter
     2. the fact strip, a card riding the cover's bottom edge — location,
        extent, roads, status at a glance
     3. the SECTION RAIL, which sticks under the top bar for the rest of the
        page and names only the sections this record actually filled
     4. Overview: the summary and the full description as one editorial column,
        with a sticky panel of figures and real actions beside it
     5. Highlights — two columns of icon rows on hairlines
     6. the plan, on a pale gold band, zoomable and downloadable
     7. Amenities — three columns, compact
     8. Approvals — a bordered panel, because assurances read as a document
     9. Location — the distances as a rail, the surroundings as rows, the map
    10. the photographs, as a mosaic that opens a full-screen viewer
    11. Enquire — the ONE form on the page, with the project preselected
    12. three other projects, so the page has somewhere to go

   ─── WHAT CHANGED, AND WHY ────────────────────────────────────────────────
   The previous version rendered highlights, amenities, approvals and location
   highlights through ONE shared card grid, so four consecutive sections looked
   identical and the page read as a single undifferentiated wall. Each of the
   four now has its own treatment, and the band colour changes with them.

   It also repeated "Book a site visit" as a gold pill in five places to keep
   the ask reachable on a long page. There is now one form, one rail item that
   reaches it, and — on a phone — a bar pinned to the bottom of the screen. So
   the ask is MORE reachable and is stated once.

   ─── OPTIONAL FIELDS DROP WHOLE SECTIONS ──────────────────────────────────
   Unchanged, and load-bearing: a project with no layout plan has no plan band,
   and no "Layout" item in the rail. Nothing renders an empty shell, and nothing
   invites filler to make a section look complete.

   ─── THE BACKEND SEAM IS UNTOUCHED ────────────────────────────────────────
   Same `Project` record, same `getSiteSettings()` / `getProjects()`, same
   `<ContactForm>` posting to the same `/leads`. This is a layout rewrite only.
   ========================================================================== */

/** Every section's shared padding. `pt-section-sm` (64 → 160px) rather than the
 *  site's full `pt-section` (up to 270px): there are eight of them here, and at
 *  270px apiece the page becomes mostly cream. */
const SECTION = 'px-gutter pt-section-sm';

/** `scroll-padding-top` in globals.css already clears the top bar. This is the
 *  section rail's own height on top of it, so a jumped-to heading lands below
 *  the rail rather than behind it. */
const ANCHOR = 'scroll-mt-8';

/** A row in the sticky panel and in the enquiry column: a real destination,
 *  always at least 48px tall. */
const ACTION_ROW = cx(
  'flex min-h-12 items-center gap-3 rounded-pill border border-gold-line bg-bg px-4',
  'text-body-sm font-medium text-ink transition-colors duration-200 hover:bg-gold-soft/50',
  'motion-reduce:transition-none',
);

/* The page's section opener: gold rule, label, display heading, optional lead.
   `id` is the section's id, and the heading gets `<id>-title` — which is what
   every `aria-labelledby` on this page points at. */
function SectionHead({
  id,
  label,
  title,
  accent,
  lead,
}: {
  id: string;
  label: string;
  title: string;
  accent?: string;
  lead?: string;
}) {
  return (
    <Reveal className="flex flex-col">
      <p className="eyebrow">{label}</p>
      <h2 id={`${id}-title`} className="mt-5 max-w-[24ch] text-heading-lg text-ink">
        {title} {accent ? <em>{accent}</em> : null}
      </h2>
      {lead ? <p className="mt-6 max-w-[56ch] text-body-lg text-ink-soft">{lead}</p> : null}
    </Reveal>
  );
}

/* Highlights: the page's loudest list. A filled gold disc, the title at heading
   weight, hairlines between rows, two columns from 640px. */
function HighlightList({ items }: { items: readonly FeatureItem[] }) {
  return (
    <ul className="mt-12 grid gap-x-12 mid:grid-cols-2">
      {items.map((item, index) => (
        <Reveal
          as="li"
          key={item.title}
          delay={Math.min(index, 5) * 60}
          className="flex gap-5 border-t border-gold-line py-7"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold-ink">
            <Icon name={item.icon} size={20} />
          </span>
          <div>
            <p className="text-heading-xs font-medium text-ink">{item.title}</p>
            {item.body ? <p className="mt-2 text-body-sm text-ink-soft">{item.body}</p> : null}
          </div>
        </Reveal>
      ))}
    </ul>
  );
}

/* Amenities and surroundings: the quiet list. No disc, no container — a small
   gold icon, the title, the line under it. Three columns where the entries are
   short, two where they carry a sentence. */
function FeatureRows({ items, columns }: { items: readonly FeatureItem[]; columns: 2 | 3 }) {
  return (
    <ul
      className={cx(
        'mt-10 grid gap-x-10',
        columns === 3 ? 'mid:grid-cols-2 tablet:grid-cols-3' : 'mid:grid-cols-2',
      )}
    >
      {items.map((item, index) => (
        <Reveal
          as="li"
          key={item.title}
          delay={Math.min(index, 5) * 50}
          className="flex gap-4 border-t border-line py-5"
        >
          <Icon name={item.icon} size={19} className="mt-1 shrink-0 text-gold-ink" />
          <div>
            <p className="text-body-md font-medium text-ink">{item.title}</p>
            {item.body ? <p className="mt-1.5 text-body-sm text-ink-soft">{item.body}</p> : null}
          </div>
        </Reveal>
      ))}
    </ul>
  );
}

export async function ProjectDetail({ project }: { project: Project }) {
  /* A Server Component, so it reads the CMS directly. Both calls are
     React-cached — the root layout already makes them — so rendering this page
     adds no request. */
  const site = await getSiteSettings();
  const allProjects = await getProjects();

  /* The enquiry card's "Project of interest" options: every published project,
     exactly as /contact builds them, so the choices a visitor sees are the set
     the server validates `projectSlug` against (FR-LEAD-03). */
  const formProjects = allProjects.map((p) => ({
    slug: p.slug,
    name: p.name,
    locality: p.locality,
  }));

  const others = allProjects.filter((p) => p.slug !== project.slug).slice(0, 3);

  /* ---- Destinations. Every one is checked; a bracketed or missing CMS value
          drops its control rather than shipping a live-looking dead link. ---- */
  const brochure =
    project.brochure && project.brochure.href.trim() && !isPlaceholder(project.brochure.href)
      ? project.brochure
      : null;

  const callHref = isPlaceholder(site.phone) ? null : telHref(site.phone);
  const emailHref = isPlaceholder(site.email) ? null : mailHref(site.email);
  const whatsappLink = isPlaceholder(site.whatsapp)
    ? null
    : `${whatsappHref(site.whatsapp)}?text=${encodeURIComponent(
        `Hi ${site.name}, I would like to know more about ${project.name}.`,
      )}`;
  const officeHours =
    site.officeHours && !isPlaceholder(site.officeHours) ? site.officeHours : null;

  const isApartments = project.category === 'Apartments';
  const planLabel = isApartments ? 'Floor plan' : 'Layout plan';
  const gallery = project.gallery ?? [];

  /* The overview, one paragraph per line the admin actually typed — see the
     note at the render site. Trimmed, and blanks dropped, so a trailing or
     doubled newline cannot produce an empty <p> with a gap under it. */
  const paragraphs = project.description.flatMap((entry) =>
    entry
      .split(/\r?\n+/)
      .map((line) => line.trim())
      .filter(Boolean),
  );
  const hasLocation = Boolean(
    project.locationHighlights?.length || project.proximity?.length || project.locationMap,
  );

  /* ---- The fact strip over the cover. FOUR AT MOST, in the order a buyer
          asks — and `Category` sits last as the one that is always available,
          so a thin record still fills the strip instead of leaving a gap. ---- */
  const facts = [
    { label: 'Location', value: project.locality },
    ...(project.area ? [{ label: 'Extent', value: project.area }] : []),
    ...(project.roadDetails ? [{ label: 'Roads', value: project.roadDetails }] : []),
    ...(project.status ? [{ label: 'Status', value: project.status }] : []),
    ...(project.developer ? [{ label: 'Developer', value: project.developer }] : []),
    { label: 'Category', value: project.category },
  ].slice(0, 4);

  /* Columns follow the COUNT, so a short strip never leaves a hole in the grid:
     two across a phone only when there are four, otherwise one. */
  const factColumns =
    facts.length >= 4
      ? 'grid-cols-2 tablet:grid-cols-4'
      : facts.length === 3
        ? 'mid:grid-cols-3'
        : 'mid:grid-cols-2';

  /* ---- The rail names only what this record filled. ---- */
  const sections: ProjectSection[] = [
    { id: 'overview', label: 'Overview' },
    ...(project.highlights.length ? [{ id: 'highlights', label: 'Highlights' }] : []),
    ...(project.layoutImage ? [{ id: 'plan', label: isApartments ? 'Floor plan' : 'Layout' }] : []),
    ...(project.amenities?.length ? [{ id: 'amenities', label: 'Amenities' }] : []),
    ...(project.approvals?.length ? [{ id: 'approvals', label: 'Approvals' }] : []),
    ...(hasLocation ? [{ id: 'location', label: 'Location' }] : []),
    ...(gallery.length ? [{ id: 'gallery', label: 'Gallery' }] : []),
    { id: 'enquire', label: 'Enquire' },
  ];

  const chip =
    'inline-flex items-center rounded-pill px-3.5 py-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.06em]';

  return (
    <>
      {/* ================= 1. THE COVER =================
          The photograph starts at the bar's bottom edge (64px, 88px from
          1024px) with the nav's medallion hanging just over it, and the type is
          anchored to the BOTTOM, where the scrim is heaviest.

          🔴 NO SMALL GOLD TYPE ON THE PHOTOGRAPH. Gold at label size needs the
          wash above ~85% to clear 4.5:1, and a wash that heavy over the cover
          throws the photograph away. So the category is a CREAM CHIP (espresso
          on cream, 15:1 whatever is behind it) and the status a GOLD one
          (espresso on solid gold, 6.4:1) — both opaque, both independent of the
          photograph. What is left on the wash is the name and tagline, which are
          large type at 3:1, and the locality line, which sits in the darkest
          part of the gradient.

          The offset is PADDING on a wrapper, not a margin on the section: a top
          margin on the first thing in <main> collapses out through <main> and
          <body>, and would open a strip of the html's dark background at the
          top of the page. */}
      <div className="pt-16 tablet:pt-22">
        <section
          className="theme-dark relative isolate flex min-h-[min(72svh,40rem)] flex-col justify-end overflow-hidden"
          aria-labelledby="project-title"
        >
          <Image
            src={project.image.src}
            alt={project.image.alt}
            fill
            priority
            sizes="100vw"
            className="-z-20 object-cover"
          />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-umber/45 tablet:bg-umber/35" />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-linear-to-t from-umber/95 from-10% via-umber/70 via-45% to-transparent"
          />

          <div className="container-page pb-16 pt-28 tablet:pb-24">
            <div className="max-w-3xl" style={{ animation: 'rise 700ms var(--ease-out-soft) backwards' }}>
              <p className="flex flex-wrap items-center gap-2">
                {/* `theme-light` on the chip: inside this `theme-dark` section
                    `text-ink` would otherwise resolve to cream on cream. */}
                <span className={cx(chip, 'theme-light bg-surface/95 text-ink')}>{project.category}</span>
                {project.status ? (
                  <span className={cx(chip, 'bg-gold text-core-black')}>{project.status}</span>
                ) : null}
              </p>

              <h1 id="project-title" className="mt-6 max-w-[16ch] text-heading-xl text-ink">
                {project.name}
              </h1>

              {/* 🔴 FULL `text-ink`, NOT `text-ink-soft`, and this is a contrast
                  decision rather than a stylistic one. `text-heading-sm` is 21px
                  on a phone — under WCAG's 24px "large text" threshold, so it
                  needs 4.5:1, not 3:1. Measured against the worst case (a white
                  sky pixel under the scrim at the tagline's height) ink-soft
                  lands at ~4.1:1 and ink at ~5.9:1. The band of the gradient the
                  tagline sits in is the constraint; soft grey is available for
                  it only on the cream page. */}
              {project.tagline ? (
                <p className="mt-5 max-w-[40ch] font-display text-heading-sm italic text-ink">
                  {project.tagline}
                </p>
              ) : null}

              <p className="mt-7 inline-flex items-center gap-2 font-mono text-body-xs text-ink">
                <Icon name="mapPin" size={14} />
                {project.locality}
              </p>

              {/* Two asks, and they are DIFFERENT asks: the form, and the one
                  document or plan this project actually has. */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <LinkButton href="#enquire" variant="bronze" size="lg">
                  Book a site visit
                </LinkButton>
                {brochure ? (
                  <LinkButton href={brochure.href} variant="light" size="lg">
                    <Icon name="download" size={16} />
                    Download brochure
                    {/* The pill stays short; the document's own name goes to
                        assistive tech instead of stretching it. */}
                    <span className="visually-hidden">: {brochure.title}</span>
                  </LinkButton>
                ) : project.layoutImage ? (
                  <LinkButton href="#plan" variant="light" size="lg">
                    <Icon name="document" size={16} />
                    See the {planLabel.toLowerCase()}
                  </LinkButton>
                ) : callHref ? (
                  <LinkButton href={callHref} variant="light" size="lg">
                    <Icon name="phone" size={16} />
                    Call us
                  </LinkButton>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ================= 2. THE FACT STRIP =================
          Rides the cover's bottom edge. `relative z-10` is belt-and-braces —
          it comes later in the DOM so it paints on top anyway — and the
          negative margin is what makes it overlap rather than follow. */}
      <section
        className="relative z-10 -mt-9 mb-10 px-gutter tablet:-mt-14 tablet:mb-14"
        aria-label={`${project.name}: the essentials`}
      >
        <div className="container-page">
          <dl
            className={cx(
              'grid gap-px overflow-hidden rounded-card border border-gold-line bg-line',
              'shadow-[0_26px_60px_-42px_rgba(122,90,34,0.85)]',
              factColumns,
            )}
          >
            {facts.map((fact) => (
              <div key={fact.label} className="bg-surface px-5 py-5 tablet:px-6 tablet:py-6">
                <dt className="label-mono font-mono">{fact.label}</dt>
                <dd className="mt-2 text-body-md font-medium text-ink">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ================= THE STICKY REGION =================
          🔴 THIS WRAPPER IS WHY THE RAIL STICKS. A sticky box only travels
          inside its own parent; wrapped any tighter it would scroll away with
          the section it sat in. Everything the rail can reach is inside it. */}
      <div>
        <ProjectSectionNav sections={sections} />

        {/* ---------- 4. OVERVIEW ---------- */}
        <section id="overview" className={cx(SECTION, ANCHOR)} aria-labelledby="overview-title">
          <div className="container-page grid gap-12 tablet:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] tablet:gap-16">
            <div>
              <SectionHead id="overview" label="Overview" title="About" accent={project.name} />

              {project.summary ? (
                <Reveal as="p" delay={60} className="mt-7 max-w-[60ch] text-body-lg text-ink-soft">
                  {project.summary}
                </Reveal>
              ) : null}

              {/* ONE <p> PER LINE THE ADMIN TYPED, not per array entry.

                  `description` is an array of paragraphs, but the CMS returns
                  the whole overview as a SINGLE entry with newlines inside it —
                  eight authored lines arriving as one string. Rendered straight,
                  HTML collapses every one of those newlines into a space and
                  the section becomes a 700-character wall of text.

                  So each entry is split on its own line breaks and the blanks
                  dropped. An array of real paragraphs still renders one each,
                  which is why this reads the array AND the newlines rather than
                  replacing one with the other. Keyed by index: two identical
                  lines are legal and must not collide. */}
              {paragraphs.length ? (
                <Reveal delay={80} className="mt-6 flex max-w-[66ch] flex-col gap-4">
                  {paragraphs.map((paragraph, i) => (
                    <p key={`${i}-${paragraph}`} className="text-body-md text-ink-soft">
                      {paragraph}
                    </p>
                  ))}
                </Reveal>
              ) : null}
            </div>

            {/* Held in view beside a long description on a desktop. `top-40`
                clears the bar and the rail above it. */}
            <Reveal delay={120} className="flex flex-col gap-4 tablet:sticky tablet:top-40 tablet:self-start">
              {project.stats?.length ? (
                <div className="rounded-card border border-gold-line bg-surface p-6">
                  <p className="label-mono font-mono">By the numbers</p>
                  <dl className="mt-4 flex flex-col">
                    {project.stats.map((stat) => (
                      <div
                        key={stat.label}
                        className="flex items-baseline justify-between gap-4 border-t border-line py-3 first:border-t-0 first:pt-0"
                      >
                        <dt className="text-body-sm text-ink-soft">{stat.label}</dt>
                        <dd className="text-right text-body-sm font-medium text-ink">{stat.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ) : null}

              <div className="rounded-card border border-gold-line bg-surface p-6">
                <p className="label-mono font-mono">Take it further</p>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {callHref ? (
                    <li>
                      <a href={callHref} className={ACTION_ROW}>
                        <Icon name="phone" size={17} className="shrink-0 text-gold-ink" />
                        Call about this project
                      </a>
                    </li>
                  ) : null}
                  {whatsappLink ? (
                    <li>
                      <a {...anchorProps(whatsappLink)} className={ACTION_ROW}>
                        <Icon name="whatsapp" size={17} className="shrink-0 text-gold-ink" />
                        Chat on WhatsApp
                      </a>
                    </li>
                  ) : null}
                  {brochure ? (
                    <li>
                      <a {...anchorProps(brochure.href)} className={ACTION_ROW}>
                        <Icon name="download" size={17} className="shrink-0 text-gold-ink" />
                        Download the brochure
                      </a>
                    </li>
                  ) : null}
                  <li>
                    <a href="#enquire" className={ACTION_ROW}>
                      <Icon name="home" size={17} className="shrink-0 text-gold-ink" />
                      Book a site visit
                    </a>
                  </li>
                </ul>

                <div className="mt-5 flex items-center gap-3 border-t border-line pt-5">
                  <ShareButton
                    href={`/projects/${project.slug}`}
                    name={project.name}
                    text={project.summary}
                  />
                  <p className="text-body-sm text-ink-soft">Send this project to someone</p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------- 5. HIGHLIGHTS ---------- */}
        {project.highlights.length ? (
          <section id="highlights" className={cx(SECTION, ANCHOR)} aria-labelledby="highlights-title">
            <div className="container-page">
              <SectionHead
                id="highlights"
                label="Project highlights"
                title={isApartments ? 'What this project' : 'What this layout'}
                accent="is made of"
              />
              <HighlightList items={project.highlights} />
            </div>
          </section>
        ) : null}

        {/* ---------- 6. THE PLAN, on the pale gold band ---------- */}
        {project.layoutImage ? (
          <section
            id="plan"
            className={cx('mt-section-sm bg-sand px-gutter py-20 tablet:py-28', ANCHOR)}
            aria-labelledby="plan-title"
          >
            <div className="container-page grid items-center gap-10 tablet:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] tablet:gap-16">
              <Reveal className="flex flex-col items-start">
                {/* An apartment's plan is a floor plan, not a plot layout —
                    "every plot, numbered" would be wrong on it. */}
                <p className="eyebrow">{planLabel}</p>
                <h2 id="plan-title" className="mt-5 text-heading-lg text-ink">
                  {isApartments ? (
                    <>
                      Every flat, <em>laid out.</em>
                    </>
                  ) : (
                    <>
                      Every plot, <em>numbered.</em>
                    </>
                  )}
                </h2>
                <p className="mt-6 max-w-[44ch] text-body-md text-ink-soft">
                  {isApartments
                    ? 'Open the plan to zoom in on the rooms and their measurements.'
                    : 'Open the plan to zoom in on the plot numbers, the roads and the open space.'}
                </p>
                {brochure ? (
                  <LinkButton href={brochure.href} variant="bronze" className="mt-8">
                    <Icon name="download" size={16} />
                    Download brochure
                    <span className="visually-hidden">: {brochure.title}</span>
                  </LinkButton>
                ) : null}
              </Reveal>

              {/* `maxThumbHeight` so a portrait plan stays whole instead of
                  running taller than the screen. `downloadHref` puts the PDF
                  inside the viewer's own bar, where someone studying the plan
                  is already looking. */}
              <Reveal delay={100}>
                <Lightbox
                  image={project.layoutImage}
                  maxThumbHeight="min(70svh, 40rem)"
                  downloadHref={brochure?.href}
                />
              </Reveal>
            </div>
          </section>
        ) : null}

        {/* ---------- 7. AMENITIES ---------- */}
        {project.amenities?.length ? (
          <section id="amenities" className={cx(SECTION, ANCHOR)} aria-labelledby="amenities-title">
            <div className="container-page">
              <SectionHead
                id="amenities"
                label="Amenities"
                title="Already built,"
                accent="before the first sale"
              />
              <FeatureRows items={project.amenities} columns={3} />
            </div>
          </section>
        ) : null}

        {/* ---------- 8. APPROVALS — a panel, because this is the paperwork ---------- */}
        {project.approvals?.length ? (
          <section id="approvals" className={cx(SECTION, ANCHOR)} aria-labelledby="approvals-title">
            <div className="container-page">
              <Reveal className="rounded-card border border-gold-line bg-surface p-6 tablet:p-12">
                <p className="eyebrow">Approvals and title</p>
                <h2 id="approvals-title" className="mt-5 max-w-[24ch] text-heading-md text-ink">
                  What we can show you <em>in writing</em>
                </h2>
                <ul className="mt-9 grid gap-x-12 mid:grid-cols-2">
                  {project.approvals.map((item) => (
                    <li key={item.title} className="flex gap-4 border-t border-line py-5">
                      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold-ink">
                        <Icon name={item.icon} size={16} />
                      </span>
                      <div>
                        <p className="text-body-md font-medium text-ink">{item.title}</p>
                        {item.body ? (
                          <p className="mt-1.5 text-body-sm text-ink-soft">{item.body}</p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </section>
        ) : null}

        {/* ---------- 9. LOCATION ---------- */}
        {hasLocation ? (
          <section id="location" className={cx(SECTION, ANCHOR)} aria-labelledby="location-title">
            <div className="container-page">
              <SectionHead id="location" label="Location" title="What is" accent="around it" />

              {/* The distances, as printed on the brochure. Nothing is
                  estimated here — see the note on `proximity`. */}
              {project.proximity?.length ? (
                <Reveal delay={60} className="mt-10">
                  <ul className="grid gap-px overflow-hidden rounded-card border border-gold-line bg-line mid:grid-cols-2">
                    {project.proximity.map((item) => (
                      <li key={item.place} className="flex items-baseline gap-4 bg-surface px-5 py-4">
                        <span className="inline-flex w-24 shrink-0 items-center gap-2 font-mono text-body-xs text-gold-ink">
                          <Icon name={item.icon} size={14} />
                          {item.measure}
                        </span>
                        <span className="text-body-sm text-ink-soft">{item.place}</span>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ) : null}

              {project.locationHighlights?.length ? (
                <FeatureRows items={project.locationHighlights} columns={2} />
              ) : null}

              {project.locationMap ? (
                <Reveal delay={80} className="mt-12">
                  <Lightbox image={project.locationMap} maxThumbHeight="min(70svh, 38rem)" />
                </Reveal>
              ) : null}
            </div>
          </section>
        ) : null}

        {/* ---------- 10. THE PHOTOGRAPHS ---------- */}
        {gallery.length ? (
          <section id="gallery" className={cx(SECTION, ANCHOR)} aria-labelledby="gallery-title">
            <div className="container-page">
              <SectionHead id="gallery" label="Gallery" title="On the ground at" accent={project.name} />
              <Reveal delay={80} className="mt-10">
                <ProjectPhotos images={gallery} name={project.name} />
              </Reveal>
            </div>
          </section>
        ) : null}

        {/* ---------- 11. ENQUIRE — the one form on the page ----------
            The SAME <ContactForm> as /contact: same POST to the CMS's `/leads`,
            same validation, honeypot, idempotency key, and the same rule that
            success is shown only for a real 201 — with this project
            preselected. Nothing about how a lead is sent differs between the
            two pages. */}
        <section
          id="enquire"
          className={cx('mt-section-sm bg-sand px-gutter py-20 tablet:py-28', ANCHOR)}
          aria-labelledby="enquire-title"
        >
          <div className="container-page grid gap-10 tablet:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] tablet:gap-16">
            <Reveal>
              <p className="eyebrow">Enquire</p>
              <h2 id="enquire-title" className="mt-5 max-w-[20ch] text-heading-lg text-ink">
                Book a visit to <em>{project.name}</em>
              </h2>
              <p className="mt-6 max-w-[46ch] text-body-lg text-ink-soft">{contact.hero.lead}</p>

              <ul className="mt-9 flex max-w-104 flex-col gap-2.5">
                {callHref ? (
                  <li>
                    <a href={callHref} className={ACTION_ROW}>
                      <Icon name="phone" size={17} className="shrink-0 text-gold-ink" />
                      {site.phone}
                    </a>
                  </li>
                ) : null}
                {whatsappLink ? (
                  <li>
                    <a {...anchorProps(whatsappLink)} className={ACTION_ROW}>
                      <Icon name="whatsapp" size={17} className="shrink-0 text-gold-ink" />
                      Chat on WhatsApp
                    </a>
                  </li>
                ) : null}
                {emailHref ? (
                  <li>
                    <a href={emailHref} className={cx(ACTION_ROW, 'min-w-0')}>
                      <Icon name="mail" size={17} className="shrink-0 text-gold-ink" />
                      <span className="truncate">{site.email}</span>
                    </a>
                  </li>
                ) : null}
              </ul>

              {officeHours ? (
                <p className="mt-6 font-mono text-body-xs text-ink-faint">
                  Site office open {officeHours}
                </p>
              ) : null}
            </Reveal>

            {/* <Suspense> because ContactForm reads `useSearchParams()` (to
                pre-fill ?phone= from the home hero); on a statically generated
                page that must sit under a boundary. The fallback holds the
                form's measured height so the card does not jump as it hydrates
                — `@container` so it can follow the form's OWN breakpoint:
                32.6rem stacked, 26.6rem once Name and Phone sit side by side. */}
            <Reveal
              delay={100}
              className="rounded-card bg-surface p-6 shadow-[0_30px_80px_-50px_rgba(43,34,23,0.7)] tablet:p-8"
            >
              <div className="@container">
                <Suspense
                  fallback={
                    <div aria-hidden="true" className="min-h-130.5 @min-[30rem]:min-h-106.5" />
                  }
                >
                  <ContactForm
                    projects={formProjects}
                    formNote={site.formNote}
                    defaultProject={project.slug}
                  />
                </Suspense>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------- 12. SOMEWHERE TO GO NEXT ---------- */}
        {others.length ? (
          <section className={SECTION} aria-labelledby="more-title">
            <div className="container-page">
              <div className="flex flex-wrap items-end justify-between gap-6">
                <Reveal>
                  <p className="eyebrow">More projects</p>
                  <h2 id="more-title" className="mt-5 max-w-[20ch] text-heading-md text-ink">
                    Other layouts <em>worth walking</em>
                  </h2>
                </Reveal>
                <LinkButton href="/projects" variant="ghost">
                  All projects
                  <Icon name="arrowRight" size={16} />
                </LinkButton>
              </div>

              <ul className="mt-10 grid gap-4 mid:grid-cols-2 tablet:grid-cols-3">
                {others.map((other) => (
                  <li key={other.slug}>
                    <ProjectCard project={other} />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}
      </div>

      <div className="pb-section-sm" />

      {/* Phone only, and it takes itself off screen at the form — see the
          component. */}
      <ProjectActionBar
        callHref={callHref}
        whatsappLink={whatsappLink}
        enquireId="enquire"
        name={project.name}
      />
    </>
  );
}
