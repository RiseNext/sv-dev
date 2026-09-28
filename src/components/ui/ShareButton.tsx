'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/cx';

/* =============================================================================
   SHARE BUTTON — hands the visitor a link to one project.

   Two routes, chosen at CLICK time rather than at render, because the answer
   depends on the device and not on the markup:

     · `navigator.share` — the phone's own share sheet (WhatsApp, Messages,
       …). This is the one that matters here: a plot gets sent to family
       before it is discussed, and almost always from a phone.
     · the clipboard — every desktop browser, which has no share sheet. The
       button then says "Link copied" for a moment, because a copy with no
       acknowledgement reads as a dead button.

   Dismissing the share sheet rejects with `AbortError`. That is a CANCEL, not
   a failure: it must not fall through to writing the clipboard the visitor
   just declined to share from. Any other rejection does fall through, so a
   browser that offers `share` but cannot complete it still leaves the link
   somewhere useful.

   The URL is built at click time from `location.origin`, so it is right on the
   live domain, on a preview deployment and on localhost with nothing to
   configure.

   It is a <button>, not a <Link>: sharing is an action and there is nothing to
   link to. Without JavaScript it does nothing at all, and the "View project"
   link beside it still goes where it goes.
   ========================================================================== */

/** How long the copy confirmation stays up. */
const COPIED_MS = 2200;

export function ShareButton({
  href,
  name,
  text,
  className,
}: {
  /** Path to the project, e.g. `/projects/sri-vanam`. */
  href: string;
  /** The project's name — what the share sheet is titled, and what the
      button's label names, since one page carries several of these. */
  name: string;
  /** Optional blurb for the share sheet's body. */
  text?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* An unmount mid-confirmation must not leave a timer holding a setState —
     the deck unmounts cards as the CMS list changes. */
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const share = useCallback(async () => {
    const url = new URL(href, window.location.origin).toString();

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: name, text, url });
        return;
      } catch (error) {
        if ((error as DOMException)?.name === 'AbortError') return;
        /* Anything else: fall through and put it on the clipboard instead. */
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), COPIED_MS);
    } catch {
      /* The clipboard is blocked (an insecure origin, or the permission was
         refused). There is nothing sensible left to do, and an alert would be
         worse than silence. */
    }
  }, [href, name, text]);

  return (
    <span className={cx('relative inline-flex', className)}>
      <button
        type="button"
        onClick={share}
        aria-label={`Share ${name}`}
        className={cx(
          'inline-flex size-11 items-center justify-center rounded-full bg-gold-soft text-ink',
          'transition-[background-color,scale] duration-300 ease-out-soft',
          'hover:bg-gold active:scale-95 motion-reduce:transition-none',
        )}
      >
        <Icon name={copied ? 'check' : 'share'} size={17} />
      </button>

      {/* Announced once, for a reader who cannot see the pill below. */}
      <span role="status" aria-live="polite" className="visually-hidden">
        {copied ? `Link to ${name} copied` : ''}
      </span>

      {/* The pill is `aria-hidden` — the live region above is what gets
          announced, and both would say it twice. */}
      <span
        aria-hidden="true"
        className={cx(
          'pointer-events-none absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 whitespace-nowrap',
          'rounded-pill bg-ink px-3 py-1.5 text-body-xs font-medium text-bg',
          'transition-opacity duration-200 ease-out-soft motion-reduce:transition-none',
          copied ? 'opacity-100' : 'opacity-0',
        )}
      >
        Link copied
      </span>
    </span>
  );
}
