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
   At advertisement scale the emblem is taller than the bar at both widths —
   96 over 64 on a phone, 128 over 88 from 1024px — and with the bar flush to
   the top there is no room above it; anything hanging up there is cut off by
   the viewport, permanently, because you cannot scroll up to reach it. So it
   is TOP-ALIGNED (`self-start`) with a few pixels of inset and spills downward
   only, at every width.

   ─── THE NUMBERS EVERY "CLEAR THE NAV" OFFSET DEPENDS ON ───────────────────
   Bar 64px tall on a phone, 88px from 1024px, starting at y=0. THE EMBLEM
   OVERHANGS AT BOTH WIDTHS, so the nav's real bottom edge is the emblem's, not
   the bar's: 100px on a phone (4px top margin + a 96px medallion) and 132px
   from 1024px.

   Everything that has to clear the nav is measured against THOSE two numbers:
     · Hero            `pt-28 tablet:pt-36`  — 112 / 144
     · Menu overlay    `pt-30`               — 120, phone only
     · globals.css     `scroll-padding-top: 8.5rem` — 136, both
   The phone figures used to be 20px smaller, from when the emblem still fitted
   inside the bar. If the medallion grows again, these are what move with it.

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

/* 🔴 THESE THREE MOVE TOGETHER, and the arithmetic is the whole point:

     BADGE.sm in Logo.tsx = medallion − 8   (its 2px ring + 2px band per side)

   🔴 THE EMBLEM IS BIGGER THAN THE BAR AT EVERY WIDTH, ON PURPOSE:

     Phone   bar 64, medallion 96,  badge 88  — hangs 36px below
     1024px+ bar 88, medallion 128, badge 120 — hangs 44px below

   The brand has to read at advertisement scale and THE BAR MUST NOT GROW TO
   SUIT IT — a 120px-tall bar was tried and was wrong; it turned the nav into a
   block. So the emblem hangs BELOW the bar instead, while staying inside the
   page gutter horizontally. The bar keeps its slim proportion, the mark gets
   its size.

   🔶 THE PHONE USED TO BE THE EXCEPTION: medallion 52, badge 44, fully
   contained in the bar. It was reported as too small to read — and it was, the
   word DEVELOPERS inside the emblem is illegible under about 60px, which is
   the whole reason the desktop mark is 128. A phone is where the brand is seen
   most, so it now uses the same overhang the desktop always did, scaled to its
   own bar: 96/64 is the same 1.5 ratio as 128/88.

   This works only because the bar's height is fixed (`h-16`/`h-22`, not
   `min-h-`) and it carries no `overflow-hidden` — a taller flex child then
   spills out of it instead of stretching it. */
const MEDALLION_SIZE = 'size-24 tablet:size-32'; /* 96px / 128px */
const BAR_HEIGHT = 'h-16 tablet:h-22'; /* 64px / 88px */

/* 🔴 THE EXPANDED NAME IS A FRONTEND STRING, AND IT HAS TO BE.
   It is NOT `siteName`, and it is not an oversight that it isn't: the CMS emits
   `name` and `legalName` and BOTH are "SV Developers" (checked against the
   live settings, 8 Oct 2026). There is no field carrying the name spelled out,
   so reading one would render the short name beside an emblem that already
   says SV — which is the one thing this wordmark exists to stop.

   Changing `site-settings.name` to the long form is NOT the fix. That field
   feeds every page title, the footer copyright and the home link's accessible
   name; the long form belongs in the bar, not in a <title>.

   Written in title case and uppercased in CSS, so the DOM text stays readable
   for a screen reader and for anyone searching the source. ONE STRING, with no
   line break in it — where it breaks is a width question, so CSS decides it;
   see WORDMARK. If the CMS ever grows a field for this, this is the line to
   delete. */
const WORDMARK_NAME = 'Shiva Varahi Developers';

