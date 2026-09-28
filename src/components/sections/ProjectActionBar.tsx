'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/cx';

/* =============================================================================
   PROJECT ACTION BAR — the phone-only bar pinned to the bottom of the screen.

   A plot is decided on a phone, and the enquiry form is at the END of a page
   this long. Everything above it used to repeat a "Book a site visit" pill every
   other section to compensate. This carries the three real asks — call,
   WhatsApp, book — once, permanently, and lets the sections above it stop
   repeating themselves.

   ─── IT GETS OUT OF THE WAY ───────────────────────────────────────────────
   It disappears the moment the enquiry section comes into view, for two
   reasons: the form itself is then on screen, so the bar is asking for
   something the visitor is already looking at; and the footer follows
   immediately, which a fixed bar would otherwise cover with no way to scroll
   past it.

   It UNMOUNTS rather than fading out, so its links leave the tab order with it
   — a transparent bar full of reachable buttons over the footer is worse than
   no animation.

   Desktop never sees it: the section rail is on screen throughout there, and it
   carries Enquire.
   ========================================================================== */

export function ProjectActionBar({
  callHref,
  whatsappLink,
  enquireId,
  name,
}: {
  /** A ready `tel:` destination, or null when the CMS has no real number. */
  callHref: string | null;
  whatsappLink: string | null;
  /** The id of the enquiry section — watched, and the bar's own destination. */
  enquireId: string;
  name: string;
}) {
  const [reached, setReached] = useState(false);

  /* 🔴 `isIntersecting` ALONE IS NOT THE TEST, and getting this wrong puts the
     bar back over the footer.

     The enquiry section is the second-to-last thing on the page. Hiding on
     `isIntersecting` hides the bar while the form is on screen and then shows it
     again the moment the form scrolls off the TOP — i.e. over "More projects"
     and the whole footer, which is exactly the overlap this has to avoid.

     So the entry's own geometry decides: the bar goes when the section is
     visible OR when it has gone past above (`top < 0`). Scrolling back UP above
     the form brings it back, which is right — the ask is out of reach again. */
  useEffect(() => {
    const el = document.getElementById(enquireId);
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry) return;
      setReached(entry.isIntersecting || entry.boundingClientRect.top < 0);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [enquireId]);

  if (reached) return null;

  const secondary = cx(
    'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-pill px-4 text-body-sm font-medium',
    'border border-gold-line bg-bg text-ink',
  );

  return (
    <div
      className={cx(
        'fixed inset-x-0 bottom-0 z-40 border-t border-gold-line bg-surface/95 backdrop-blur-[13px]',
        'pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_30px_-22px_rgba(122,90,34,0.7)] tablet:hidden',
      )}
    >
      <div className="flex items-center gap-2 px-4 py-2.5">
        {callHref ? (
          <a href={callHref} className={secondary}>
            <Icon name="phone" size={16} />
            Call
          </a>
        ) : null}

        {whatsappLink ? (
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className={secondary}>
            <Icon name="whatsapp" size={16} />
            <span className="visually-hidden">Chat on </span>
            WhatsApp
          </a>
        ) : null}

        <a
          href={`#${enquireId}`}
          className={cx(
            'inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-pill',
            'bg-gold px-4 text-body-sm font-semibold text-core-black',
          )}
        >
          Book a visit
          <span className="visually-hidden">to {name}</span>
        </a>
      </div>
    </div>
  );
}
