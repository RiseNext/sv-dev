import type { IconName } from '@/components/ui/Icon';
import type { NavLink } from '@/types/content';

/* =============================================================================
   SITE STRUCTURE — what stays in CODE, and why.

   The brand, contact channels, social links and legal links all moved to the
   CMS: fetch them with `getSiteSettings()` from `@/lib/api/site`. The one
   exception is `socialFallback` below, and the comment on it says why.

   What remains here is ROUTE STRUCTURE, which is code by definition — changing
   the navigation means changing which routes exist, and that is a deploy
   whatever a CMS might say. The one thing that is NOT structure is the list of
   individual projects inside the Projects dropdown and the footer column, and
   that is now DERIVED from the published set rather than hand-maintained.

   🔴 WHY THE DERIVATION MATTERS
   `README.md:42` claimed "Adding a project … creates its dropdown entry …
   automatically." That was FACTUALLY WRONG: the nav and footer each held a
   hardcoded list of five slugs, so a project added through the CMS would appear
   at /projects, in the sitemap and at its own URL — and be INVISIBLE in the
   navigation. Three hand-duplications of the same list, two of them silently
   stale. Now there is one source.

   The legal DISCLAIMER also stays here, deliberately: "changing it is a
   lawyer's job, not a CMS edit."
   ========================================================================== */

type ProjectLink = { slug: string; name: string };

/* Primary navigation: Home · About Us · Projects.

   /master-plan, /amenities and /location ARE GONE — routes, pages and copy,
   removed 28 Sep 2026. They were written as site-wide pages back when there was
   one layout; each project now carries its own plan, amenities and location
   sections built from its own brochure, so the site-wide versions were three
   pages of generic copy duplicating what the project pages already say better.
   Nothing links them and the sitemap no longer lists them.

   🔴 /contact IS DELIBERATELY ABSENT, and removing it here is what took it out
   of the bar. It is not unreachable: the gold "Book a site visit" CTA at the
   right-hand end of the nav points at /contact, so a text link beside it was
   the same destination twice. The footer and the phone menu overlay both still
   link it. Adding an entry back here puts it in the bar AND in the phone
   overlay, which is probably not what is wanted. */
export function buildNav(projects: readonly ProjectLink[]): readonly NavLink[] {
  return [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about' },
    {
      label: 'Projects',
      href: '/projects',
      children: [
        { label: 'All projects', href: '/projects' },
        ...projects.map((project) => ({
          label: project.name,
          href: `/projects/${project.slug}`,
        })),
      ],
    },
  ];
}

/* Two columns, not four. The third ("Buyer information") was mostly anchors
   into pages already listed here — #plot-sizes, #approvals, #faq — plus a
   second "Book a site visit"; none of it earned the height it cost on a phone.

   Explore is now three rows, not six: Master plan, Amenities and Location came
   out with the pages themselves (see buildNav above). */
export function buildFooterNav(
  projects: readonly ProjectLink[],
): readonly { title: string; links: readonly NavLink[] }[] {
  return [
    {
      title: 'Explore',
      links: [
        { label: 'About us', href: '/about' },
        { label: 'All projects', href: '/projects' },
        { label: 'Contact', href: '/contact' },
      ],
    },
    {
      title: 'Projects',
      links: projects.map((project) => ({
        label: project.name,
        href: `/projects/${project.slug}`,
      })),
    },
  ];
}

/* SOCIAL — a FALLBACK, not the source of truth.
   `<Footer>` uses this only when `site.social` comes back absent or empty, so
   the day the CMS starts emitting the field it wins with no code change. That
   is the same arrangement the FAQ section already uses in content/pages.ts.

   🔴 WHY IT EXISTS AT ALL. /site-settings does not return `social` — checked
   28 Sep 2026 against production, which emits eleven fields and not that one.
   So `site.social ?? []` was an empty array on every page and the footer's
   social row rendered as nothing. The accounts are real and live; without this
   they are simply not linked from the site.

   YOUTUBE IS DELIBERATELY ABSENT — the channel URL has not been given yet. Add
   it as a third entry here when it arrives; the icon (`youtube`) already exists
   in the icon set. Do NOT add it as a `[BRACKETED]` placeholder to hold the
   slot: that is the convention for unfilled destinations, but it renders as a
   visibly struck-through dead icon, which is worse on a live footer than no
   icon at all. */
export const socialFallback: readonly { label: string; href: string; icon: IconName }[] = [
  {
    label: 'SV Developers on Facebook',
    href: 'https://www.facebook.com/profile.php?id=61593999734667',
    icon: 'facebook',
  },
  {
    label: 'SV Developers on Instagram',
    /* The `?stkn=` query the share sheet appends is a per-share tracking token,
       not part of the profile's address — it is dropped rather than baked into
       every page of the site. instagram.com/svdevelopers01 is the profile. */
    href: 'https://www.instagram.com/svdevelopers01',
    icon: 'instagram',
  },
];

export const legal = {
  /* ⚠️ `copyright` is GONE from this file ON PURPOSE.
     It used to be `© [YEAR] ${site.legalName}. All rights reserved.` — with
     [YEAR] embedded MID-STRING, so `isPlaceholder()` returned false and the
     literal text "© [YEAR] SV Developers." rendered live in the footer of every
     page. The CMS now COMPUTES `copyrightText`, which makes that whole class of
     bug impossible rather than merely fixed. Read it from `getSiteSettings()`. */
  disclaimer:
    'Images, plans, dimensions and timelines on this site are indicative and subject to approval by the competent authority. Nothing here constitutes an offer or a contract.',
} as const;