/* 🔶 ONE LINE BESIDE THE EMBLEM FROM 1280px, STACKED ON TWO BELOW IT.
   Not a style preference — it is the only way to have it on one line at a size
   worth reading, and the bar's width budget is the whole argument.

   What the right-hand end costs, measured off the rendered classes:

     medallion                     128
     three outlined link pills     ~346   (incl. the 8px gaps)
     gold CTA                      ~261
     the nav's three gaps + gutter ~108
     ────────────────────────────────────
                                   ~843   before the name gets any

   This name set on ONE line needs about 14em of width, so the size and the
   space it covers are the same decision:

     At 1280px   437px is left; `--text-wordmark` is 26px there → ~364px. Fits.
     At 1920px  1077px is left; the clamp has reached its 38px cap → ~532px.
     At 1024px   181px is left. One line does NOT fit at any legible size —
                 it would need ~11px type, or it would shove the CTA off the
                 bar. So it WRAPS to two there instead, at a fixed 17px, which
                 needs ~128px.

   🔴 THE 38px CAP IS A WIDTH DECISION, NOT A TASTE ONE. Raising it is cheap to
   type and expensive to get wrong: the name grows ~14px wider for every 1px of
   type, so the next stop that still clears 1280px is around 44px. Past that the
   name reaches the link pills and the flex row starts shrinking the CTA. If a
   bigger name is wanted, take the room from the CTA's `px-7` or the links'
   `px-4` FIRST, then raise the cap — in that order.

   The wrap is done with `max-w` and the browser's own line breaking rather
   than a hardcoded break, so there is one string to change and the break
   lands between the words either way. `desktop:max-w-none` plus
   `desktop:whitespace-nowrap` is what guarantees one line above 1280 — the
   max-width alone would still allow a wrap at an awkward width.

   ─── 🔶 IT IS ON THE PHONE TOO NOW, AT 14px ───────────────────────────────
   It was `hidden` below 1024px, on the argument that the oversized emblem was
   carrying the brand on its own there. IT WASN'T: the name was reported as
   not visible on a phone, and the emblem's own interior lettering is not the
   name — it reads SV. So the words are in the phone bar as well.

   The room is there, measured in the rendered bar at a 2× phone DPR, and the
   binding word is DEVELOPERS (the longest, so it is what decides the size —
   no number of line breaks helps it):

                       320px   360px   390px
     free between the
     emblem and Menu     80     118     147     (after the two savings below)
     DEVELOPERS @14px    73      73      73

   Instrument Serif's caps are narrow — 5.2px of width per 1px of type — which
   is the only reason 14px clears a 320px screen at all. 17px would need 89px
   and overflow it, so the step up waits for `mid` (640px), where the same bar
   has ~390px spare.

   🔴 TWO SAVINGS PAY FOR IT, both phone-only, and they are why 320px fits:
   the nav's `gap-2` (was `gap-3`) and the Menu button's `px-3` (was `px-4`),
   16px between them. THE MEDALLION WAS NOT TOUCHED — its 96px is the
   advertisement scale that was asked for, and shrinking it to buy room here
   would undo that.

   🔴 NO `shrink-0` AND NO `min-w-0` BELOW 1280px, both deliberate. Everything
   else in the phone row is `shrink-0`, so this is the one item flex can take
   from when a narrow screen overflows — it gives up width and the name wraps,
   instead of the Menu button being pushed off the bar. And with `min-width`
   left at `auto` it cannot be squeezed BELOW the 73px DEVELOPERS needs, so the
   name is never clipped; the row would rather be 7px wider than the screen,
   which at the measured sizes it never is. `desktop:shrink-0` restores the
   old behaviour above 1280, where the text is `nowrap` and shrinking it would
   spill the letters over the links rather than wrap them.

   Gold rather than the links' white: it is brand lettering, not a control, and
   `gold-line` on this green is about 9:1. Uppercase serif needs the positive
   tracking — without it the caps close up and read as a single word. */
const WORDMARK = cx(
  'block',
  'font-display uppercase leading-[1.15] tracking-[0.06em] text-gold-line',
  /* 7.5em holds "SHIVA VARAHI" and pushes "DEVELOPERS" to a second line. In em,
     so it tracks the font size rather than needing a second number. */
  'max-w-[7.5em] text-[0.875rem] mid:text-[1.0625rem]',
  'desktop:max-w-none desktop:shrink-0 desktop:whitespace-nowrap desktop:text-wordmark',
);

