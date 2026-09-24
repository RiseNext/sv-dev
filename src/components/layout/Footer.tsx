import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { Wave } from '@/components/ui/Wave';
import { Logo } from '@/components/layout/Logo';
import { buildFooterNav, legal } from '@/content/site';
import { getSiteSettings } from '@/lib/api/site';
import { getProjects } from '@/lib/api/projects';
import { anchorProps, isPlaceholder, mailHref, telHref, whatsappHref } from '@/lib/href';

/* =============================================================================
   FOOTER — the design template's closing dark band.

   Deep forest green, cut into the cream page by a wave, with the name set as
   the band's heading and four tiles beneath it: the brand and office, the
   pages, the projects, and the ways to get in touch. The legal line runs
   along the bottom. `theme-dark` flips every text token inside to its light
   value.

   A sign-off, not a second homepage: every page already closes on
   <ClosingCta> directly above this, so the footer carries the brand, the
   directory, the contact routes and the legal line, and nothing else.
   ========================================================================== */

const TILE = 'rounded-2xl border border-line bg-white/[0.06] p-6 tablet:p-7';
const TITLE = 'label-mono font-mono';
const LINK = 'text-body-sm text-ink-soft transition-colors hover:text-ink';
const META = 'font-mono text-body-xs text-ink-faint';

export async function Footer() {
  // A Server Component: it reads the CMS directly. Both calls are React-cached,
  // so rendering the footer on every page costs one request per build, not one
  // per page.
  const site = await getSiteSettings();
  const projects = await getProjects();

  // DERIVED, not a hand-maintained list of slugs.
  const footerNav = buildFooterNav(projects);
  const social = site.social ?? [];
  const hasWhatsapp = typeof site.whatsapp === 'string' && !isPlaceholder(site.whatsapp);

  return (
    <footer className="theme-dark relative mt-section bg-forest px-gutter pb-8 pt-24 tablet:pt-32">
      {/* `footer-wave`: recoloured to sand when the page ends on the sand CTA
          band — see globals.css. */}
      <Wave edge="top" className="footer-wave" />

      <div className="container-page relative">
        <div className="flex flex-col items-center text-center">
          <span
            aria-hidden="true"
            className="block h-0.5 w-14 rounded-full bg-linear-to-r from-gold-from to-gold-to"
          />
          <p className="mt-5 font-display text-heading-lg text-ink">{site.name}</p>
        </div>

        <div className="mt-12 grid gap-4 mid:grid-cols-2 tablet:grid-cols-4">
          {/* ---------- Brand and office ---------- */}
          <div className={TILE}>
            <Logo size="xs" siteName={site.name} logo={site.logo} onDark />
            <address className="mt-4 font-mono text-body-xs leading-relaxed text-ink-faint">
              {site.address.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
            {site.officeHours ? <p className="mt-3 text-body-sm text-ink-soft">{site.officeHours}</p> : null}
          </div>

          {/* ---------- The two directories ---------- */}
          {footerNav.map((group) => (
            <nav key={group.title} aria-label={group.title} className={TILE}>
              <h2 className={TITLE}>{group.title}</h2>
              <ul className="mt-4 flex flex-col gap-2">
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

          {/* ---------- Getting in touch ---------- */}
          <div className={TILE}>
            <h2 className={TITLE}>Get in touch</h2>
            <ul className="mt-4 flex flex-col gap-2.5">
              <li>
                <a {...anchorProps(telHref(site.phone))} className={`${LINK} inline-flex items-center gap-2`}>
                  <Icon name="phone" size={15} className="text-gold-ink" />
                  {site.phone}
                </a>
              </li>
              {hasWhatsapp ? (
                <li>
                  <a {...anchorProps(whatsappHref(site.whatsapp))} className={`${LINK} inline-flex items-center gap-2`}>
                    <Icon name="whatsapp" size={15} className="text-gold-ink" />
                    WhatsApp
                  </a>
                </li>
              ) : null}
              <li>
                <a {...anchorProps(mailHref(site.email))} className={`${LINK} inline-flex items-center gap-2 break-all`}>
                  <Icon name="mail" size={15} className="shrink-0 text-gold-ink" />
                  {site.email}
                </a>
              </li>
            </ul>

            {social.length ? (
              <ul className="mt-5 flex items-center gap-1">
                {social.map((item) => (
                  <li key={item.label}>
                    <a
                      {...anchorProps(item.href)}
                      aria-label={item.label}
                      className="flex size-9 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-white/10 hover:text-ink"
                    >
                      <Icon name={item.icon} size={17} />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        {/* ---------- Legal line ---------- */}
        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-6">
          <p className={`${META} max-w-[90ch] leading-relaxed`}>
            {site.copyrightText} {legal.disclaimer}
          </p>
          {(site.legalLinks ?? []).length ? (
            <ul className="flex flex-wrap gap-x-5 gap-y-1.5">
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
          ) : null}
        </div>
      </div>
    </footer>
  );
}
