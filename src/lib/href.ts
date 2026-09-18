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
