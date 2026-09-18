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
   sections.

   Kept deliberately shallow at every width: the footer is a sign-off, not a
   second homepage, so it runs on its own compact rhythm rather than the
   section tokens the content bands use. */

export function Footer() {
  return (
    <footer className="bg-band">
      <div className="rounded-b-band bg-bg pb-10 pt-14 tablet:pt-20">
        <div className="container-page">
          <div className="grid gap-8 tablet:grid-cols-[1.1fr_1fr] tablet:gap-12">
            <div>
              <h2 className="max-w-[18ch] text-heading-md text-ink">
                Come and walk the layout. <em>Any day of the week.</em>
              </h2>
              <p className="mt-3 max-w-[46ch] text-body-sm text-ink-soft">{site.officeHours}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <LinkButton href="/contact">Book a site visit</LinkButton>
                <LinkButton href={telHref(site.phone)} variant="ghost">
                  <Icon name="phone" size={16} />
                  {site.phone}
                </LinkButton>
              </div>
            </div>

            <div className="grid gap-6 min-[30rem]:grid-cols-2 tablet:grid-cols-3">
              {footerNav.map((group) => (
                <nav key={group.title} aria-label={group.title}>
                  <h3 className="label-mono font-mono">{group.title}</h3>
                  <ul className="mt-3 flex flex-col gap-1.5">
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
                <ul className="mt-3 flex flex-col gap-1.5">
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

          <div className="mt-10 flex flex-col gap-5 border-t border-line pt-6 tablet:flex-row tablet:items-start tablet:justify-between">
            <div>
              <Logo size="xs" />
              <address className="mt-3 font-mono text-body-xs leading-relaxed text-ink-faint">
                {site.address.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            </div>

            <div className="max-w-[60ch]">
              <p className="font-mono text-body-xs text-ink-faint">{legal.copyright}</p>
              <p className="mt-2 text-body-xs text-ink-faint">{legal.disclaimer}</p>
              <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5">
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
          already announced by the logo above, so this is aria-hidden. Capped
          rather than pure vw — unbounded it alone ran past 200px of band on a
          desktop, which is most of what made the footer feel tall. */}
      <div className="overflow-hidden" aria-hidden="true">
        <p className="-mb-[0.14em] mt-4 whitespace-nowrap px-4 text-center font-display text-[clamp(2.5rem,10.5vw,6.5rem)] leading-[0.8] text-white/70 select-none">
          {site.name}
        </p>
      </div>
    </footer>
  );
}
