'use client';

import { useRouter } from 'next/navigation';
import { useId, useState, type FormEvent } from 'react';
import { Icon } from '@/components/ui/Icon';
import { isPlaceholder, whatsappHref } from '@/lib/href';

/* The reference captures an email here. A plot buyer gives a phone number, so
   this captures a number and hands it to WhatsApp — the channel this market
   actually replies on.

   While `site.whatsapp` is still a [BRACKETED] placeholder there is nowhere to
   send it, so the pill routes to /contact with the number prefilled instead of
   opening a dead deep link. */

/* 🔴 A 'use client' module, so `siteName` and `whatsapp` arrive as props.

   ⚠️ THE CONSEQUENCE OF A REAL WHATSAPP NUMBER, STATED PLAINLY:
   the moment an admin types one into the CMS, `whatsappReady` flips and this
   pill STOPS routing to /contact — so the enquiry goes straight to WhatsApp and
   NO LEAD ROW IS EVER CREATED. That is a deliberate, documented trade-off in the
   backend (the `whatsapp` field's admin help text says so in three sentences),
   not an accident. Until a WhatsApp hand-off endpoint exists, a real number here
   means those enquiries are not recorded anywhere. */
export function EnquiryPill({
  siteName,
  whatsapp,
}: {
  siteName: string;
  whatsapp: string;
}) {
  const router = useRouter();
  const inputId = useId();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  const whatsappReady = !isPlaceholder(whatsapp);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const digits = phone.replace(/\D/g, '');

    if (digits.length < 10) {
      setError('Enter a 10-digit mobile number.');
      return;
    }
    setError(null);

    const message = `Hi ${siteName}, please call me about a site visit. My number is ${digits}.`;

    if (whatsappReady) {
      /* 🔴 `whatsappHref`, NOT a hand-built wa.me URL. This stripped the
         non-digits and stopped there, which for the stored "9306432399" gave
         `wa.me/9306432399` — ten digits with no country code, which wa.me
         cannot resolve. The helper adds the 91 (and drops a leading 0), and is
         what the floating button and the contact page already use, so the same
         number now opens the same chat from all three. */
      window.open(
        `${whatsappHref(whatsapp)}?text=${encodeURIComponent(message)}`,
        '_blank',
        'noopener,noreferrer',
      );
      return;
    }

    router.push(`/contact?phone=${encodeURIComponent(digits)}`);
  };

  return (
    /* 🔴 `enquiry-pill` IS A HOOK, NOT A STYLE. The hero pane carries
       `on-dark`, which forces every focus ring inside it WHITE for legibility
       over footage — and this pill's own surface is cream, so that ring would
       be invisible on it. The rule restoring a dark outline lives in
       globals.css beside `.hero-glass`'s, which used to do this job before the
       panel was removed from the hero. Nothing else depends on the class. */
    <div className="enquiry-pill mx-auto w-full max-w-[30rem]">
      <form
        onSubmit={onSubmit}
        className="flex items-center gap-1 rounded-card border border-white/40 bg-surface/90 p-1.5 shadow-[0_10px_40px_rgba(122,90,34,0.14)] backdrop-blur-[13px]"
      >
        <label htmlFor={inputId} className="visually-hidden">
          Your mobile number
        </label>
        <input
          id={inputId}
          name="phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="Your mobile number"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className="min-h-11 min-w-0 flex-1 bg-transparent px-4 text-body-sm text-ink outline-none placeholder:text-ink-faint"
        />
        <button
          type="submit"
          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-pill bg-gold px-5 text-body-sm font-medium text-core-black transition-colors hover:bg-gold-deep"
        >
          {whatsappReady ? <Icon name="whatsapp" size={16} /> : null}
          Book a site visit
        </button>
      </form>

      {/* 🔶 THE MESSAGE CARRIES ITS OWN SURFACE NOW. It used to sit inside the
          hero's frosted panel, which is gone — so over a bright slide red type
          on bare footage was a validation error nobody could read. A frosted
          chip, `w-fit` so it hugs the sentence rather than drawing a bar the
          width of the pill. It is `mx-auto` for the same reason the pill is. */}
      {error ? (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="mx-auto mt-2 w-fit rounded-pill bg-surface/90 px-3 py-1 text-center text-body-xs text-danger backdrop-blur-[13px]"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
