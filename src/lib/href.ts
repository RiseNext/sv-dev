/* Unresolved destinations in src/content are written as [BRACKETED_TOKENS].
   These helpers guarantee such a destination can never ship as a live-looking
   but dead link: it renders inert, unfocusable, and visibly struck through. */

/* 🔴 AN ABSENT DESTINATION IS TREATED AS A PLACEHOLDER, NOT AS A CRASH.

   These helpers are typed `href: string`, and the CMS contract types agree —
   `site.phone`, `site.email` and `site.whatsapp` are all declared `string`. But
   a TYPE IS NOT A RUNTIME GUARANTEE when the value crosses the network: a
   site-settings global that has never been saved serialises with those keys
   missing, and `undefined` arrives where the compiler promised a string.

   ⚠️ THIS FAILED THE PRODUCTION BUILD, it did not merely render oddly:
     TypeError: Cannot read properties of undefined (reading 'startsWith')
     Export encountered an error on /projects/page, exiting the build.
   A freshly migrated database is exactly that state, so a first deploy made
   before the owner had entered any content could not build at all.

   The backend now also emits `''` rather than omitting those keys, which fixes
   the contract violation at source. This guard stays regardless — it is one
   `typeof` check standing between a missing CMS value and a failed deploy, and
   rendering an unfilled destination INERT is the stated purpose of this whole
   module. An empty string is handled identically for the same reason: `tel:`
   with no number is exactly the live-looking dead link described above. */
function isBlank(href: string): boolean {
  return typeof href !== 'string' || href.trim() === '';
}

export function isPlaceholder(href: string): boolean {
  if (isBlank(href)) return true;
  return href.startsWith('[') && href.endsWith(']');
}

export function isExternal(href: string): boolean {
  if (isBlank(href)) return false;
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
 *  simply never applied here.
 *
 *  🔴 AND IT NEEDS A COUNTRY CODE. wa.me takes the FULL international number;
 *  given a bare national number it reads the leading digits as one. The
 *  number in site-settings is stored as `9306432399` — so `wa.me/9306432399`
 *  opened a chat with +93 (Afghanistan), not with the business. Every number on
 *  this site is an Indian mobile, so a bare 10-digit mobile (6–9 first digit),
 *  or the same with a trunk `0`, gets `91` in front. Anything else — a number
 *  already carrying its country code, like `+91 93064 32399` — passes through
 *  untouched, so fixing the value in the CMS later needs no code change. */
export function whatsappHref(whatsapp: string): string {
  if (isPlaceholder(whatsapp)) return whatsapp;
  let digits = whatsapp.replace(/\D/g, '');
  if (/^0[6-9]\d{9}$/.test(digits)) digits = digits.slice(1);
  if (/^[6-9]\d{9}$/.test(digits)) digits = `91${digits}`;
  return digits ? `https://wa.me/${digits}` : whatsapp;
}
