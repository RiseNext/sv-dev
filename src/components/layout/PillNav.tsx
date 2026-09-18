'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/layout/Logo';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cx } from '@/lib/cx';
import { anchorProps, telHref } from '@/lib/href';
import { nav, site } from '@/content/site';

/* =============================================================================
   FLOATING PILL NAVIGATION

   Two groups, both fixed at 16px from the top: the brand + links centred, the
   conversion actions hard right. The bar never changes on scroll — no shrink,
   no background swap — because it already sits on its own blurred glass plate
   and does not need the page behind it to behave.

   One <nav> in the DOM at every width. Below 1024px the link pills are
   replaced by a Menu pill that opens a sheet; rendering the links twice would
   mean two sources of truth and every link announced twice.

   The bar is kept short on purpose — 36px pills inside a 3px plate — so it
   takes as little of the first screen as possible. A group with children is a
   chevron toggle at EVERY width: inline as a dropdown, and inside the sheet as
   a collapsible row, so Projects opens the same way on a phone as on a desk.
   ========================================================================== */

const INLINE_NAV = '(min-width: 64rem)';

const GLASS =
  'rounded-card border border-white/10 bg-glass p-[3px] shadow-[0_1px_2px_rgba(26,22,19,0.04)] backdrop-blur-[13px]';
/* 40px on a phone, 36px once the links go inline: the compact bar is worth it
   on a desktop, but the Menu pill is the most-tapped control on the site and
   should not be shrunk to win back four pixels. */
const PILL =
  'inline-flex min-h-10 items-center gap-1.5 rounded-pill px-3.5 text-body-sm font-medium transition-colors duration-200 tablet:min-h-9';

const slug = (label: string) => label.toLowerCase().replace(/\s+/g, '-');

