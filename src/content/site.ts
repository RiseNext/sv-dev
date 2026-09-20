import type { NavLink } from '@/types/content';

/* =============================================================================
   SITE STRUCTURE — what stays in CODE, and why.

   The brand, contact channels, social links and legal links all moved to the
   CMS: fetch them with `getSiteSettings()` from `@/lib/api/site`.

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

/* Primary navigation: Home · About Us · Projects · Contact Us.

   /master-plan, /amenities and /location are NOT deleted — those routes still
   work and are linked from the footer. They were written as site-wide pages
   back when there was one layout; now that each project carries its own plan,
   amenities and location sections, they no longer belong in the primary nav. */
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
    { label: 'Contact Us', href: '/contact' },
  ];
}

/* Two columns, not four. The third ("Buyer information") was mostly anchors
   into pages already listed here — #plot-sizes, #approvals, #faq — plus a
   second "Book a site visit"; none of it earned the height it cost on a phone.
   Master plan moves into Explore rather than being dropped: along with
   /amenities and /location it has no primary-nav entry, so the footer is the
   only thing linking it. */
export function buildFooterNav(
  projects: readonly ProjectLink[],
): readonly { title: string; links: readonly NavLink[] }[] {
  return [
    {
      title: 'Explore',
      links: [
        { label: 'About us', href: '/about' },
        { label: 'All projects', href: '/projects' },
        { label: 'Master plan', href: '/master-plan' },
        { label: 'Amenities', href: '/amenities' },
        { label: 'Location', href: '/location' },
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
