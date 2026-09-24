import Image from 'next/image';
import Link from 'next/link';
import { Suspense, type ReactNode } from 'react';
import { LinkButton } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Lightbox } from '@/components/ui/Lightbox';
import { Reveal } from '@/components/ui/Reveal';
import { Wave } from '@/components/ui/Wave';
import { ContactForm } from '@/components/sections/ContactForm';
import { CtaBand } from '@/components/sections/CtaBand';
import { ProjectGallery } from '@/components/sections/ProjectGallery';
import { contact } from '@/content/pages';
import { getProjects } from '@/lib/api/projects';
import { getSiteSettings } from '@/lib/api/site';
import { anchorProps, isPlaceholder, telHref, whatsappHref } from '@/lib/href';
import { cx } from '@/lib/cx';
import type { FeatureItem, ImageRef, Project } from '@/types/content';

/* =============================================================================
   PROJECT DETAIL — one template for every project, laid out to the project
   design template, top to bottom:

     1. the cover photograph, full width, with the name over it and a wave
        cutting it into the page
     2. "About": the summary beside a photograph
     3. a strip of quick actions — visit, call, WhatsApp, brochure
     4. the layout plan on a dark green band, zoomable
     5. "At a glance": the key facts as outlined cards (and, when the CMS has
        them, the highlights, amenities, approvals and surroundings the same way)
     6. "Inside": the full description beside a large photograph
     7. the gallery, a row of tiles with an arrow at each end
     8. the closing ask on a sand band that curves into the footer

   Driven entirely by the CMS record. Every optional field drops its whole
   section rather than rendering an empty shell — a project with no layout
   plan simply has no dark band — which is what keeps the page honest when a
   brochure is thin. Each gold button carries a DIFFERENT real action, so the
   template's repeated pill never repeats the same ask.
   ========================================================================== */

/* The template's image-beside-text pairs. */
function Photo({ image, className, sizes }: { image: ImageRef; className?: string; sizes: string }) {
  return (
    <div
      className={cx(
        'relative aspect-4/3 overflow-hidden rounded-3xl bg-surface shadow-[0_30px_70px_-40px_rgba(26,43,40,0.55)]',
        className,
      )}
    >
      <Image src={image.src} alt={image.alt} fill sizes={sizes} className="object-cover" />
    </div>
  );
}

/* A centred eyebrow and heading, as over every card grid in the template. */
function SectionHead({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <Reveal className="flex flex-col items-center text-center">
      <p className="eyebrow">{label}</p>
      <h2 id={id} className="mt-5 max-w-[22ch] text-heading-lg text-ink">
        {children}
      </h2>
    </Reveal>
  );
}

/* The template's outlined cards: an icon tile, then up to three lines. */
function Cards({
  items,
}: {
  items: readonly { icon: IconName; label?: string; title: string; body?: string }[];
}) {
  return (
    <ul className="mt-12 flex flex-wrap justify-center gap-4">
      {items.map((item, index) => (
        <Reveal
          as="li"
          key={`${item.label ?? ''}${item.title}`}
          delay={index * 60}
          className={cx(
            'flex basis-full flex-col gap-4 rounded-2xl border border-line bg-surface p-6',
            'mid:basis-[calc((100%-1rem)/2)] tablet:basis-[calc((100%-3rem)/4)]',
          )}
        >
          <span className="flex size-12 items-center justify-center rounded-xl bg-sand text-gold-ink">
            <Icon name={item.icon} size={22} />
          </span>
          <div>
            {item.label ? (
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-gold-ink">{item.label}</p>
            ) : null}
            <p className={cx('text-body-md font-medium text-ink', item.label && 'mt-1.5')}>{item.title}</p>
            {item.body ? <p className="mt-2 text-body-sm text-ink-soft">{item.body}</p> : null}
          </div>
        </Reveal>
      ))}
    </ul>
  );
}

