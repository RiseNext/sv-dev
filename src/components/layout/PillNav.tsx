'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/layout/Logo';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cx } from '@/lib/cx';
import { anchorProps, telHref } from '@/lib/href';
import type { ImageRef, NavLink } from '@/types/content';

/* =============================================================================
   TOP NAVIGATION BAR

   One full-bleed bar pinned to the very top edge of the page — edge to edge,
   no margin, no floating plate. Brand hard left, links centred on the page
   axis, the two conversion actions hard right. The bar never changes on
   scroll — no shrink, no background swap — because it is already its own
   surface and does not need the page behind it to behave.

   The links are centred with `absolute left-1/2` rather than by flex spacing:
   the brand and the action group are different widths, so a plain
   `justify-between` would push the links off the page's optical centre.

   One <nav> in the DOM at every width. Below 1024px the link pills are
   replaced by a Menu pill that opens a full-screen overlay; rendering the links
   twice would mean two sources of truth and every link announced twice.

   ─── MOBILE: FULL-SCREEN OVERLAY ──────────────────────────────────────────
   The phone menu is not a shrunken desktop dropdown. It takes the whole
   screen and sets the links in the display serif at heading size, so the menu
   reads as part of the brand rather than as browser chrome. Call and Book a
   site visit sit at the bottom, in the thumb zone — on desktop those two live
   in the top-right of the bar, which has no room on a phone.

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
   3. `backdrop-filter` runs at every width, but NOT at the same radius. A
      blurred bar fixed over scrolling content makes the compositor re-sample
      and re-blur its backdrop every frame, and that cost scales with the
      radius — enough, at a desktop radius, to drop phone scrolling below
      60fps. Phones get 18px, desktop 26px; the values live on `glass-bar` in
      globals.css.

   4. The bar carries NO `overflow-hidden`. The Projects dropdown is a child of
      the bar and hangs below it, so clipping the bar would clip the menu; the
      gloss is painted by a gradient and an inset shadow, neither of which
      needs an overflow context.
   ========================================================================== */

const INLINE_NAV = '(min-width: 64rem)';

/* Glass at every width — the gradient, the blur, the saturation, the lit top
   edge and the closing hairline all live in `glass-bar` in globals.css, so the
   bar's material is one thing to re-skin rather than six classes to keep in
   sync. See rule 3 above for why the blur radius is not the same on a phone. */
const BAR = 'glass-bar';

/* The bar's height, and the value every "clear the nav" offset is derived
   from: 64px on a phone, 80px once the links go inline. */
const BAR_HEIGHT = 'h-16 tablet:h-20';

/* 40px everywhere now. The bar has the room, and the Menu pill is the
   most-tapped control on the site — it should not be shrunk to win back
   four pixels.

   No colour here on purpose: `text-ink` in this string would collide with the
   `text-white` on the black CTA, and which one wins would come down to
   Tailwind's own output order rather than anything readable at the call site.
   Each pill states its own colour. */
const PILL =
  'group relative inline-flex min-h-11 items-center gap-1.5 rounded-pill px-5 text-body-sm font-medium';

/* The one-pixel lift, for the pills that are their own object: Call, the CTA
   and the mobile Menu button. The rail links do NOT take this — their depth
   comes from the capsule, and a link lifting out from under a capsule that is
   not lifting with it looks like two things coming apart. */
const PILL_LIFT =
  'transition-[transform,opacity] duration-300 ease-out-soft hover:-translate-y-px ' +
  'motion-reduce:transition-none motion-reduce:hover:translate-y-0';

/* THE POP. Scale only — a font-weight or font-size change would reflow the
   label, and the capsule is positioned from measured layout pixels, so the
   label would grow out from under it. `scale` repaints without touching
   layout, so the geometry the capsule measured stays true. */
/* `group-focus-visible` mirrors `group-hover` because the rail already moves the
   spotlight on focus (see `railItem`), so a keyboard user would otherwise blur
   every sibling and get no pop on the link they had actually landed on. Same
   pairing PillFace uses for its chip. */
const POP =
  'relative inline-flex items-center gap-1.5 transition-transform duration-300 ease-spring ' +
  'group-hover:scale-[1.07] group-focus-visible:scale-[1.07] ' +
  'motion-reduce:transition-none motion-reduce:group-hover:scale-100 ' +
  'motion-reduce:group-focus-visible:scale-100';

