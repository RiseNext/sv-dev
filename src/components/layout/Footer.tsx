import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { FooterWordmark } from '@/components/layout/FooterWordmark';
import { Logo } from '@/components/layout/Logo';
import { buildFooterNav, legal, socialFallback } from '@/content/site';
import { getSiteSettings } from '@/lib/api/site';
import { getProjects } from '@/lib/api/projects';
import { anchorProps, mailHref, telHref } from '@/lib/href';

/* The page ends on a deep green band carrying the name in cream. Above the
   band the content block runs on the footer's own cream — a step richer than
   the page, so the footer reads as the sign-off and not as more page — and
   rounds its bottom corners, so the green shows through the corners. That cut
   is what makes the whole page read as one card rather than a stack of
   sections.

   A sign-off, not a second homepage: it carries the brand, the directory, the
   two ways to reach the office and the legal line, and nothing else. One
   compact rhythm serves every width rather than a phone layout that unfolds
   into four columns.

   ⚠️ This used to say "every page already closes on <ClosingCta> directly above
   this, so the footer no longer repeats that ask". That band was removed from
   every page on request, so the footer's contact column is now the last thing
   before the legal line. Left deliberately unchanged regardless — the reasoning
   above is about the footer not being a second homepage, which still holds.
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
  /* `?.length`, not `??` — the CMS omitting the field and the CMS returning an
     empty array mean the same thing here, and only the second was ever going to
     be the real case once someone adds the field but leaves it blank. */
  const social = site.social?.length ? site.social : socialFallback;

  return (
    <footer className="bg-footer-band">
      <div className="rounded-b-band bg-footer-cream pb-6 pt-8 tablet:pb-8 tablet:pt-10">
        <div className="container-page">
          <div className="grid gap-6 tablet:grid-cols-[minmax(0,1fr)_auto] tablet:gap-12">
            {/* ---------- Brand and the two live contact routes ---------- */}
            <div>
              <Logo size="xs" siteName={site.name} logo={site.logo} />
              <address className="mt-2.5 font-mono text-body-xs leading-normal text-ink-faint">
                {site.address.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
              <p className="mt-2 text-body-sm text-ink-soft">{site.officeHours}</p>

              <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1.5">
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
            <div className="grid grid-cols-2 gap-x-6 gap-y-5 tablet:gap-x-12">
              {footerNav.map((group) => (
                <nav key={group.title} aria-label={group.title}>
                  <h2 className="label-mono font-mono">{group.title}</h2>
                  <ul className="mt-2 flex flex-col gap-1">
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
          <div className="mt-6 flex flex-col gap-3 border-t border-line pt-4 tablet:flex-row-reverse tablet:items-start tablet:justify-between tablet:gap-8">
            <ul className="flex items-center gap-1">
              {social.map((item) => (
                <li key={item.label}>
                  <a
                    {...anchorProps(item.href)}
                    aria-label={item.label}
                    className="flex size-8 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-surface hover:text-ink"
                  >
                    <Icon name={item.icon} size={16} />
                  </a>
                </li>
              ))}
            </ul>

            <div className="max-w-[68ch]">
              <p className={`${META} leading-relaxed`}>
                {site.copyrightText} {legal.disclaimer}
              </p>
              <ul className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1.5">
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

      {/* The wordmark, drawn up out of the band as it scrolls into view. Its
          size is what sets the band's height — see FILL in that file, which is
          the knob for how much of the page's end this takes.
          A client component because the reveal
          needs an IntersectionObserver — see FooterWordmark for why it cannot
          reuse the shared <Reveal>. */}
      <FooterWordmark name={site.name} />
    </footer>
  );
}
