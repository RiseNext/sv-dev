import type { NavLink } from '@/types/content';
import type { IconName } from '@/components/ui/Icon';

/* =============================================================================
   BRAND, CONTACT AND NAVIGATION

   ⚠️  EVERYTHING IN [SQUARE BRACKETS] IS AN UNVERIFIED CLAIM.
   Approval numbers, registration IDs, addresses, phone numbers and external
   URLs are bracketed on purpose: lib/href.ts renders a bracketed destination
   inert, so a placeholder can never ship looking like a working link.
   ========================================================================== */

export const site = {
  name: 'SV Developers',
  legalName: 'SV Developers',
  tagline: 'Approved residential plots',
  description:
    'SV Developers builds gated, fully developed residential plot layouts with clear title, laid infrastructure and immediate registration.',
  url: 'https://www.example.com',
  email: '[EMAIL@DOMAIN]',
  phone: '[+91 00000 00000]',
  /** Digits only, country code first. */
  whatsapp: '[910000000000]',
  address: ['[BUILDING, STREET]', '[AREA, CITY]', '[STATE] — [PIN]'],
  mapUrl: '[GOOGLE_MAPS_URL]',
  officeHours: 'Site visits seven days a week, 9am – 7pm',
} as const;

/* Primary navigation: Home · About Us · Projects · Contact Us.

   /master-plan, /amenities and /location are NOT deleted — those routes still
   work and are linked from the footer. They were written as site-wide pages
   back when there was one layout; now that each project carries its own plan,
   amenities and location sections, they no longer belong in the primary nav. */
export const nav: readonly NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  {
    label: 'Projects',
    href: '/projects',
    children: [
      { label: 'All projects', href: '/projects' },
      { label: 'Sri City Aler Town', href: '/projects/sri-city-aler-town' },
      { label: 'Sri Vanam Phase 2', href: '/projects/sri-vanam-phase-2' },
      { label: 'Siri Vanam', href: '/projects/siri-vanam-gummadavelli' },
      { label: 'Sri Nivasam', href: '/projects/sri-nivasam-swarnagiri' },
      { label: 'SV Apartment', href: '/projects/sv-apartment-genome-valley' },
    ],
  },
  { label: 'Contact Us', href: '/contact' },
];

export const social: readonly { label: string; href: string; icon: IconName }[] = [
  { label: 'Facebook', href: '[FACEBOOK_URL]', icon: 'facebook' },
  { label: 'Instagram', href: '[INSTAGRAM_URL]', icon: 'instagram' },
  { label: 'YouTube', href: '[YOUTUBE_URL]', icon: 'youtube' },
];

/* Two columns, not four. The third ("Buyer information") was mostly anchors
   into pages already listed here — #plot-sizes, #approvals, #faq — plus a
   second "Book a site visit"; none of it earned the height it cost on a phone.
   Master plan moves into Explore rather than being dropped: along with
   /amenities and /location it has no primary-nav entry, so the footer is the
   only thing linking it. */
export const footerNav: readonly { title: string; links: readonly NavLink[] }[] = [
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
    links: [
      { label: 'Sri City Aler Town', href: '/projects/sri-city-aler-town' },
      { label: 'Sri Vanam Phase 2', href: '/projects/sri-vanam-phase-2' },
      { label: 'Siri Vanam', href: '/projects/siri-vanam-gummadavelli' },
      { label: 'Sri Nivasam', href: '/projects/sri-nivasam-swarnagiri' },
      { label: 'SV Apartment', href: '/projects/sv-apartment-genome-valley' },
    ],
  },
];

export const legal = {
  copyright: `© [YEAR] ${site.legalName}. All rights reserved.`,
  disclaimer:
    'Images, plans, dimensions and timelines on this site are indicative and subject to approval by the competent authority. Nothing here constitutes an offer or a contract.',
  links: [
    { label: 'Privacy policy', href: '[PRIVACY_URL]' },
    { label: 'Terms of use', href: '[TERMS_URL]' },
  ],
} as const;