/* THE SPOTLIGHT — the counterpart to POP. One link is singled out, so the rest
   go soft, which is what makes the popped one read as chosen rather than merely
   bigger.

   ON THE PILL, NOT THE <li>. The Projects dropdown is a sibling of the pill
   inside the same <li>; blurring the <li> would blur an OPEN menu the instant
   the pointer moved to a neighbouring link. The pill wraps only the label, so
   the menu is never in the filtered subtree.

   `ease-out-soft`, NOT `ease-spring`. A spring overshoots past its target and
   settles back — the point of POP — but an overshoot on blur or opacity is
   either invisible or clamped, so it buys nothing and costs a longer settle.

   SOFT_BASE is applied UNCONDITIONALLY so the transition exists in both
   directions; without it the blur would animate on and snap off. */
const SOFT_BASE =
  'transition-[filter,opacity] duration-300 ease-out-soft motion-reduce:transition-none';

/* 2px is the whole budget: enough to drop the label out of the reading plane,
   not enough to turn 13px type into a smudge. The opacity does most of the
   de-emphasis; the blur is what makes it read as depth rather than as disabled. */
const SOFTENED = 'blur-[2px] opacity-50';

/* THE DROPDOWN'S SURFACE — why this is a shadow stack and not an opacity bump.

   The panel was never transparent: `bg-surface` is #ffffff at full opacity. It
   read as washed out because the PAGE behind it is #f9f8f5 — a 2% step from
   pure white — and the panel had no edge and a single soft 40px shadow at 14%.
   An opaque white card with no rim, on an almost-white field, dissolves into
   it. Raising the opacity of something already opaque would change nothing.

   So the weight comes from separation instead, in four layers:
     · a rim, which is the one thing that guarantees an edge even where the
       card and the page behind it are the same colour
     · a tight contact shadow, which is what reads as "resting just above"
     · a mid shadow for the body of the lift
     · a wide, deep ambient so the card has somewhere to fall away to

   `inset 0 0 0 1px` FOR THE RIM, NOT `border` — the same call `glass-capsule`
   makes. A border would add 2px to a `w-64` panel that is centred by
   transform, nudging it half a pixel off the link it hangs from. An inset
   shadow paints inside the box and changes no geometry.

   🔴 ONE UNBROKEN STRING LITERAL, however long the line. Tailwind scans SOURCE
   TEXT for whole class names, so an arbitrary value split across a `+` join is
   invisible to it and silently generates NO RULE — which is not a degraded
   shadow, it is no shadow. The other constants in this file wrap safely only
   because they break at the whitespace BETWEEN separate classes, leaving each
   token whole. Never break inside the brackets. */
const MENU_SURFACE =
  'shadow-[inset_0_0_0_1px_rgba(26,22,19,0.09),0_2px_4px_rgba(26,22,19,0.07),0_12px_24px_-8px_rgba(26,22,19,0.22),0_32px_56px_-16px_rgba(26,22,19,0.3)]';

const slug = (label: string) => label.toLowerCase().replace(/\s+/g, '-');

/* =============================================================================
   PILL FACE — glass behind a STANDALONE pill

   For pills that stand on their own: the Call pill in the right-hand group. The
   rail links do not use this; one shared capsule slides between those instead
   (see NAV RAIL below), because a chip per link fading independently reads as
   several separate highlights rather than one control being moved.

   The chip is a sibling of the label, not a background on the pill: it carries
   its own `backdrop-filter`, which a `background-color` cannot do, and it
   scales from 0.9 without dragging the label into the transform — text mid-
   transform is re-rasterised by the compositor and 13px type goes visibly soft.

   `opacity` and `transform` ONLY, same rule as the mobile overlay: both are
   composited, so a hover never touches layout or paint.
   ========================================================================== */

function PillFace({ children }: { children: ReactNode }) {
  return (
    <>
      <span
        aria-hidden="true"
        className={cx(
          'glass-chip pointer-events-none absolute inset-0 rounded-pill',
          'transition-[opacity,transform] duration-300 ease-out-soft motion-reduce:transition-none',
          'scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100',
          'group-focus-visible:scale-100 group-focus-visible:opacity-100',
        )}
      />
      {/* Restates the gap: the pill's own `gap-1.5` now sees one child, so
          label-to-chevron spacing has to live in here. `relative` lifts the
          label above the chip without needing a z-index. */}
      <span className="relative inline-flex items-center gap-1.5">{children}</span>
    </>
  );
}

