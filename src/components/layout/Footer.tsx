import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/layout/Logo';
import { buildFooterNav, legal } from '@/content/site';
import { getSiteSettings } from '@/lib/api/site';
import { getProjects } from '@/lib/api/projects';
import { anchorProps, mailHref, telHref } from '@/lib/href';

/* The page ends on a colour band with the wordmark set large enough to be
   clipped by it. Above the band the content block keeps the page background
   and rounds its bottom corners, so the band shows through the corners —
   which is what makes the whole page read as one card rather than a stack of
   sections.

   A sign-off, not a second homepage. Every page already closes on <ClosingCta>
   — a full band with a heading and two buttons — directly above this, so the
   footer no longer repeats that ask: it carries the brand, the directory, the
   two ways to reach the office and the legal line, and nothing else. One
   compact rhythm serves every width rather than a phone layout that unfolds
   into four columns.
   ========================================================================== */

const LINK = 'text-body-sm text-ink-soft transition-colors hover:text-ink';
const META = 'font-mono text-body-xs text-ink-faint';

export async function Footer() {
  // A Server Component: it reads the CMS directly. Both calls are React-cached,
  // so rendering the footer on every page costs one request per build, not one
  // per page.
  const site = await getSiteSettings();
  const projects = await getProjects();

  // DERIVED, not a hand-maintained list of five slugs.
  const footerNav = buildFooterNav(projects);
  const social = site.social ?? [];

  return (
    <footer className="bg-band">
      <div className="rounded-b-band bg-bg pb-8 pt-12 tablet:pb-10 tablet:pt-16">
        <div className="container-page">
          <div className="grid gap-8 tablet:grid-cols-[minmax(0,1fr)_auto] tablet:gap-16">
            {/* ---------- Brand and the two live contact routes ---------- */}
            <div>
              <Logo size="xs" siteName={site.name} logo={site.logo} />
              <address className="mt-3 font-mono text-body-xs leading-normal text-ink-faint">
                {site.address.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
              <p className="mt-3 text-body-sm text-ink-soft">{site.officeHours}</p>

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
                <a
                  {...anchorProps(telHref(site.phone))}
                  className={`${LINK} inline-flex items-center gap-1.5`}
                >
                  <Icon name="phone" size={15} />
                  {site.phone}
                </a>
                <a
                  {...anchorProps(mailHref(site.email))}
                  className={`${LINK} inline-flex items-center gap-1.5`}
                >
                  <Icon name="mail" size={15} />
                  {site.email}
                </a>
              </div>
            </div>

            {/* Two columns from the narrowest phone up — stacked, the groups
                ran to roughly twenty rows, on their own more scrolling than
                the rest of the footer put together. */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-6 tablet:gap-x-16">
              {footerNav.map((group) => (
                <nav key={group.title} aria-label={group.title}>
                  <h2 className="label-mono font-mono">{group.title}</h2>
                  <ul className="mt-3 flex flex-col gap-1.5">
                    {group.links.map((link) => (
                      <li key={link.label}>
                        <Link href={link.href} className={LINK}>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>
          </div>

          {/* ---------- Legal line ----------
              Social is three icons here rather than a labelled column: the
              names added four rows and told a visitor nothing the mark does
              not. Each keeps its accessible name. */}
          <div className="mt-8 flex flex-col gap-4 border-t border-line pt-5 tablet:flex-row-reverse tablet:items-start tablet:justify-between tablet:gap-8">
            <ul className="flex items-center gap-1">
              {social.map((item) => (
                <li key={item.label}>
                  <a
                    {...anchorProps(item.href)}
                    aria-label={item.label}
                    className="flex size-9 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-surface hover:text-ink"
                  >
                    <Icon name={item.icon} size={17} />
                  </a>
                </li>
              ))}
            </ul>

            <div className="max-w-[68ch]">
              <p className={`${META} leading-relaxed`}>
                {site.copyrightText} {legal.disclaimer}
              </p>
              <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5">
                {(site.legalLinks ?? []).map((link) => (
                  <li key={link.label}>
                    <a
                      {...anchorProps(link.href)}
                      className={`${META} underline-offset-4 hover:text-ink hover:underline`}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Oversized wordmark, clipped by the band. Decorative: the name is
          already announced by the logo above, so this is aria-hidden. Capped
          rather than pure vw — unbounded it alone ran past 200px of band on a
          desktop, which is most of what made the footer feel tall. */}
      <div className="overflow-hidden" aria-hidden="true">
        <p className="-mb-[0.14em] mt-4 whitespace-nowrap px-4 text-center font-display text-[clamp(2.25rem,9vw,5.5rem)] leading-[0.8] text-white/70 select-none">
          {site.name}
        </p>
      </div>
    </footer>
  );
}