/* The medallion's frame, kept DELIBERATELY THIN: a 2px gold ring and a 2px
   white band, no more. An earlier, heavier ring ate 18px of the circle's
   diameter, which on a phone left the wordmark inside the mark illegible —
   the ring was winning the space the brand needed. No drop shadow either; a
   shadow on this warm bar only reads as grime. */
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
/* 🔴 THE BAR IS DARK NOW, and every colour on it had to move with it. It was a
   cream gradient carrying espresso type; `--color-brand-green` (#004322) is the
   logo's own green, and on it:

     white / cream   11.5:1 and 11.1:1   — the links and the Menu button
     gold            4.75:1              — the CTA fill, still clears 3:1 for a
                                           non-text control boundary
     ink             1.36:1              — WHICH IS WHY NO INK SURVIVES HERE.
     gold-ink        1.92:1              — same; it was tuned for white grounds

   The lit top edge stays white but the hairline beneath flips: a warm gold line
   that read as a seam on cream reads as grime on green, so it is a light line
   at low alpha instead. The drop shadow deepens, because a pale shadow under a
   dark bar is invisible. */
const BAR = cx(
  'bg-brand-green',
  'shadow-[inset_0_1px_0_rgba(255,255,255,0.14),inset_0_-1px_0_rgba(255,255,255,0.10),0_2px_6px_rgba(0,28,14,0.18),0_14px_32px_-20px_rgba(0,28,14,0.75)]',
);

/* Links are WHITE on the green bar (11.5:1), not ink — see the note on BAR.

   🔶 THE LINKS ARE SET IN THE DISPLAY SERIF, like the CTA beside them. The bar
   is now ALL brand lettering and no UI sans, which is the point: the serif is
   what ties Home · About Us · Projects to the wordmark and to the gold button
   at the far end. `font-normal` for the same reason the CTA carries it —
   Instrument Serif has one weight, and asking for a heavier one only gets a
   synthesised smear. Sized a notch up from the 17px sans they replaced, since
   a serif reads smaller at a given point size.

   🔴 THESE LINKS HAVE EXACTLY ONE APPEARANCE. No hover wash, no current-page
   fill, no transition — a gold-outlined pill, and it looks identical whether
   you are pointing at it, on that page, or neither. THAT IS THE REQUEST: the
   gold that used to appear underneath the page you were on read as something
   animating into place on click, and the ask was for three things that simply
   look like buttons and stay put.

   So the OUTLINE is what does the work the fill used to. It is on all three at
   all times, which is what makes them read as controls on a bar that would
   otherwise be three bare words beside a gold button. `gold-line` at 60% over
   this green clears 3:1 as a control boundary while staying well under the
   solid CTA — the outline marks a button, it does not try to be one.

   🔴 TWO THINGS THAT MUST NOT BE "TIDIED UP" BACK IN:
   · `aria-current="page"` is still set at the call site. The page you are on is
     now announced but NOT drawn, so that attribute is the only thing left
     carrying it. Deleting it because nothing visible depends on it would strip
     the last trace of where you are.
   · The <header>'s `on-dark` class. With no hover and no current state,
     :focus-visible is the ONLY feedback a keyboard user gets, and the global
     ring is near-black — invisible on this green. `on-dark` flips it white.

   `select-none` stops a double-click dragging a blue text selection across the
   label, which is the one bit of state a pointer could still provoke here. */
const LINK =
  'inline-flex min-h-10 select-none items-center gap-1.5 rounded-full border-[1.5px] border-gold-line/60 px-4 font-display text-[1.25rem] font-normal text-white';

/* The CTA — solid gold, lit from the top-left, with an inner gold rim and a
   shadow that deepens as it lifts. Since Call was taken out of the bar this is
   the ONLY control at the right-hand end, which is the point: one destination,
   no competing pill beside it. Call still reaches the user from the footer and,
   on a phone, from the overlay. */
/* 🔶 THE LABEL IS SET IN THE DISPLAY SERIF — the face the SV wordmark and
   every heading on the site use — rather than in the UI sans the links beside
   it carry. That difference is the point: the one gold control in the bar now
   reads as brand lettering, not as another toolbar item.

   `font-normal` REPLACES the `font-semibold` this carried, and is not optional.
   Instrument Serif ships ONE weight (400), so asking for 600 does not load a
   bolder cut — the browser synthesises one by smearing the outlines, which on
   a high-contrast serif thickens the hairlines and ruins exactly what makes
   the face look like the logo. The size is stepped up a notch at both call
   sites instead: a serif at a sans's point size always reads smaller. */