/* A CMS feature list (highlights, amenities…) as a headed card grid. */
function FeatureCards({
  id,
  label,
  title,
  accent,
  items,
}: {
  id: string;
  label: string;
  title: string;
  accent: string;
  items?: readonly FeatureItem[];
}) {
  if (!items?.length) return null;
  return (
    <section className="px-gutter pt-section" aria-labelledby={`${id}-title`}>
      <div className="container-page">
        <SectionHead id={`${id}-title`} label={label}>
          {title} <em>{accent}</em>
        </SectionHead>
        <Cards items={items.map((item) => ({ icon: item.icon, title: item.title, body: item.body }))} />
      </div>
    </section>
  );
}

export async function ProjectDetail({ project }: { project: Project }) {
  // A Server Component, so it reads the CMS directly. `getSiteSettings` is
  // React-cached, so the whole render tree makes ONE request for this.
  const site = await getSiteSettings();

  /* The enquiry card's "Project of interest" options — every published
     project, exactly as /contact builds them, so the choices a visitor sees
     are the set the server validates `projectSlug` against. `getProjects()`
     is React- and fetch-cached (the root layout already calls it), so this is
     not an extra request to the CMS. */
  const formProjects = (await getProjects()).map((p) => ({
    slug: p.slug,
    name: p.name,
    locality: p.locality,
  }));

  /* The brochure appears ONLY for a project that actually has one, and only
     for a real destination. The `href` is whatever the CMS returned — never
     constructed here, so no Cloudinary URL shape is assumed. */
  const brochure =
    project.brochure && project.brochure.href.trim() && !isPlaceholder(project.brochure.href)
      ? project.brochure
      : null;

  const hasWhatsapp = typeof site.whatsapp === 'string' && !isPlaceholder(site.whatsapp);
  const whatsappLink = hasWhatsapp
    ? `${whatsappHref(site.whatsapp)}?text=${encodeURIComponent(
        `Hi ${site.name}, I would like to know more about ${project.name}.`,
      )}`
    : null;

  const isApartments = project.category === 'Apartments';
  const gallery = project.gallery ?? [];
  const overviewImage = gallery[0] ?? project.image;
  const detailImage = gallery[1] ?? gallery[0] ?? project.image;

  /* ---- The quick-action strip. Only real destinations make it in. ---- */
  const actions: { icon: IconName; label: string; href: string }[] = [
    { icon: 'home', label: 'Book a site visit', href: '#enquire' },
    { icon: 'phone', label: 'Call us', href: telHref(site.phone) },
    ...(whatsappLink ? [{ icon: 'whatsapp' as const, label: 'WhatsApp us', href: whatsappLink }] : []),
    ...(brochure
      ? [{ icon: 'download' as const, label: 'Download brochure', href: brochure.href }]
      : project.layoutImage
        ? [
            {
              icon: 'document' as const,
              label: isApartments ? 'See the floor plan' : 'See the layout plan',
              href: '#layout',
            },
          ]
        : []),
  ];

  /* ---- "At a glance": the record's own facts, in the order a buyer asks. */
  const facts = [
    { icon: 'mapPin' as const, label: 'Location', title: project.locality },
    ...(project.area ? [{ icon: 'ruler' as const, label: 'Area', title: project.area }] : []),
    ...(project.roadDetails ? [{ icon: 'road' as const, label: 'Roads', title: project.roadDetails }] : []),
    ...(project.developer ? [{ icon: 'briefcase' as const, label: 'Developer', title: project.developer }] : []),
    ...(project.stats ?? []).map((stat) => ({ icon: 'check' as const, label: stat.label, title: stat.value })),
  ];

  return (
    <>
      {/* ---------- 1. Cover photograph ----------
          Starts under the fixed bar (64/80px) so the bar always sits on the
          cream, as in the template. The type sits on a forest wash, heavier on
          a phone where the text runs the full width.

          The offset is PADDING on a wrapper, not a margin on the section: a
          top margin on the first thing in <main> collapses out through <main>
          and <body>, leaving an 80px strip of the html's dark background
          behind the glass bar. */}
      <div className="pt-16 tablet:pt-20">
        <section className="theme-dark relative isolate overflow-hidden" aria-labelledby="project-title">
          <Image
            src={project.image.src}
            alt={project.image.alt}
            fill
            priority
            sizes="100vw"
            className="-z-20 object-cover"
          />
          {/* Strengths MEASURED against the real cover photos (brightest pixel
              behind each line, sky included), not guessed: at these values the
              12px gold eyebrow and the phone tagline clear 4.5:1. */}
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-forest/78 tablet:bg-forest/40" />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-linear-to-r from-forest/90 via-forest/55 to-transparent"
          />

          {/* Two columns from 1024px: the name on the left, the enquiry card in
              the top-right corner. Below 1024px the card follows the text. */}
          <div
            className={cx(
              'container-page flex min-h-[min(74svh,42rem)] flex-col justify-center gap-10 pb-28 pt-14',
              'tablet:grid tablet:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] tablet:items-center tablet:gap-12 tablet:pb-36 tablet:pt-12',
            )}
          >
            <div className="max-w-2xl" style={{ animation: 'rise 700ms var(--ease-out-soft) backwards' }}>
              <p className="eyebrow">{project.category}</p>
              <h1 id="project-title" className="mt-5 max-w-[14ch] text-heading-xl text-ink">
                {project.name}
              </h1>
              {project.tagline ? (
                <p className="mt-5 max-w-[36ch] font-display text-heading-sm italic text-ink-soft">
                  {project.tagline}
                </p>
              ) : null}
              <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-body-xs text-ink">
                <Icon name="mapPin" size={14} className="text-gold-ink" />
                {project.locality}
                {project.status ? (
                  <span className="ml-1 rounded-pill bg-gold px-2.5 py-0.5 text-[0.6875rem] uppercase tracking-[0.06em] text-core-black">
                    {project.status}
                  </span>
                ) : null}
              </p>
              <LinkButton href="#enquire" variant="gold" size="lg" className="mt-8">
                Book a site visit
              </LinkButton>
            </div>

            {/* ---------- The enquiry card ----------
                The SAME <ContactForm> as /contact — same POST to the CMS's
                `/leads`, same validation, honeypot, idempotency key, and the
                same rule that success is shown only for a real 201 — with this
                project pre-selected. Nothing about how a lead is sent differs
                between the two pages.

                <Suspense> because ContactForm reads `useSearchParams()` (to
                pre-fill ?phone= from the home hero); on a statically generated
                page that must sit under a boundary. The fallback holds the
                form's height so the card does not jump when it hydrates. */}
            <div
              id="enquire"
              className={cx(
                'theme-light scroll-mt-28 rounded-3xl border border-white/60 bg-surface p-6 tablet:p-7',
                'shadow-[0_30px_80px_-30px_rgba(7,15,13,0.6)]',
              )}
              style={{ animation: 'rise 700ms var(--ease-out-soft) 120ms backwards' }}
            >
              <p className="eyebrow">Enquire</p>
              <h2 className="mt-3 text-heading-sm text-ink">
                Get a call back about <em>{project.name}</em>
              </h2>
              <p className="mt-2 text-body-sm text-ink-soft">{contact.hero.lead}</p>
              {/* `@container` so the fallback can follow the form's own
                  breakpoint: measured at 32.6rem stacked and 26.6rem once
                  Name and Phone sit side by side (a form 30rem wide). */}
              <div className="@container mt-6">
                <Suspense
                  fallback={
                    <div aria-hidden="true" className="min-h-[32.625rem] @min-[30rem]:min-h-[26.625rem]" />
                  }
                >
                  <ContactForm
                    projects={formProjects}
                    formNote={site.formNote}
                    defaultProject={project.slug}
                  />
                </Suspense>
              </div>
            </div>
          </div>

          <Wave edge="bottom" />
        </section>
      </div>

      {/* ---------- 2. About, and 3. the quick-action strip ---------- */}
      <section className="px-gutter pt-16 tablet:pt-20" aria-labelledby="overview-title">
        <div className="container-page">
          <div className="grid items-center gap-10 tablet:grid-cols-2 tablet:gap-16">
            <Reveal className="flex flex-col items-start">
              <p className="eyebrow">Overview</p>
              <h2 id="overview-title" className="mt-5 max-w-[16ch] text-heading-lg text-ink">
                About <em>{project.name}</em>
              </h2>
              {project.summary ? (
                <p className="mt-6 max-w-[54ch] text-body-lg text-ink-soft">{project.summary}</p>
              ) : null}
              {whatsappLink ? (
                <LinkButton href={whatsappLink} variant="gold" className="mt-8">
                  <Icon name="whatsapp" size={16} />
                  Chat on WhatsApp
                </LinkButton>
              ) : (
                <LinkButton href="#enquire" variant="gold" className="mt-8">
                  Book a site visit
                </LinkButton>
              )}
            </Reveal>
            <Reveal delay={100}>
              <Photo image={overviewImage} sizes="(min-width: 1400px) 680px, (min-width: 1024px) 50vw, 100vw" />
            </Reveal>
          </div>

          <ul
            aria-label="Get in touch about this project"
            className={cx(
              'mt-12 grid grid-cols-2 rounded-card border border-line bg-sand/50 tablet:mt-16',
              actions.length >= 4 ? 'tablet:grid-cols-4' : actions.length === 3 ? 'tablet:grid-cols-3' : 'tablet:grid-cols-2',
            )}
          >
            {actions.map((action) => {
              const inner = (
                <>
                  <span className="flex size-12 items-center justify-center rounded-xl border border-gold/45 bg-surface text-gold-ink transition-transform duration-300 ease-spring group-hover:-translate-y-0.5 motion-reduce:transition-none">
                    <Icon name={action.icon} size={22} />
                  </span>
                  <span className="text-body-sm font-medium text-ink">{action.label}</span>
                </>
              );
              const cls = 'group flex h-full flex-col items-center gap-3 px-4 py-6 text-center';
              return (
                <li
                  key={action.label}
                  className="border-line max-tablet:odd:border-r max-tablet:nth-[-n+2]:border-b tablet:not-last:border-r"
                >
                  {action.href.startsWith('/') ? (
                    <Link href={action.href} className={cls}>
                      {inner}
                    </Link>
                  ) : (
                    <a {...anchorProps(action.href)} className={cls}>
                      {inner}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ---------- 4. Layout plan, on the dark band ---------- */}
      {project.layoutImage ? (
        <section
          id="layout"
          className="theme-dark mt-section scroll-mt-24 bg-forest px-gutter py-20 tablet:py-28"
          aria-labelledby="layout-title"
        >
          <div className="container-page grid items-center gap-10 tablet:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] tablet:gap-16">
            <Reveal className="flex flex-col items-start">
              {/* An apartment's plan is a floor plan, not a plot layout —
                  "every plot, numbered" would be wrong on it. */}
              <p className="eyebrow">{isApartments ? 'Floor plan' : 'Layout plan'}</p>
              <h2 id="layout-title" className="mt-5 text-heading-lg text-ink">
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
                <LinkButton href={brochure.href} variant="gold" className="mt-8">
                  <Icon name="download" size={16} />
                  Download brochure
                  {/* The visible label stays short; the document's own name is
                      exposed to assistive tech instead of stretching the pill. */}
                  <span className="sr-only">: {brochure.title}</span>
                </LinkButton>
              ) : (
                <LinkButton href="#enquire" variant="gold" className="mt-8">
                  Book a site visit
                </LinkButton>
              )}
            </Reveal>
            <Reveal delay={100}>
              <Lightbox image={project.layoutImage} maxThumbHeight="min(70svh, 40rem)" />
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* ---------- 5. At a glance, then any CMS feature lists ---------- */}
      <section className="px-gutter pt-section" aria-labelledby="glance-title">
        <div className="container-page">
          <SectionHead id="glance-title" label="Key details">
            {project.name} <em>at a glance</em>
          </SectionHead>
          <Cards items={facts} />
        </div>
      </section>

      <FeatureCards
        id="highlights"
        label="Project highlights"
        title="What this layout"
        accent="is made of"
        items={project.highlights}
      />
      <FeatureCards
        id="amenities"
        label="Amenities"
        title="Already built,"
        accent="before the first sale"
        items={project.amenities}
      />
      <FeatureCards
        id="approvals"
        label="Approvals and title"
        title="What we can show you"
        accent="in writing"
        items={project.approvals}
      />

      {/* ---------- 6. Inside: the full description ---------- */}
      {project.description.length ? (
        <section className="px-gutter pt-section" aria-labelledby="details-title">
          <div className="container-page grid items-start gap-10 tablet:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] tablet:gap-16">
            <Reveal className="flex flex-col items-start">
              <p className="eyebrow">The details</p>
              <h2 id="details-title" className="mt-5 text-heading-lg text-ink">
                Inside <em>{project.name}</em>
              </h2>
              <div className="mt-6 flex flex-col gap-4">
                {project.description.map((paragraph) => (
                  <p key={paragraph} className="text-body-md text-ink-soft">
                    {paragraph}
                  </p>
                ))}
              </div>
              <LinkButton href={telHref(site.phone)} variant="gold" className="mt-8">
                <Icon name="phone" size={16} />
                Call about this project
              </LinkButton>
            </Reveal>
            {/* Held in view beside a long description on a desktop. */}
            <Reveal delay={100} className="tablet:sticky tablet:top-28">
              <Photo image={detailImage} sizes="(min-width: 1400px) 780px, (min-width: 1024px) 57vw, 100vw" />
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* ---------- Surroundings, when the CMS has them ---------- */}
      <FeatureCards
        id="surroundings"
        label="Location highlights"
        title="What is"
        accent="around it"
        items={project.locationHighlights}
      />

      {project.proximity?.length ? (
        <section className="px-gutter pt-section-sm" aria-label="Proximity">
          <div className="container-page">
            <ul className="grid gap-px overflow-hidden rounded-card bg-line mid:grid-cols-2">
              {project.proximity.map((item) => (
                <li key={item.place} className="flex items-baseline gap-4 bg-bg px-6 py-4">
                  <span className="inline-flex w-24 shrink-0 items-center gap-2 font-mono text-body-xs text-ink">
                    <Icon name={item.icon} size={14} className="text-ink-faint" />
                    {item.measure}
                  </span>
                  <span className="text-body-sm text-ink-soft">{item.place}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {project.locationMap ? (
        <section className="px-gutter pt-section-sm" aria-label="Location map">
          <Reveal className="container-page">
            <Lightbox image={project.locationMap} />
          </Reveal>
        </section>
      ) : null}

      {/* ---------- 7. Gallery ---------- */}
      {gallery.length ? (
        <section className="px-gutter pt-section" aria-labelledby="gallery-title">
          <div className="container-page">
            <Reveal className="flex flex-col items-center text-center">
              <p className="eyebrow">Gallery</p>
              <h2 id="gallery-title" className="mt-5 text-heading-md text-ink">
                On the ground at <em>{project.name}</em>
              </h2>
            </Reveal>
            <Reveal delay={80} className="mt-10">
              <ProjectGallery images={gallery} name={project.name} />
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* ---------- 8. The closing ask ---------- */}
      {/* Back up to the enquiry card, where this project is already chosen. */}
      <CtaBand
        href="#enquire"
        title={project.cta?.title ?? `Walk ${project.name} this week`}
        body={
          project.cta?.description ??
          'Site visits run seven days a week. We will send directions and have someone meet you at the gate.'
        }
      />
    </>
  );
}