export function PillNav() {
  const pathname = usePathname();
  const isInline = useMediaQuery(INLINE_NAV);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const sheetMode = menuOpen && !isInline;

  const isActive = useCallback(
    (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href)),
    [pathname],
  );

  /* Close everything on navigation and when crossing the inline breakpoint. */
  useEffect(() => {
    setMenuOpen(false);
    setOpenSubmenu(null);
  }, [pathname, isInline]);

  useEffect(() => {
    if (!sheetMode) return;
    document.body.dataset.scrollLocked = 'true';
    return () => {
      delete document.body.dataset.scrollLocked;
    };
  }, [sheetMode]);

  /* Close the desktop dropdown on an outside click. */
  useEffect(() => {
    if (!isInline || !openSubmenu) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpenSubmenu(null);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [isInline, openSubmenu]);

  const closeSheet = useCallback(() => {
    setMenuOpen(false);
    setOpenSubmenu(null);
    toggleRef.current?.focus();
  }, []);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      if (openSubmenu) setOpenSubmenu(null);
      else if (menuOpen) closeSheet();
      return;
    }

    if (event.key !== 'Tab' || !sheetMode) return;

    /* The trigger stays visible above the sheet and doubles as the close
       button, so it is the first stop in the cycle, not an escape hatch. */
    const focusable = [
      toggleRef.current,
      ...Array.from(
        sheetRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [],
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
    <div ref={rootRef} onKeyDown={onKeyDown}>
      {/* ---------- Centre group: brand + links ---------- */}
      <div className="fixed left-1/2 top-3 z-100 w-max max-w-[calc(100vw-1.5rem)] -translate-x-1/2">
        <nav aria-label="Primary" className={cx(GLASS, 'flex items-center gap-0.5')}>
          <Link
            href="/"
            aria-label={`${site.name} — home`}
            className={cx(PILL, 'bg-surface pl-1 pr-3 text-ink')}
          >
            <Logo size="xs" />
          </Link>

          {/* Links inline from 1024px up; the Menu pill below it. */}
          <ul className="hidden items-center gap-0.5 tablet:flex">
            {nav.map((item) => {
              const active = isActive(item.href);
              const expanded = openSubmenu === item.label;
              /* The sheet renders the same groups, so the inline dropdown
                 needs its own id — two elements cannot share one. */
              const submenuId = `nav-submenu-${slug(item.label)}`;

              if (!item.children) {
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cx(PILL, active ? 'bg-surface text-ink' : 'text-ink hover:bg-white/50')}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              }

              return (
                <li key={item.label} className="relative">
                  {/* Click-toggled at every width. Hover-only would strand
                      touch users on the one item that has children. */}
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={submenuId}
                    onClick={() => setOpenSubmenu(expanded ? null : item.label)}
                    className={cx(
                      PILL,
                      active || expanded ? 'bg-surface text-ink' : 'text-ink hover:bg-white/50',
                    )}
                  >
                    {item.label}
                    <Icon
                      name="chevronDown"
                      size={14}
                      className={cx('transition-transform duration-200', expanded && 'rotate-180')}
                    />
                  </button>

                  <ul
                    id={submenuId}
                    hidden={!expanded}
                    className="absolute left-1/2 top-[calc(100%+0.5rem)] w-64 -translate-x-1/2 rounded-card bg-surface p-1.5 shadow-[0_12px_40px_rgba(26,22,19,0.14)]"
                  >
                    {item.children.map((child) => {
                      const childActive = pathname === child.href;
                      return (
                        <li key={child.label}>
                          <Link
                            href={child.href}
                            aria-current={childActive ? 'page' : undefined}
                            className={cx(
                              'flex min-h-10 items-center rounded-[0.5rem] px-3 text-body-sm transition-colors',
                              childActive ? 'bg-bg text-ink' : 'text-ink-soft hover:bg-bg hover:text-ink',
                            )}
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

          <button
            ref={toggleRef}
            type="button"
            className={cx(PILL, 'bg-surface text-ink tablet:hidden')}
            aria-expanded={menuOpen}
            aria-controls="primary-navigation-sheet"
            onClick={() => (menuOpen ? closeSheet() : setMenuOpen(true))}
          >
            {menuOpen ? 'Close' : 'Menu'}
            <Icon name={menuOpen ? 'close' : 'menu'} size={18} />
          </button>
        </nav>
      </div>

      {/* ---------- Right group: the two conversion actions ---------- */}
      <div className="fixed right-3 top-3 z-100 hidden tablet:block">
        <div className={cx(GLASS, 'flex items-center gap-0.5')}>
          <a {...anchorProps(telHref(site.phone))} className={cx(PILL, 'text-ink hover:bg-white/50')}>
            <Icon name="phone" size={15} />
            Call
          </a>
          <Link href="/contact" className={cx(PILL, 'bg-surface text-ink hover:bg-white')}>
            Book a site visit
          </Link>
        </div>
      </div>

      {/* ---------- Mobile sheet ---------- */}
      <div
        hidden={!sheetMode}
        className="fixed inset-0 z-90 bg-ink/40 tablet:hidden"
        onClick={closeSheet}
        aria-hidden="true"
      />

      <div
        ref={sheetRef}
        id="primary-navigation-sheet"
        hidden={!sheetMode}
        className="fixed inset-x-3 top-3 z-95 max-h-[calc(100svh-1.5rem)] overflow-y-auto rounded-card bg-surface p-3 pt-16 shadow-[0_20px_60px_rgba(26,22,19,0.2)] tablet:hidden"
      >
        <ul className="flex flex-col">
          {nav.map((item) => {
            const active = isActive(item.href);
            const expanded = openSubmenu === item.label;
            const sheetId = `sheet-submenu-${slug(item.label)}`;
            const row = cx(
              'flex min-h-12 items-center font-display text-heading-xs',
              active ? 'text-ink' : 'text-ink-soft',
            );

            return (
              <li key={item.label} className="border-b border-line last:border-b-0">
                {item.children ? (
                  /* The label still navigates; the chevron beside it is its own
                     button, so tapping ^ reveals the projects in place instead
                     of leaving the sheet. */
                  <div className="flex items-center">
                    <Link href={item.href} aria-current={active ? 'page' : undefined} className={cx(row, 'flex-1')}>
                      {item.label}
                    </Link>
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={sheetId}
                      onClick={() => setOpenSubmenu(expanded ? null : item.label)}
                      className="-mr-2 flex size-12 items-center justify-center text-ink"
                    >
                      <span className="visually-hidden">
                        {expanded ? `Hide ${item.label}` : `Show ${item.label}`}
                      </span>
                      <Icon
                        name="chevronDown"
                        size={18}
                        className={cx('transition-transform duration-200', expanded && 'rotate-180')}
                      />
                    </button>
                  </div>
                ) : (
                  <Link href={item.href} aria-current={active ? 'page' : undefined} className={row}>
                    {item.label}
                  </Link>
                )}

                {item.children ? (
                  <ul id={sheetId} hidden={!expanded} className="pb-2">
                    {item.children.map((child) => (
                      <li key={child.label}>
                        <Link
                          href={child.href}
                          aria-current={pathname === child.href ? 'page' : undefined}
                          className={cx(
                            'flex min-h-11 items-center text-body-sm',
                            pathname === child.href ? 'text-ink' : 'text-ink-soft',
                          )}
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>

        <div className="mt-3 flex flex-col gap-2">
          <Link
            href="/contact"
            className="inline-flex min-h-11 items-center justify-center rounded-pill bg-core-black px-5 text-body-sm font-medium text-white"
          >
            Book a site visit
          </Link>
          <a
            {...anchorProps(telHref(site.phone))}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill border border-line-strong px-5 text-body-sm font-medium text-ink"
          >
            <Icon name="phone" size={16} />
            {site.phone}
          </a>
        </div>
      </div>
    </div>
  );
}