const CTA = cx(
  'group inline-flex items-center gap-2.5 rounded-full bg-linear-to-br from-gold-to to-gold font-display font-normal text-core-black',
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
      {/* `on-dark` is NOT decoration: it is the one thing making the focus ring
          white instead of near-black on this green. With the links' hover wash
          gone, it is the only feedback a keyboard user gets. */}
      <header className={cx('on-dark fixed inset-x-0 top-0 z-100', BAR)}>
        <nav
          aria-label="Primary"
          /* `gap-2` on a phone, not `gap-3`: the two 4px savings are part of
             what buys the wordmark its room beside the emblem — see WORDMARK. */
          className={cx('container-page relative flex items-center gap-2 tablet:gap-5', BAR_HEIGHT)}
        >
          {/* The emblem, hard left.

              `self-start` + `mt-1` AT EVERY WIDTH, because at every width the
              medallion is now taller than the bar. The bar is flush with the
              top of the screen, so centring an oversized circle would push its
              top off-screen — on a phone that would be 16px of it gone, and
              there is no scrolling up to recover it. Top-aligned, the entire
              overhang falls BELOW the bar, where the hero is.

              (It was `tablet:` only while the phone emblem still fitted inside
              the bar. It no longer does — see MEDALLION_SIZE.)

              `prefetch={false}` because this is the THIRD link to `/` on
              every page (the Home link and the overlay's copy of it both
              point here, and both keep their prefetch), so prefetching it
              again buys nothing. */}
          <Link
            href="/"
            aria-label={`${siteName} — home`}
            prefetch={false}
            className={cx(MEDALLION, MEDALLION_SIZE, 'mt-1 self-start')}
          >
            <Logo siteName={siteName} logo={logo} size="sm" showName={false} />
          </Link>

          {/* Beside the emblem, NOT inside its link. The medallion's <Link> is
              a fixed-size circle (MEDALLION_SIZE), so text put in it would
              either be clipped by the circle or break the geometry the whole
              overhang depends on. It is plain text rather than a second link
              to `/`: there are already three of those on every page, and a
              fourth adjacent to the emblem would mean tabbing past the same
              destination twice in a row to reach Home. */}
          <span className={WORDMARK}>{WORDMARK_NAME}</span>

            {/* `ml-auto` here is what pushes the links AND everything after
                them to the right cap, leaving the emblem alone on the left. */}
            {/* `gap-2`, up from `gap-1`. The links carry their own outline now,
                so 4px left the three pills nearly touching and reading as one
                segmented control rather than as three buttons. */}
            <ul className="ml-auto hidden items-center gap-2 tablet:flex">
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
                        className={LINK}
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
                      className={LINK}
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
              {/* Grown on request: 44 → 56px tall, with the padding and label
                  scaled to match, so there is simply MORE GOLD at the bar's
                  right end. It fits because the bar is a fixed 88px from
                  1024px — 56 leaves 16px of air above and below, which is why
                  this stops here rather than going further. */}
              <Link href="/contact" className={cx(CTA, 'min-h-14 px-7 text-[1.3125rem]')}>
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
                /* On the green bar: a light outline and white type, not the
                   cream fill it carried on the old cream bar — a near-white
                   pill on dark green reads as a second CTA competing with the
                   gold one.
                   `px-3`, down from `px-4`: 8px of the 16 the wordmark beside
                   the emblem needed to clear a 320px screen. The pill is still
                   104px wide with its label, and the 44px tap target is
                   untouched — the saving comes off the air, not the hit area. */
                className="inline-flex min-h-11 items-center gap-2 rounded-full border-[1.5px] border-white/45 px-3 text-[1.0625rem] font-medium text-white transition-colors hover:border-gold-soft hover:bg-gold-soft hover:text-core-black"
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
          `pt-30` (120px) clears the nav, whose bottom edge on a phone is the
          overhanging emblem at 100px, not the 64px bar. The header sits above
          this on z-index, so the emblem hangs ONTO the open overlay — 20px of
          clear air under it is what keeps the first menu row out from beneath
          it. It was `pt-24` while the emblem still fitted inside the bar. */}
      <div
        ref={sheetRef}
        id="primary-navigation-overlay"
        inert={!overlayOpen}
        aria-label="Site menu"
        className={cx(
          'fixed inset-0 z-95 flex flex-col overflow-y-auto overscroll-contain bg-bg',
          'px-5 pb-8 pt-30 tablet:hidden',
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
          <Link href="/contact" className={cx(CTA, 'min-h-13 justify-center px-5 text-[1.1875rem]')}>
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
