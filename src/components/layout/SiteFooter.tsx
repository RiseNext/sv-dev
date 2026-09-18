'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Container } from '@/components/ui/Section';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { anchorProps, isPlaceholder } from '@/lib/href';
import { footerNav, legal, site } from '@/content/site';
import type { NavLink } from '@/types/content';
import { Logo } from './Logo';
import { SocialLinks } from './SocialLinks';
import styles from './SiteFooter.module.css';

/* Columns collapse to accordions below 40rem. <details> carries the open/closed
   semantics natively; above the breakpoint the media query forces every column
   open and removes the accordion affordance. */
function LinkColumn({
  title,
  links,
  forcedOpen,
}: {
  title: string;
  links: readonly NavLink[];
  forcedOpen: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <details
      className={styles.column}
      open={forcedOpen || open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary className={styles.columnTitle}>
        {title}
        <Icon name="chevronDown" size={16} className={styles.chevron} />
      </summary>
      <nav aria-label={title}>
        <ul className={styles.links}>
          {links.map((link) => (
            <li key={link.label}>
              {isPlaceholder(link.href) ? (
                <a {...anchorProps(link.href)}>{link.label}</a>
              ) : (
                <Link href={link.href}>{link.label}</Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </details>
  );
}

export function SiteFooter() {
  const isWide = useMediaQuery('(min-width: 40rem)');

  return (
    <footer className={`${styles.footer} on-dark`}>
      <Container>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <Link href="/" aria-label={`${site.name} — home`}>
              <Logo variant="footer" />
            </Link>

            <p className={styles.blurb}>{site.description}</p>

            <div className={styles.contact}>
              <p className={styles.contactRow}>
                <Icon name="mail" size={18} />
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </p>
              <p className={styles.contactRow}>
                <Icon name="phone" size={18} />
                <a href={`tel:${site.phone.replace(/[^\d+]/g, '')}`}>{site.phone}</a>
              </p>
              <p className={styles.contactRow}>
                <Icon name="mapPin" size={18} />
                <address>{site.address.join(', ')}</address>
              </p>
            </div>

            <SocialLinks />
          </div>

          {footerNav.map((column) => (
            <LinkColumn
              key={column.title}
              title={column.title}
              links={column.links}
              forcedOpen={isWide}
            />
          ))}
        </div>

        <div className={styles.legal}>
          <div className={styles.legalRow}>
            <p>{legal.copyright}</p>
            <ul className={styles.legalLinks}>
              {legal.links.map((link) => (
                <li key={link.label}>
                  <a {...anchorProps(link.href)}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <p className={styles.disclaimer}>{legal.disclaimer}</p>
        </div>
      </Container>
    </footer>
  );
}
