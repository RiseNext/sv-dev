'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { LinkButton } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Container } from '@/components/ui/Section';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useScrolled } from '@/hooks/useScrolled';
import { cx } from '@/lib/cx';
import { nav, site } from '@/content/site';
import { Logo } from './Logo';
import { SocialLinks } from './SocialLinks';
import styles from './SiteHeader.module.css';

const INLINE_NAV = '(min-width: 64rem)';

export function SiteHeader() {
  const pathname = usePathname();
  const scrolled = useScrolled(64);
  const isInline = useMediaQuery(INLINE_NAV);

  const [menuOpen, setMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const headerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const panelMode = menuOpen && !isInline;

  const isActive = useCallback(
    (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href)),
    [pathname],
  );

  /* Close everything on navigation. */
  useEffect(() => {
    setMenuOpen(false);
    setOpenSubmenu(null);
  }, [pathname]);

  /* Collapse panel state when crossing the inline-nav breakpoint. */
  useEffect(() => {
    setMenuOpen(false);
    setOpenSubmenu(null);
  }, [isInline]);

  /* Body scroll lock while the panel is open. */
  useEffect(() => {
    if (!panelMode) return;
    document.body.dataset.scrollLocked = 'true';
    return () => {
      delete document.body.dataset.scrollLocked;
    };
  }, [panelMode]);

  /* Close the inline dropdown on an outside click. */
  useEffect(() => {
    if (!isInline || !openSubmenu) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setOpenSubmenu(null);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [isInline, openSubmenu]);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setOpenSubmenu(null);
    toggleRef.current?.focus();
  }, []);

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') {
      if (openSubmenu) setOpenSubmenu(null);
      else if (menuOpen) closeMenu();
      return;
    }

    if (event.key !== 'Tab' || !panelMode) return;

    /* The trigger stays visible above the panel and doubles as the close
       button, so it is the first stop in the cycle, not an escape hatch. */
    const focusable = [
      toggleRef.current,
      ...Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [],
      ),
    ].filter((el): el is HTMLElement => !!el && el.getClientRects().length > 0);

    if (focusable.length < 2) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <header
      ref={headerRef}
      className={cx(styles.header, 'on-dark', scrolled && styles.scrolled, menuOpen && styles.open)}
      onKeyDown={onKeyDown}
    >
      <Container className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label={`${site.name} — home`}>
          <Logo />
        </Link>

        <button
          ref={toggleRef}
          type="button"
          className={styles.toggle}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => (menuOpen ? closeMenu() : setMenuOpen(true))}
        >
          <Icon name={menuOpen ? 'close' : 'menu'} size={24} />
          <span className="visually-hidden">{menuOpen ? 'Close menu' : 'Open menu'}</span>
        </button>

        <div
          className={cx(styles.backdrop, panelMode && styles.backdropOpen)}
          onClick={closeMenu}
          aria-hidden="true"
        />

        <nav
          ref={panelRef}
          id="primary-navigation"
          aria-label="Primary"
          className={cx(styles.nav, panelMode && styles.navOpen)}
        >
          <ul className={styles.list}>
            {nav.map((item) => {
              const expanded = openSubmenu === item.label;
              const submenuId = `submenu-${item.label.toLowerCase().replace(/\s+/g, '-')}`;
              const active = isActive(item.href);

              if (!item.children) {
                return (
                  <li key={item.label} className={styles.item}>
                    <Link
                      href={item.href}
                      className={cx(styles.link, active && styles.active)}
                      aria-current={active ? 'page' : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              }

              return (
                <li key={item.label} className={styles.item}>
                  {/* Click-toggled at every width. Hover-only would strand
                      touch users on the one item that has children. */}
                  <button
                    type="button"
                    className={cx(styles.link, active && styles.active)}
                    aria-expanded={expanded}
                    aria-controls={submenuId}
                    onClick={() => setOpenSubmenu(expanded ? null : item.label)}
                  >
                    {item.label}
                    <Icon name="chevronDown" size={16} className={styles.chevron} />
                  </button>
                  <ul id={submenuId} className={cx(styles.submenu, expanded && styles.submenuOpen)}>
                    {item.children.map((child) => {
                      const childActive = pathname === child.href;
                      return (
                        <li key={child.label}>
                          <Link
                            href={child.href}
                            className={cx(styles.submenuLink, childActive && styles.submenuActive)}
                            aria-current={childActive ? 'page' : undefined}
                          >
                            {child.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })}
          </ul>

          <div className={styles.panelFooter}>
            <LinkButton href="/contact" variant="accent" className={styles.panelCta}>
              Book a site visit
            </LinkButton>
            <SocialLinks />
          </div>
        </nav>

        <LinkButton href="/contact" variant="accent" className={styles.barCta}>
          Book a site visit
        </LinkButton>
      </Container>
    </header>
  );
}
