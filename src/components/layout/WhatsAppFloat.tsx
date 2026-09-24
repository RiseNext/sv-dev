import { Icon } from '@/components/ui/Icon';
import { isPlaceholder, whatsappHref } from '@/lib/href';
import { cx } from '@/lib/cx';

/* =============================================================================
   FLOATING WHATSAPP BUTTON — bottom-right on every page.

   One tap opens a WhatsApp chat with the business: the WhatsApp app on a
   phone, WhatsApp Web or Desktop on a computer (that is wa.me's own routing).
   The chat opens with a greeting already typed, so the visitor only has to
   press send. The number is `site-settings.whatsapp` from the CMS, built into
   a link by `whatsappHref`, which adds the country code the stored number
   lacks — see the note there.

   NOT RENDERED while the number is still a [BRACKETED] placeholder or blank:
   a floating button that goes nowhere is worse than no button.

   A plain server-rendered link — no client JavaScript, nothing to hydrate.

   ─── LAYERING ─────────────────────────────────────────────────────────────
   z-90: above the page, BELOW the phone menu overlay (z-95) and the top bar
   (z-100), so the open menu covers it rather than the button floating over
   the menu. The image lightbox (z-200) covers it too.

   ─── COLOUR AND FOCUS ─────────────────────────────────────────────────────
   It floats over the dark green field AND the light footer, so no single fill
   has contrast against both. The fill (`--color-whatsapp`) carries the edge
   against the footer, and a white border carries it against the green. The
   focus indicator is two-tone for the same reason: the white border thickens
   and a dark outline sits outside it, so one of the two always stands out.

   The hover label ("Chat on WhatsApp") is positioned OUTSIDE the link's box
   and ignores the pointer, so the clickable area is the circle alone — an
   invisible label must not turn empty space beside the button into a link. */

export function WhatsAppFloat({ whatsapp, siteName }: { whatsapp: string; siteName: string }) {
  if (typeof whatsapp !== 'string' || isPlaceholder(whatsapp)) return null;

  const message = `Hi ${siteName}, I would like to know more about your projects.`;
  const href = `${whatsappHref(whatsapp)}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cx(
        'group fixed right-4 z-90 bottom-[max(1rem,env(safe-area-inset-bottom))] tablet:bottom-6 tablet:right-6',
        'rounded-full print:hidden',
        'focus-visible:outline-offset-4',
      )}
      style={{ animation: 'rise 700ms var(--ease-out-soft) 400ms backwards' }}
    >
      {/* Desktop hover/focus label — visual only. `aria-hidden` because the
          link is named by the visually-hidden text at the end, at every width;
          without it a screen reader would hear "Chat on WhatsApp" twice. */}
      <span
        aria-hidden="true"
        className={cx(
          'pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap',
          'rounded-pill bg-surface px-4 py-2 text-body-sm font-medium text-ink',
          'shadow-[0_6px_20px_-6px_rgba(7,5,3,0.35)]',
          'opacity-0 transition-[opacity,translate] duration-300 ease-out-soft motion-reduce:transition-none',
          'translate-x-1 group-hover:translate-x-0 group-hover:opacity-100',
          'group-focus-visible:translate-x-0 group-focus-visible:opacity-100',
          /* Touch has no hover; the label would only ever flash on tap. */
          'max-tablet:hidden',
        )}
      >
        Chat on WhatsApp
      </span>

      <span
        aria-hidden="true"
        className={cx(
          'flex size-14 items-center justify-center rounded-full border-2 border-white bg-whatsapp text-white',
          'shadow-[0_10px_28px_-8px_rgba(7,5,3,0.55)]',
          'transition-[transform,border-width] duration-300 ease-spring motion-reduce:transition-none',
          'group-hover:scale-[1.06] group-focus-visible:border-4 motion-reduce:group-hover:scale-100',
        )}
      >
        <Icon name="whatsapp" size={28} />
      </span>

      <span className="visually-hidden">Chat on WhatsApp (opens in a new tab)</span>
    </a>
  );
}
