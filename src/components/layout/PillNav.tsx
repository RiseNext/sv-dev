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
   ========================================================================== */

const INLINE_NAV = '(min-width: 64rem)';

const GLASS =
  'rounded-card border border-white/10 bg-glass p-1 shadow-[0_1px_2px_rgba(26,22,19,0.04)] backdrop-blur-[13px]';
const PILL =
  'inline-flex min-h-11 items-center gap-2 rounded-pill px-4 text-body-sm font-medium transition-colors duration-200';

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
      <div className="fixed left-1/2 top-4 z-100 w-max -translate-x-1/2">
        <nav aria-label="Primary" className={cx(GLASS, 'flex items-center gap-1')}>
          <Link
            href="/"
            aria-label={`${site.name} — home`}
            className={cx(PILL, 'bg-surface pl-1.5 pr-4 text-ink')}
          >
            <Logo />
          </Link>

          {/* Links inline from 1024px up; the Menu pill below it. */}
          <ul className="hidden items-center gap-1 tablet:flex">
            {nav.map((item) => {
              const active = isActive(item.href);
              const expanded = openSubmenu === item.label;
              const submenuId = `submenu-${item.label.toLowerCase().replace(/\s+/g, '-')}`;

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
                      size={15}
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
      <div className="fixed right-4 top-4 z-100 hidden tablet:block">
        <div className={cx(GLASS, 'flex items-center gap-1')}>
          <a {...anchorProps(telHref(site.phone))} className={cx(PILL, 'text-ink hover:bg-white/50')}>
            <Icon name="phone" size={16} />
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
        className="fixed inset-x-3 top-3 z-95 rounded-card bg-surface p-3 pt-20 shadow-[0_20px_60px_rgba(26,22,19,0.2)] tablet:hidden"
      >
        <ul className="flex flex-col">
          {nav.map((item) => (
            <li key={item.label} className="border-b border-line last:border-b-0">
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={cx(
                  'flex min-h-14 items-center font-display text-heading-sm',
                  isActive(item.href) ? 'text-ink' : 'text-ink-soft',
                )}
              >
                {item.label}
              </Link>

              {item.children ? (
                <ul className="pb-3">
                  {item.children.map((child) => (
                    <li key={child.label}>
                      <Link
                        href={child.href}
                        className="flex min-h-11 items-center text-body-sm text-ink-soft"
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>

        <div className="mt-4 flex flex-col gap-2">
          <Link
            href="/contact"
            className="inline-flex min-h-12 items-center justify-center rounded-pill bg-core-black px-5 text-body-sm font-medium text-white"
          >
            Book a site visit
          </Link>
          <a
            {...anchorProps(telHref(site.phone))}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-pill border border-line-strong px-5 text-body-sm font-medium text-ink"
          >
            <Icon name="phone" size={16} />
            {site.phone}
          </a>
        </div>
      </div>
    </div>
  );
}
