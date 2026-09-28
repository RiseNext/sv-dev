'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/layout/Logo';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cx } from '@/lib/cx';
import { anchorProps, telHref } from '@/lib/href';
import type { ImageRef, NavLink } from '@/types/content';

/* =============================================================================
   TOP NAVIGATION — THE FULL-WIDTH BAR

   🔴 THE BAR IS FULL-WIDTH AND FLUSH WITH THE TOP OF THE VIEWPORT. It runs
   left screen edge to right, pinned at `top-0` with NO gap above it and NO
   rounded ends. The floating inset capsule this replaced was wrong — the bar
   is the topmost edge of the page, not an object sitting on it. Cream, a gold
   hairline along its bottom, a soft warm shadow, and the page scrolls beneath.

   The BAR ITSELF spans the screen; its CONTENTS are held to `container-page`,
   so the emblem and the links line up with the page's own gutter rather than
   jamming into the screen edge.

   ─── THE EMBLEM HANGS BELOW, NEVER ABOVE ──────────────────────────────────
   At advertisement scale the emblem (128px) is taller than the bar (88px), and
   with the bar flush to the top there is no room above it — anything hanging
   up there is cut off by the viewport. So it is TOP-ALIGNED (`self-start`)
   with a few pixels of inset and spills downward only. On a phone it is
   smaller than the bar and simply centres.

   ─── THE NUMBERS EVERY "CLEAR THE NAV" OFFSET DEPENDS ON ───────────────────
   Bar 64px tall on a phone, 88px from 1024px, starting at y=0. On a phone
   nothing overhangs it, so the nav ends at 64px; from 1024px the emblem hangs
   to 132px. Hero's `pt-24 tablet:pt-36` clears both, as does
   `scroll-padding-top` in globals.css.

   ─── WHAT IS IN THE BAR, AND WHERE ────────────────────────────────────────
   TWO GROUPS, HARD LEFT AND HARD RIGHT, with the whole middle left empty. The
   emblem alone on the left; the links AND Book a site visit together on the
   right. That gap is deliberate — it is what lets the emblem read as a brand
   mark rather than as the first item in a toolbar.

   Links are Home · About Us · Projects. Contact Us is NOT among them and Call
   is not in the bar: /contact is what the gold CTA at the right end is for, so
   a text link to it beside the button was the same destination twice. Both
   still reach the user from the footer and, on a phone, from the menu overlay.

   One <nav> in the DOM at every width. Below 1024px the links are replaced by a
   Menu button opening a full-screen overlay; rendering the links twice would
   mean two sources of truth and every link announced twice.

   The bar carries NO `overflow-hidden`: the Projects dropdown and the emblem
   both hang below it, so clipping the bar would clip them.
   ========================================================================== */

const INLINE_NAV = '(min-width: 64rem)';

/* 🔴 THESE FOUR MOVE TOGETHER, and the arithmetic is the whole point:

     BADGE.sm in Logo.tsx = medallion − 8   (its 2px ring + 2px band per side)

   Phone: bar 64, medallion 52, badge 44 — fully contained, nothing overhangs.

   🔴 FROM 1024px THE EMBLEM IS BIGGER THAN THE BAR, ON PURPOSE: bar 88,
   medallion 128, badge 120. The brand has to read at advertisement scale and
   THE BAR MUST NOT GROW TO SUIT IT — a 120px-tall bar was tried and was wrong;
   it turned the nav into a block. So the emblem hangs 44px BELOW the bar
   instead, while staying inside the page gutter horizontally. The bar keeps
   its slim proportion, the mark gets its size.

   This works only because the bar's height is fixed (`h-22`, not `min-h-`) and
   it carries no `overflow-hidden` — a taller flex child then spills out of it
   instead of stretching it. */
const MEDALLION_SIZE = 'size-13 tablet:size-32'; /* 52px / 128px */
const BAR_HEIGHT = 'h-16 tablet:h-22'; /* 64px / 88px */

/* The medallion's frame, kept DELIBERATELY THIN now that it lives inside the
   bar: a 2px gold ring and a 2px white band, no more. The heavier ring the
   overhanging version carried ate 18px of a circle that is now 52px on a phone,
   which left the wordmark under the mark illegible. No drop shadow either — it
   is on the bar, not above it, and a shadow here only reads as grime. */
const MEDALLION = cx(
  /* `inline-flex` is load-bearing: <a> is inline by default, and width/height
     do not apply to an inline box. It is a flex item here so it would be
     blockified anyway — but that makes the size depend on the parent, which is
     not a thing this frame's geometry should be able to lose. */
  'inline-flex shrink-0 items-center justify-center',
  'rounded-full border-2 border-gold bg-white p-0.5',
);

/* THE BAR'S SURFACE — a lit top edge, a gold hairline along the BOTTOM ONLY
   (the other three sides are the screen edge now, so a ring all the way round
   would draw a line down the left and right of the viewport), and a soft warm
   shadow the page scrolls under.

   🔴 ONE UNBROKEN STRING LITERAL. Tailwind scans source text for whole class
   names, so an arbitrary value split across a `+` join generates NO rule. */