/* 🔴 A 'use client' MODULE CANNOT FETCH. Everything it needs is threaded
   down from the root layout, which is a Server Component.

   `nav` in particular is DERIVED from the published project list rather than
   being a hardcoded array of slugs — so a project added in the CMS actually
   appears in the dropdown. Its LENGTH IS THEREFORE NOT FIXED, which is why
   the rail below measures each link's own box instead of dividing the track
   into a known number of slots. */
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

  /* ===========================================================================
     NAV RAIL — the capsule that slides between the links

     ONE capsule for every link, moved rather than redrawn. That is the whole
     effect: the eye tracks a single object across the bar, which is why it
     reads as an iOS control and not as a set of independent hover states.

     ITS GEOMETRY IS MEASURED, NOT DECLARED. The links are different widths and
     the labels come from content, so there is no ratio to hard-code; the
     capsule copies the target link's own offset box. It is positioned with a
     `translate3d` and an explicit width/height rather than `left`/`top` so the
     travel is composited.

     WHICH LINK IT SITS ON, in priority order:
       1. the hovered link — the pointer always wins
       2. the link whose dropdown is open — so the capsule does not slide away
          the moment you move down into the Projects menu
       3. the current page — the rest position
     On a page outside the nav (/amenities, /master-plan) none of the three
     applies and the capsule is simply absent.
     ========================================================================= */

  const railRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [hovered, setHovered] = useState<number | null>(null);
  const [capsule, setCapsule] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);

  const activeIndex = nav.findIndex((item) => isActive(item.href));
  const expandedIndex = openSubmenu ? nav.findIndex((item) => item.label === openSubmenu) : -1;

  const targetIndex =
    hovered ?? (expandedIndex >= 0 ? expandedIndex : activeIndex >= 0 ? activeIndex : null);

  /* WHICH LINK IS SINGLED OUT, and therefore which ones go soft.

     🔴 DELIBERATELY NOT `targetIndex`. The capsule rests on the current page,
     but the blur must not: falling back to `activeIndex` here would mean every
     page loaded with its nav already blurred, and a permanent effect stops
     reading as focus. Only a live pointer or an open dropdown counts, so at
     rest nothing is softened. */
  const focusIndex = hovered ?? (expandedIndex >= 0 ? expandedIndex : null);

  const measureCapsule = useCallback(() => {
    const el = targetIndex === null ? null : itemRefs.current[targetIndex];
    /* A hidden rail measures 0×0 — below the inline breakpoint the links are
       `display: none`, and a zero-width capsule would flash at the rail's
       left edge on the way to the next layout. */
    if (!el || !el.offsetWidth) {
      setCapsule(null);
      return;
    }
    const next = { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight };
    /* Returns the SAME object when nothing moved, so React bails out of the
       re-render. The ResizeObserver fires on every frame of a window drag, and
       a fresh object each time would re-render the whole bar per frame for
       geometry that is usually identical. */
    setCapsule((prev) =>
      prev && prev.x === next.x && prev.y === next.y && prev.w === next.w && prev.h === next.h
        ? prev
        : next,
    );
  }, [targetIndex]);

  useEffect(() => {
    measureCapsule();
  }, [measureCapsule, isInline, pathname]);

  /* Re-measure on anything that moves the links: a viewport resize, the display
     font swapping in and reflowing the labels, or the bar's own width changing.
     Observing the rail catches all three — it is sized by its own content.

     The observer reads the measure function out of a ref rather than closing
     over it. Subscribing directly would tear the observer down and rebuild it on
     every single hover, since `measureCapsule` is rebuilt whenever the target
     changes — and `observe()` fires an immediate callback, so each hover would
     cost an extra render for nothing. */
  const measureRef = useRef(measureCapsule);

  useEffect(() => {
    measureRef.current = measureCapsule;
  }, [measureCapsule]);

  useEffect(() => {
    const el = railRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => measureRef.current());
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
      {/* ---------- The bar: full width, flush with the top edge ---------- */}
      <header className={cx('fixed inset-x-0 top-0 z-100', BAR)}>
        <nav
          aria-label="Primary"
          className={cx('container-page relative flex items-center justify-between gap-4', BAR_HEIGHT)}
        >
          {/* Brand, hard left. No pill behind it — on a full-bleed bar the
              mark sits on the surface directly. */}
          <Link
            href="/"
            aria-label={`${siteName} — home`}
            /* `prefetch={false}` because this is the THIRD link to `/` on every
               page: the rail's own `Home` item and the mobile overlay's copy of
               it both point here too, and Next prefetches each one it finds in
               the viewport. The other two are real navigation and keep their
               prefetch; the brand mark is a duplicate destination, so its
               prefetch buys nothing and just re-requests the route every time
               the dev server invalidates its cache. */
            prefetch={false}
            className="inline-flex shrink-0 items-center rounded-pill text-ink"
          >
            <Logo siteName={siteName} logo={logo} size="sm" />
          </Link>

          {/* Links inline from 1024px up, centred on the page axis; the Menu
              pill below it.

              `onPointerLeave` is on the RAIL, not on each link: leaving one link
              for its neighbour must not blank the capsule mid-travel — only
              leaving the rail entirely sends it back to the current page.

              The rail is a <div> wrapping the <ul> rather than being the <ul>:
              the capsule must be a sibling of the list, and a <span> as a direct
              child of <ul> is invalid markup — only <li> may go there. */}
          <div
            ref={railRef}
            onPointerLeave={() => setHovered(null)}
            /* CONCENTRIC RADII, and the reason this is an arbitrary 18px rather
               than a token. The track's radius must equal the pill's radius
               PLUS the padding between them — 12px + 6px — or the two curves
               run at different rates and the capsule looks wedged into a
               corner at each end. `rounded-card` (16px) was exactly right while
               the padding was 4px; it stopped being right the moment the track
               was opened up to `p-1.5`, and there is no 18px token. If the
               padding changes again, this number changes with it.

               Centred explicitly rather than leaning on `items-center` from the
               flex parent — an absolutely positioned flex child takes its static
               position from the parent's alignment, which is true but is the
               kind of thing that quietly stops being true. */
            className={cx(
              /* 🔴 `w-max` IS LOAD-BEARING, NOT A TIDY-UP. An absolutely
                 positioned box is sized by SHRINK-TO-FIT:
                 min(max-content, available). With `left-1/2` and no `right`,
                 "available" is only the distance from the 50% mark to the
                 containing block's right edge — half the bar. As soon as the
                 links need more than that, the track is clamped to 50% and the
                 last link and its capsule spill out past the rounded end,
                 while `-translate-x-1/2` recentres the CLAMPED box so the
                 overflow is lopsided. `w-max` opts out of shrink-to-fit and
                 sizes to the links themselves, whatever the bar's width. */
              'glass-rail absolute left-1/2 top-1/2 hidden w-max -translate-x-1/2 -translate-y-1/2',
              'rounded-[1.125rem] p-1.5 tablet:block',
            )}
          >
            {/* The capsule. Behind the labels by paint order — it comes first in
                the DOM and every label is `relative` — so no z-index needed. */}
            <span
              aria-hidden="true"
              className={cx(
                'glass-capsule pointer-events-none absolute left-0 top-0 rounded-pill',
                'transition-[transform,width,height,opacity] duration-[420ms] ease-out-soft',
                'motion-reduce:transition-none',
                capsule ? 'opacity-100' : 'opacity-0',
              )}
              style={
                capsule
                  ? {
                      transform: `translate3d(${capsule.x}px, ${capsule.y}px, 0)`,
                      width: capsule.w,
                      height: capsule.h,
                    }
                  : undefined
              }
            />

            <ul className="flex items-center gap-1.5">
              {nav.map((item, index) => {
                const active = isActive(item.href);
                const expanded = openSubmenu === item.label;
                /* The overlay renders the same groups, so the inline dropdown
                   needs its own id — two elements cannot share one. */
                const submenuId = `nav-submenu-${slug(item.label)}`;

                /* Soft whenever some OTHER link holds the spotlight. The
                   spotlit link itself is never softened, so hovering always
                   leaves exactly one label sharp. */
                const softened = focusIndex !== null && focusIndex !== index;

                /* The capsule measures the <li>, so the ref and the hover
                   intent both belong on it — not on the <a>, which sits inside
                   the pill's own padding and would hand back a shorter box.
                   `focus` is here too, so the capsule follows the keyboard. */
                const railItem = {
                  ref: (el: HTMLLIElement | null) => {
                    itemRefs.current[index] = el;
                  },
                  onPointerEnter: () => setHovered(index),
                  onFocus: () => setHovered(index),
                  onBlur: () => setHovered(null),
                };

                if (!item.children) {
                  return (
                    <li key={item.label} {...railItem}>
                      <Link
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        className={cx(PILL, SOFT_BASE, softened && SOFTENED, 'text-ink')}
                      >
                        <span className={POP}>{item.label}</span>
                      </Link>
                    </li>
                  );
                }

                return (
                  <li key={item.label} {...railItem} className="relative">
                    {/* Click-toggled at every width. Hover-only would strand
                        touch users on the one item that has children. */}
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={submenuId}
                      onClick={() => setOpenSubmenu(expanded ? null : item.label)}
                      className={cx(PILL, SOFT_BASE, softened && SOFTENED, 'text-ink')}
                    >
                      <span className={POP}>
                        {item.label}
                        <Icon
                          name="chevronDown"
                          size={14}
                          className={cx(
                            'transition-transform duration-200',
                            expanded && 'rotate-180',
                          )}
                        />
                      </span>
                    </button>

                    {/* Offset from the RAIL's bottom edge, not the link's: the
                        rail's padding sits between them, so 0.75rem here is
                        0.5rem of visible gap.

                        STAYS MOUNTED, toggled with `inert` + `visibility` — the
                        same rule as the mobile overlay, and for the same reason:
                        `hidden` removes the panel outright, leaving the browser
                        no "before" state to transition from, so the projects
                        would appear fully formed with no motion at all.

                        `inert` is what makes that safe. The project links are in
                        the DOM while the menu is shut, and without it they would
                        stay tabbable and announced — a closed menu that a
                        keyboard or screen-reader user can still walk into. */}
                    <ul
                      id={submenuId}
                      inert={!expanded}
                      className={cx(
                        'absolute left-1/2 top-[calc(100%+0.75rem)] w-64 -translate-x-1/2 rounded-card bg-surface p-1.5',
                        MENU_SURFACE,
                        /* The panel itself only fades and drops a few pixels;
                           the staggered travel belongs to the rows inside it.
                           Faster than the rows on purpose — the surface should
                           already be there to receive them. */
                        'transition-[opacity,transform,visibility] duration-200 ease-out-soft',
                        'motion-reduce:transition-none',
                        expanded ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0',
                      )}
                    >
                      {item.children.map((child, childIndex) => {
                        const childActive = pathname === child.href;
                        return (
                          <li
                            key={child.label}
                            /* Each project arrives after the one above it.
                               Delay on the way IN only: closing all at once
                               keeps the menu from feeling sticky to dismiss —
                               same asymmetry as the mobile overlay rows. */
                            className={cx(
                              'transition-[opacity,transform] duration-300 ease-out-soft',
                              'motion-reduce:transition-none',
                              expanded ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0',
                            )}
                            style={{
                              transitionDelay: expanded ? `${60 + childIndex * 45}ms` : '0ms',
                            }}
                          >
                            <Link
                              href={child.href}
                              aria-current={childActive ? 'page' : undefined}
                              className={cx(
                                'flex min-h-10 items-center rounded-[0.5rem] px-3 text-body-sm transition-colors',
                                childActive
                                  ? 'bg-bg text-ink'
                                  : 'text-ink-soft hover:bg-bg hover:text-ink',
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
          </div>

          {/* ---------- The two conversion actions, hard right ---------- */}
          <div className="hidden shrink-0 items-center gap-1.5 tablet:flex">
            {/* Call stands alone outside the rail, so it takes a chip of its own
                rather than a travelling capsule — same glass family, one step
                quieter, which is right for a secondary action. */}
            <a {...anchorProps(telHref(phone))} className={cx(PILL, PILL_LIFT, 'text-ink')}>
              <PillFace>
                <Icon name="phone" size={15} />
                Call
              </PillFace>
            </a>
            {/* The CTA is the one pill that is already a solid object, so it
                lifts on hover but takes no glass — a chip over black would only
                mute it. */}
            <Link
              href="/contact"
              className={cx(PILL, PILL_LIFT, 'bg-core-black text-white hover:opacity-90')}
            >
              Book a site visit
            </Link>
          </div>

          <button
            ref={toggleRef}
            type="button"
            className={cx(
              PILL,
              PILL_LIFT,
              'shrink-0 border border-line bg-white/60 text-ink tablet:hidden',
            )}
            aria-expanded={menuOpen}
            aria-controls="primary-navigation-overlay"
            onClick={() => (menuOpen ? closeMenu() : setMenuOpen(true))}
          >
            {menuOpen ? 'Close' : 'Menu'}
            <Icon name={menuOpen ? 'close' : 'menu'} size={18} />
          </button>
        </nav>
      </header>

      {/* ---------- Mobile full-screen overlay ----------
          Stays mounted so it has a state to transition from. `inert` takes it
          out of the focus order AND the accessibility tree while closed, which
          is what `hidden` used to do — without costing the animation.
          `pt-24` clears the 64px bar, which sits above this on z-index. */}
      <div
        ref={sheetRef}
        id="primary-navigation-overlay"
        inert={!overlayOpen}
        aria-label="Site menu"
        className={cx(
          'fixed inset-0 z-95 flex flex-col overflow-y-auto overscroll-contain bg-bg',
          'px-5 pb-8 pt-24 tablet:hidden',
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

        {/* The bar's top-right group has no room on a phone, so its two
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
            {...anchorProps(telHref(phone))}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-pill border border-line-strong px-5 text-body-sm font-medium text-ink"
          >
            <Icon name="phone" size={16} />
            {phone}
          </a>
        </div>
      </div>
    </div>
  );
}
