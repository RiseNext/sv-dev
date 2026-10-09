import Image from 'next/image';
import { Reveal } from '@/components/ui/Reveal';
import { Icon } from '@/components/ui/Icon';
import { Frame } from '@/components/ui/Media';
import { FeatureList } from '@/components/sections/FeatureList';
import { about } from '@/content/pages';
import { getProjects } from '@/lib/api/projects';
import { getSiteSettings } from '@/lib/api/site';
import { getStatistics } from '@/lib/api/content';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata() {
  const site = await getSiteSettings();
  return pageMetadata({
    title: 'About us',
    description: about.hero.lead,
    path: '/about',
    siteName: site.name,
  });
}

export default async function AboutPage() {
  /* `getStatistics()` is still called and its slot is deliberately empty — the
     same arrangement as app/page.tsx. The track-record band that read it was
     removed on request (see below), but dropping the call would quietly unwire
     a CMS reader and its cache tag. */
  const [site, projects] = await Promise.all([
    getSiteSettings(),
    getProjects(),
    getStatistics(),
  ]);

  /* The hero photograph: the first published project's cover, in CMS order. It
     is the only real photography the site has — see the note on the hero. A
     project with no image, or no projects at all, renders the band without a
     picture rather than with a broken one. */
  const cover = projects.find((project) => project.image?.src)?.image;

  return (
    <>
      {/* ---- THE ABOUT HERO — a photograph, a blurred dark layer, one word.

           Replaces the shared <PageHero> on this route only; /contact,
           /projects and /gallery still use it, so it is untouched.

           THE TYPE MATCHES THE NAV BUTTONS: `font-display font-normal`, the
           same pair the links and the gold CTA carry.

           🔴 `font-normal` IS NOT OPTIONAL, for the reason written at the CTA
           in PillNav: Instrument Serif ships ONE weight (400). Asking for 600
           does not load a bolder cut — the browser synthesises one by smearing
           the outlines, which on a high-contrast serif thickens the hairlines
           and ruins the very thing that makes the face look like the logo. If
           this heading ever needs more presence, take it from the SIZE, never
           from the weight.

           THE BACKGROUND IS REAL PROJECT PHOTOGRAPHY from the CMS, not an
           asset in the repo: `public/images/projects` holds only 1.1KB
           placeholder SVGs, and a placeholder behind the company's own About
           page would be the wrong thing to ship.

           `scale-105` on the picture is not decoration — `backdrop-blur`
           samples what is behind it, and at the edges of the viewport there is
           nothing to sample, which leaves a visibly sharp fringe. Oversizing
           the image puts real pixels under the whole blur.

           `pt-28 tablet:pt-36` matches the home hero's nav clearance: the bar
           is fixed and its emblem overhangs to 100px on a phone and 132px from
           1024px. ---- */}
      <section
        className="relative isolate flex min-h-[72svh] items-center justify-center overflow-hidden px-gutter pb-16 pt-28 tablet:min-h-[80svh] tablet:pt-36"
        aria-labelledby="about-title"
      >
        {cover ? (
          <Image
            src={cover.src}
            alt=""
            fill
            priority
            sizes="100vw"
            className="-z-20 scale-105 object-cover"
          />
        ) : null}

        {/* The blurred black layer. `bg-ink` rather than pure black, so it sits
            in the same warm family as the rest of the page; 60% is what keeps
            white type at a comfortable margin over a bright sky. */}
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-ink/60 backdrop-blur-[6px]" />

        <h1
          id="about-title"
          className="text-center font-display text-[clamp(2rem,5.5vw,4.25rem)] font-normal uppercase leading-[1.05] tracking-[0.08em] text-white"
        >
          {about.hero.eyebrow}
        </h1>
      </section>

      {/* The "Track record" band — four counters reading [00]+ YEARS BUILDING,
          [000]+ PLOTS HANDED OVER, [0] LAYOUTS COMPLETED and Immediate
          REGISTRATION — was removed on request.

          It fell back to `home.hero.stats` whenever /statistics returned no
          rows, which it always has, so what shipped was four [BRACKETED]
          placeholders presented as a track record. `getStatistics()` is still
          called below: the band is the kind of thing that comes back, and the
          reader and its cache tag are part of the CMS seam. */}

      <section className="px-gutter pt-section" aria-labelledby="story-title">
        <div className="container-page grid gap-10 tablet:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] tablet:gap-16">
          {/* Heading first, then the mark beneath it — the stack from the
              supplied screenshot. The logo is the committed emblem, the same
              file the nav badge uses, on a `bg-surface` card: the artwork is a
              white-background JPEG, and surface is the one ground on this page
              that white disappears into instead of showing as a pale square.

              `aria-hidden`, because the page is already titled and the emblem
              repeats the brand rather than adding to it. */}
          <Reveal className="tablet:sticky tablet:top-28 tablet:self-start">
            <p className="label-mono font-mono">{about.story.eyebrow}</p>
            <h2 id="story-title" className="mt-5 max-w-[14ch] text-heading-lg text-ink">
              We sell <em>what is already built</em>
            </h2>

            <div
              aria-hidden="true"
              className="mt-10 w-full max-w-80 overflow-hidden rounded-card bg-surface p-6 tablet:p-8"
            >
              <Image
                src="/images/logo/newlogo.jpeg"
                alt=""
                width={384}
                height={384}
                sizes="(min-width: 1024px) 20rem, 60vw"
                className="h-auto w-full"
              />
            </div>
          </Reveal>

          {/* The rule above the copy is the screenshot's too — it separates the
              two columns on a desktop without a border between them, and on a
              phone it marks where the heading stack ends and the prose starts. */}
          <Reveal delay={100} className="flex flex-col gap-6 border-t border-line pt-8 tablet:pt-10">
            {about.story.body.map((paragraph) => (
              <p key={paragraph} className="text-body-lg text-ink-soft">
                {paragraph}
              </p>
            ))}
          </Reveal>
        </div>
      </section>

      {/* The two people who run the company. A two-up of surface cards, the
          same material as the office block at the foot of this page, so the
          section arrives without introducing a new card style.

          `mid:` rather than `tablet:`: two cards sit comfortably side by side
          from 640px, and holding them stacked until 1024px would leave a phone
          landscape screen half empty. */}
      <section className="px-gutter pt-section" aria-labelledby="team-title">
        <div className="container-page">
          <Reveal>
            <p className="label-mono font-mono">{about.leadership.eyebrow}</p>
            <h2 id="team-title" className="mt-5 max-w-[18ch] text-heading-lg text-ink">
              The people <em>behind the layouts</em>
            </h2>
            <p className="mt-6 max-w-[48ch] text-body-md text-ink-soft">
              {about.leadership.lead}
            </p>
          </Reveal>

          {/* The two-up is CONDITIONAL on there being two. With one profile,
              `mid:grid-cols-2` left a card in the left half and a hole in the
              right. One profile gets a single full-width card instead — which
              it can now carry, because the card itself has two columns — and
              the grid comes back the moment a second person is added to
              `about.leadership.people`. */}
          <ul
            className={
              about.leadership.people.length > 1
                ? 'mt-12 grid gap-4 mid:grid-cols-2'
                : 'mt-12 grid gap-4'
            }
          >
            {about.leadership.people.map((person, index) => (
              <li key={person.name}>
                <Reveal delay={index * 90} className="h-full rounded-card bg-surface p-8 tablet:p-10">
                  {/* 🔴 THE BIO IS FIRST IN THE DOM AND THE PORTRAIT SECOND,
                      which is what puts the portrait on the RIGHT at 1024px
                      without `flex-row-reverse`. It matters below 1024px too:
                      stacked, the bio is what you read first rather than
                      scrolling past a portrait to reach it.

                      `w-72` is a FIXED column, not a fraction — the bio takes
                      the slack. A portrait that grew with the viewport would be
                      384px tall on a laptop and over 600px on a wide monitor,
                      dragging the card's height with it. */}
                  {/* `items-center` rather than `items-start`: the portrait is
                      a fixed 3:4 and the bio is three sentences, so the bio is
                      the shorter of the two by some way. Topped out, it left a
                      deep band of empty white under the text and the card read
                      as unfinished; centred, the two halves sit against each
                      other. The bio stays the taller of the two on a narrow
                      desktop, where this does nothing at all. */}
                  <div className="flex flex-col gap-8 tablet:flex-row tablet:items-center tablet:gap-12">
                    <div className="min-w-0 flex-1">
                      {/* THE NAME LEADS AND THE ROLE SITS UNDER IT, on request.
                          The heading keeps its own level in the document — the
                          label beneath is not a subheading, it is an
                          attribution, which is why it stays a <p>. */}
                      <h3 className="font-display text-heading-sm text-ink">{person.name}</h3>
                      <p className="mt-2 label-mono font-mono">{person.role}</p>
                      {/* CAPPED, because across the full width of a card that
                          holds one profile the bio would set at about 95
                          characters a line. 64ch is the top of the comfortable
                          range rather than the middle of it, on purpose: at
                          52ch the paragraph filled barely half its column and
                          left a wide channel of white before the portrait,
                          which read as a misalignment rather than as air. */}
                      <p className="mt-5 max-w-[64ch] text-body-md text-ink-soft">{person.body}</p>
                    </div>

                    <div className="tablet:w-72 tablet:shrink-0">
                      {person.photo ? (
                        <Frame
                          image={person.photo}
                          ratio="aspect-[3/4]"
                          sizes="(min-width: 64rem) 18rem, 100vw"
                        />
                      ) : (
                        /* 🔶 A RESERVED SLOT, HELD ON REQUEST UNTIL THE
                           PORTRAIT ARRIVES. It is deliberately quiet — a sand
                           panel with a gold hairline, no "image goes here"
                           label — because this is a LIVE page and a visibly
                           unfinished box on it is worse than a plain one. It
                           keeps the card's two-column shape so dropping the
                           real photo into `photo` changes nothing but the
                           contents. `aria-hidden` because it carries no
                           information: there is nothing here to announce. */
                        <div
                          aria-hidden="true"
                          className="flex aspect-3/4 items-center justify-center rounded-media bg-sand ring-1 ring-inset ring-gold-line"
                        >
                          <Icon name="briefcase" size={40} className="text-gold-ink/30" />
                        </div>
                      )}
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <FeatureList
        id="values"
        label="What drives us"
        title="Mission, vision"
        titleAccent="and values"
        items={about.values}
      />

      <FeatureList
        id="approvals"
        label={about.approvals.eyebrow}
        title="What we can show you"
        titleAccent="in writing"
        lead={about.approvals.lead}
        items={about.approvals.items}
      />

      <section className="px-gutter pt-section-sm">
        <Reveal className="container-prose rounded-card bg-surface p-8 text-center tablet:p-12">
          <p className="label-mono font-mono">Office</p>
          <address className="mt-5 font-display text-heading-sm not-italic text-ink">
            {site.address.map((line: string) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
          <p className="mt-5 text-body-sm text-ink-soft">{site.officeHours}</p>
        </Reveal>
      </section>

      {/* The closing "Come and walk the layout" band was removed on request —
          see the note in app/page.tsx. */}

      <div className="pb-section-sm" />
    </>
  );
}