const BAR = cx(
  'bg-linear-to-b from-[#fffdf7] to-[#fdf6e6]',
  'shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(196,161,98,0.38),0_2px_6px_rgba(122,90,34,0.06),0_14px_32px_-20px_rgba(122,90,34,0.55)]',
);

/* Links are set medium in full ink — dark enough to be read as buttons, light
   enough that the gold CTA still wins. The current page sits in a filled
   gold-mid pill with no rim; every other link washes pale gold on hover. */
const LINK =
  'inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 text-[1.0625rem] font-medium text-ink ' +
  'transition-colors duration-200 motion-reduce:transition-none';
const LINK_IDLE = 'hover:bg-gold-soft/60';
const LINK_CURRENT = 'bg-gold-mid';

/* The CTA — solid gold, lit from the top-left, with an inner gold rim and a
   shadow that deepens as it lifts. Since Call was taken out of the bar this is
   the ONLY control at the right-hand end, which is the point: one destination,
   no competing pill beside it. Call still reaches the user from the footer and,
   on a phone, from the overlay. */
const CTA = cx(
  'group inline-flex items-center gap-2.5 rounded-full bg-linear-to-br from-gold-to to-gold font-semibold text-core-black',
  'shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_18px_-8px_rgba(122,90,34,0.7)]',
  'ring-1 ring-inset ring-gold-deep/40',
  'transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:to-gold-deep',
  'hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_14px_26px_-10px_rgba(122,90,34,0.75)]',
  'motion-reduce:transition-none motion-reduce:hover:translate-y-0',
);

/* THE DROPDOWN'S SURFACE — a rim plus three shadows. An opaque cream card on a
   cream page dissolves into it without an edge; the rim guarantees one, and the
   shadows lift it off the page. */
const MENU_SURFACE =
  'shadow-[inset_0_0_0_1px_rgba(122,90,34,0.14),0_2px_4px_rgba(122,90,34,0.08),0_12px_24px_-8px_rgba(122,90,34,0.22),0_32px_56px_-16px_rgba(122,90,34,0.28)]';

const slug = (label: string) => label.toLowerCase().replace(/\s+/g, '-');

/* 🔴 A 'use client' MODULE CANNOT FETCH. Everything it needs is threaded down
   from the root layout, which is a Server Component.

   `nav` is DERIVED from the published project list rather than being a
   hardcoded array of slugs — so a project added in the CMS appears in the
   dropdown. */
