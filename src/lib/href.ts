/* Unresolved destinations in src/content are written as [BRACKETED_TOKENS].
   These helpers guarantee such a destination can never ship as a live-looking
   but dead link: it renders inert, unfocusable, and visibly struck through. */

export function isPlaceholder(href: string): boolean {
  return href.startsWith('[') && href.endsWith(']');
}

export function isExternal(href: string): boolean {
  return /^(https?:)?\/\//.test(href) || href.startsWith('mailto:') || href.startsWith('tel:');
}

type AnchorProps = {
  href?: string;
  target?: '_blank';
  rel?: string;
  tabIndex?: number;
  'aria-disabled'?: true;
  'data-placeholder'?: string;
};

export function anchorProps(href: string): AnchorProps {
  if (isPlaceholder(href)) {
    return { 'aria-disabled': true, 'data-placeholder': '', tabIndex: -1 };
  }
  if (/^https?:\/\//.test(href)) {
    return { href, target: '_blank', rel: 'noopener noreferrer' };
  }
  return { href };
}

/** A `tel:` destination, or the bracketed token itself when the number is
 *  still a placeholder — so anchorProps() renders it inert instead of
 *  producing a live link to `tel:[+91 00000 00000]`. */
export function telHref(phone: string): string {
  return isPlaceholder(phone) ? phone : `tel:${phone.replace(/\s+/g, '')}`;
}

/** A `mailto:` destination, or the bracketed token itself when the address is
 *  still a placeholder.
 *
 *  🔴 THIS FIXES A BUG THAT SHIPS LIVE ON EVERY PAGE TODAY.
 *  `Footer.tsx` and `contact/page.tsx` both built `` `mailto:${site.email}` ``
 *  by hand. With `site.email = '[EMAIL@DOMAIN]'` that produces the string
 *  `mailto:[EMAIL@DOMAIN]` — and because `isPlaceholder()` requires the WHOLE
 *  string to start `[` and end `]`, it returns FALSE. So anchorProps() treats it
 *  as a real link and a live, focusable, non-struck-through dead mailto ships.
 *
 *  `telHref()` already existed to prevent exactly this for phone numbers; there
 *  was simply no equivalent for email. */
export function mailHref(email: string): string {
  return isPlaceholder(email) ? email : `mailto:${email.trim()}`;
}

/** A `https://wa.me/<digits>` destination, or the bracketed token itself.
 *
 *  🔴 ALSO A LIVE BUG. `contact/page.tsx` passed `site.whatsapp` — the RAW
 *  DIGIT STRING — straight in as an href. It is inert today only BY ACCIDENT,
 *  because the value happens to be bracketed. The moment an admin types a real
 *  number into the CMS it becomes a RELATIVE link to `/919XXXXXXXXX` and 404s.
 *
 *  The correct construction already existed at `EnquiryPill.tsx:39`; it was
 *  simply never applied here. */
export function whatsappHref(whatsapp: string): string {
  if (isPlaceholder(whatsapp)) return whatsapp;
  const digits = whatsapp.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : whatsapp;
}
