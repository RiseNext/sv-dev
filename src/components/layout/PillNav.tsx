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
   no background swap — because it already sits on its own plate and does not
   need the page behind it to behave.

   One <nav> in the DOM at every width. Below 1024px the link pills are
   replaced by a Menu pill that opens a full-screen overlay; rendering the links
   twice would mean two sources of truth and every link announced twice.

   ─── MOBILE: FULL-SCREEN OVERLAY ──────────────────────────────────────────
   The phone menu is not a shrunken desktop dropdown. It takes the whole
   screen and sets the links in the display serif at heading size, so the menu
   reads as part of the brand rather than as browser chrome. Call and Book a
   site visit sit at the bottom, in the thumb zone — on desktop those two live
   in the top-right group, which has no room on a phone.

   ─── WHY IT IS SMOOTH ─────────────────────────────────────────────────────
   Three rules, all of them about staying off the main thread:

   1. The overlay animates `opacity` and `transform` ONLY. Both are composited,
      so the whole panel is one GPU layer and the animation never triggers
      layout or paint. Height/top/width animations would, which is why the
      panel does not slide by growing.
   2. It stays mounted and is toggled with `inert` + `visibility`, not the
      `hidden` attribute. `hidden` removes the element outright, so there is no
      "before" state for the browser to transition from — that is why the old
      sheet popped in and out with no motion at all.
   3. `backdrop-filter` is DESKTOP ONLY. A blurred plate fixed over scrolling
      content forces the compositor to re-sample and re-blur its backdrop every
      frame; on phone GPUs that alone is enough to drop scrolling below 60fps.
      Mobile gets a plain opaque plate, which looks the same over the page and
      costs nothing.
   ========================================================================== */

const INLINE_NAV = '(min-width: 64rem)';

/* Opaque on a phone, glass from 1024px up — see rule 3 above. */
const PLATE =
  'rounded-card border border-white/10 bg-surface p-[3px] shadow-[0_1px_2px_rgba(26,22,19,0.04)] ' +
  'tablet:bg-glass tablet:backdrop-blur-[13px]';

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

  const overlayOpen = menuOpen && !isInline;

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
    if (!overlayOpen) return;
    document.body.dataset.scrollLocked = 'true';
    return () => {
      delete document.body.dataset.scrollLocked;
    };
  }, [overlayOpen]);

  /* Close the desktop dropdown on an outside click. */
  useEffect(() => {
    if (!isInline || !openSubmenu) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpenSubmenu(null);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [isInline, openSubmenu]);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setOpenSubmenu(null);
    toggleRef.current?.focus();
  }, []);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      if (openSubmenu) setOpenSubmenu(null);
      else if (menuOpen) closeMenu();
      return;
    }

    if (event.key !== 'Tab' || !overlayOpen) return;

    /* The trigger stays visible above the overlay and doubles as the close
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
        <nav aria-label="Primary" className={cx(PLATE, 'flex items-center gap-0.5')}>
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
              /* The overlay renders the same groups, so the inline dropdown
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
            aria-controls="primary-navigation-overlay"
            onClick={() => (menuOpen ? closeMenu() : setMenuOpen(true))}
          >
            {menuOpen ? 'Close' : 'Menu'}
            <Icon name={menuOpen ? 'close' : 'menu'} size={18} />
          </button>
        </nav>
      </div>

      {/* ---------- Right group: the two conversion actions ---------- */}
      <div className="fixed right-3 top-3 z-100 hidden tablet:block">
        <div className={cx(PLATE, 'flex items-center gap-0.5')}>
          <a {...anchorProps(telHref(site.phone))} className={cx(PILL, 'text-ink hover:bg-white/50')}>
            <Icon name="phone" size={15} />
            Call
          </a>
          <Link href="/contact" className={cx(PILL, 'bg-surface text-ink hover:bg-white')}>
            Book a site visit
          </Link>
        </div>
      </div>

      {/* ---------- Mobile full-screen overlay ----------
          Stays mounted so it has a state to transition from. `inert` takes it
          out of the focus order AND the accessibility tree while closed, which
          is what `hidden` used to do — without costing the animation. */}
      <div
        ref={sheetRef}
        id="primary-navigation-overlay"
        inert={!overlayOpen}
        aria-label="Site menu"
        className={cx(
          'fixed inset-0 z-95 flex flex-col overflow-y-auto overscroll-contain bg-bg',
          'px-5 pb-8 pt-20 tablet:hidden',
          'transition-[opacity,transform,visibility] duration-300 ease-out motion-reduce:transition-none',
          overlayOpen
            ? 'visible translate-y-0 opacity-100'
            : 'invisible -translate-y-1 opacity-0',
        )}
      >
        <ul className="flex flex-col">
          {nav.map((item, index) => {
            const active = isActive(item.href);
            const expanded = openSubmenu === item.label;
            const submenuId = `overlay-submenu-${slug(item.label)}`;
            const row = cx(
              'flex min-h-14 items-center font-display text-heading-md transition-colors',
              active ? 'text-ink' : 'text-ink-soft',
            );

            return (
              <li
                key={item.label}
                className={cx(
                  'border-b border-line last:border-b-0',
                  /* Links rise in one after another. Delay only on the way in;
                     closing is immediate so the menu never feels sticky. */
                  'transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none',
                  overlayOpen ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
                )}
                style={{ transitionDelay: overlayOpen ? `${80 + index * 45}ms` : '0ms' }}
              >
                {item.children ? (
                  /* The label still navigates; the chevron beside it is its own
                     button, so tapping it reveals the projects in place instead
                     of leaving the menu. */
                  <div className="flex items-center">
                    <Link href={item.href} aria-current={active ? 'page' : undefined} className={cx(row, 'flex-1')}>
                      {item.label}
                    </Link>
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={submenuId}
                      onClick={() => setOpenSubmenu(expanded ? null : item.label)}
                      className="-mr-2 flex size-14 items-center justify-center text-ink"
                    >
                      <span className="visually-hidden">
                        {expanded ? `Hide ${item.label}` : `Show ${item.label}`}
                      </span>
                      <Icon
                        name="chevronDown"
                        size={20}
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
                  <ul id={submenuId} hidden={!expanded} className="pb-3">
                    {item.children.map((child) => (
                      <li key={child.label}>
                        <Link
                          href={child.href}
                          aria-current={pathname === child.href ? 'page' : undefined}
                          className={cx(
                            'flex min-h-12 items-center text-body-sm',
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

        {/* The desktop top-right group has no room on a phone, so its two
            actions land here instead — pinned to the bottom of the overlay,
            inside thumb reach. */}
        <div
          className={cx(
            'mt-auto flex flex-col gap-2 pt-10',
            'transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none',
            overlayOpen ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
          )}
          style={{ transitionDelay: overlayOpen ? `${80 + nav.length * 45}ms` : '0ms' }}
        >
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
