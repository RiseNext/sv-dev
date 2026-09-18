import Link from 'next/link';
import { LinkButton } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/layout/Logo';
import { footerNav, legal, site, social } from '@/content/site';
import { anchorProps, telHref } from '@/lib/href';

/* The page ends on a colour band with the wordmark set large enough to be
   clipped by it. Above the band the content block keeps the page background
   and rounds its bottom corners, so the band shows through the corners —
   which is what makes the whole page read as one card rather than a stack of
   sections. */

export function Footer() {
  return (
    <footer className="bg-band">
      <div className="rounded-b-band bg-bg pb-16 pt-section-sm">
        <div className="container-page">
          <div className="grid gap-12 tablet:grid-cols-[1.1fr_1fr] tablet:gap-16">
            <div>
              <h2 className="max-w-[14ch] text-heading-lg text-ink">
                Come and walk the layout. <em>Any day of the week.</em>
              </h2>
              <p className="mt-5 max-w-[46ch] text-body-md text-ink-soft">{site.officeHours}</p>
              <div className="mt-7 flex flex-wrap gap-2">
                <LinkButton href="/contact">Book a site visit</LinkButton>
                <LinkButton href={telHref(site.phone)} variant="ghost">
                  <Icon name="phone" size={16} />
                  {site.phone}
                </LinkButton>
              </div>
            </div>

            <div className="grid gap-8 min-[30rem]:grid-cols-2 tablet:grid-cols-3">
              {footerNav.map((group) => (
                <nav key={group.title} aria-label={group.title}>
                  <h3 className="label-mono font-mono">{group.title}</h3>
                  <ul className="mt-4 flex flex-col gap-2.5">
                    {group.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="text-body-sm text-ink-soft transition-colors hover:text-ink"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}

              <div>
                <h3 className="label-mono font-mono">Social</h3>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {social.map((item) => (
                    <li key={item.label}>
                      <a
                        {...anchorProps(item.href)}
                        className="inline-flex items-center gap-2 text-body-sm text-ink-soft transition-colors hover:text-ink"
                      >
                        <Icon name={item.icon} size={16} />
                        {item.label}
                      </a>
                    </li>
                  ))}
                  <li>
                    <a
                      {...anchorProps(`mailto:${site.email}`)}
                      className="inline-flex items-center gap-2 text-body-sm text-ink-soft transition-colors hover:text-ink"
                    >
                      <Icon name="mail" size={16} />
                      {site.email}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-16 flex flex-col gap-6 border-t border-line pt-8 tablet:flex-row tablet:items-start tablet:justify-between">
            <div>
              <Logo />
              <address className="mt-4 font-mono text-body-xs leading-relaxed text-ink-faint">
                {site.address.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            </div>

            <div className="max-w-[60ch]">
              <p className="font-mono text-body-xs text-ink-faint">{legal.copyright}</p>
              <p className="mt-3 text-body-xs text-ink-faint">{legal.disclaimer}</p>
              <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                {legal.links.map((link) => (
                  <li key={link.label}>
                    <a
                      {...anchorProps(link.href)}
                      className="font-mono text-body-xs text-ink-faint underline-offset-4 hover:text-ink hover:underline"
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
          already announced by the logo above, so this is aria-hidden. */}
      <div className="overflow-hidden" aria-hidden="true">
        <p className="-mb-[0.14em] mt-6 whitespace-nowrap px-4 text-center font-display text-[15.5vw] leading-[0.8] text-white/70 select-none">
          {site.name}
        </p>
      </div>
    </footer>
  );
}