export function PillNav({
  nav,
  siteName,
  phone,
  logo,
}: {
  nav: readonly NavLink[];
  siteName: string;
  phone: string;
  logo?: ImageRef;
}) {
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
      {/* 🔴 THE PAINTED SURFACE IS THE <header>, NOT THE <nav>. The header
          spans the viewport so the cream runs edge to edge and sits flush at
          `top-0`; the nav inside it is `container-page`, so the contents stop
          at the page gutter. Painting the nav instead would shrink the bar to
          the container's width and leave the screen edges bare. */}
      <header className={cx('fixed inset-x-0 top-0 z-100', BAR)}>
        <nav
          aria-label="Primary"
          className={cx('container-page relative flex items-center gap-3 tablet:gap-5', BAR_HEIGHT)}
        >
          {/* The emblem, hard left.

              `self-start` + `mt-1` from 1024px: at 108px it is taller than the
              88px bar, and the bar is flush with the top of the screen, so
              centring it would push 10px of the circle off-screen. Top-aligned,
              the whole overhang falls BELOW the bar where there is room. On a
              phone it is smaller than the bar and inherits `items-center`.

              `prefetch={false}` because this is the THIRD link to `/` on
              every page (the Home link and the overlay's copy of it both
              point here, and both keep their prefetch), so prefetching it
              again buys nothing. */}
          <Link
            href="/"
            aria-label={`${siteName} — home`}
            prefetch={false}
            className={cx(MEDALLION, MEDALLION_SIZE, 'tablet:mt-1 tablet:self-start')}
          >
            <Logo siteName={siteName} logo={logo} size="sm" showName={false} />
          </Link>

            {/* `ml-auto` here is what pushes the links AND everything after
                them to the right cap, leaving the emblem alone on the left. */}
            <ul className="ml-auto hidden items-center gap-1 tablet:flex">
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
                        className={cx(LINK, active ? LINK_CURRENT : LINK_IDLE)}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                }

                return (
                  <li key={item.label} className="relative">
                    {/* Click-toggled. Hover-only would strand touch users on
                        the one item that has children. */}
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={submenuId}
                      onClick={() => setOpenSubmenu(expanded ? null : item.label)}
                      className={cx(LINK, active || expanded ? LINK_CURRENT : LINK_IDLE)}
                    >
                      {item.label}
                      <Icon
                        name="chevronDown"
                        size={15}
                        className={cx('transition-transform duration-200', expanded && 'rotate-180')}
                      />
                    </button>

                    {/* Hangs clear of the capsule: the link is 40px tall,
                        centred in the 88px bar, so its box ends 24px short of
                        the bar's edge — 2rem puts the panel 8px below it.

                        STAYS MOUNTED, toggled with `inert` + `visibility`, so
                        it has a state to transition from; `inert` keeps a
                        closed menu out of the tab order and the accessibility
                        tree. */}
                    <ul
                      id={submenuId}
                      inert={!expanded}
                      className={cx(
                        'absolute left-1/2 top-[calc(100%+2rem)] w-64 -translate-x-1/2 rounded-card bg-surface p-1.5',
                        MENU_SURFACE,
                        'transition-[opacity,transform,visibility] duration-200 ease-out-soft',
                        'motion-reduce:transition-none',
                        expanded
                          ? 'visible translate-y-0 opacity-100'
                          : 'invisible -translate-y-1 opacity-0',
                      )}
                    >
                      {item.children.map((child) => {
                        const childActive = pathname === child.href;
                        return (
                          <li key={child.label}>
                            <Link
                              href={child.href}
                              aria-current={childActive ? 'page' : undefined}
                              className={cx(
                                'flex min-h-10 items-center rounded-lg px-3 text-body-sm transition-colors',
                                childActive
                                  ? 'bg-gold-soft text-ink'
                                  : 'text-ink-soft hover:bg-gold-soft/55 hover:text-ink',
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

            {/* The CTA, immediately after the links — NOT `ml-auto`. The <ul>
                above already claimed the slack, so this sits tight against the
                links as the last item in the right-hand group. */}
            <div className="hidden shrink-0 items-center tablet:flex">
              <Link href="/contact" className={cx(CTA, 'min-h-11 px-6 text-[1.0625rem]')}>
                Book a site visit
                <Icon
                  name="arrowRight"
                  size={17}
                  className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
                />
              </Link>
            </div>

            {/* 🔴 BELOW 1024px THE DESIGN IS OURS, NOT THE PASTED ONE — the
                comp only covers desktop.

                The bar holds the MENU BUTTON ALONE. Book a site visit and Call
                both live behind it, at the foot of the overlay: a second gold
                pill beside Menu crowded a 64px bar rather than making the CTA
                easier to reach. Nothing is lost — the overlay puts both in the
                thumb zone, full width. */}
            <div className="ml-auto flex shrink-0 items-center tablet:hidden">
              <button
                ref={toggleRef}
                type="button"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border-[1.5px] border-gold-line bg-surface px-4 text-[1.0625rem] font-medium text-ink"
                aria-expanded={menuOpen}
                aria-controls="primary-navigation-overlay"
                onClick={() => (menuOpen ? closeMenu() : setMenuOpen(true))}
              >
                <Icon name={menuOpen ? 'close' : 'menu'} size={18} />
                {menuOpen ? 'Close' : 'Menu'}
              </button>
            </div>
        </nav>
      </header>

      {/* ---------- Mobile full-screen overlay ----------
          Stays mounted so it has a state to transition from. `inert` takes it
          out of the focus order AND the accessibility tree while closed.
          `pt-24` (96px) clears the nav, which reaches 76px on a phone; the
          header sits above this on z-index. */}
      <div
        ref={sheetRef}
        id="primary-navigation-overlay"
        inert={!overlayOpen}
        aria-label="Site menu"
        className={cx(
          'fixed inset-0 z-95 flex flex-col overflow-y-auto overscroll-contain bg-bg',
          'px-5 pb-8 pt-24 tablet:hidden',
          'transition-[opacity,transform,visibility] duration-300 ease-out motion-reduce:transition-none',
          overlayOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0',
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
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cx(row, 'flex-1')}
                    >
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

        {/* BOTH of the capsule's actions live here on a phone — the menu button
            is the only thing in the bar, so this is the ONLY route to the CTA
            below 1024px. It gets the full desktop treatment (gradient gold, the
            arrow) at full width, pinned to the bottom inside thumb reach. */}
        <div
          className={cx(
            'mt-auto flex flex-col gap-2 pt-10',
            'transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none',
            overlayOpen ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
          )}
          style={{ transitionDelay: overlayOpen ? `${80 + nav.length * 45}ms` : '0ms' }}
        >
          <Link href="/contact" className={cx(CTA, 'min-h-13 justify-center px-5 text-body-md')}>
            Book a site visit
            <Icon name="arrowRight" size={17} />
          </Link>
          <a
            {...anchorProps(telHref(phone))}
            className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full border-[1.5px] border-gold-line bg-surface px-5 text-body-md font-medium text-ink"
          >
            <Icon name="phone" size={17} />
            {phone}
          </a>
        </div>
      </div>
    </div>
  );
}
