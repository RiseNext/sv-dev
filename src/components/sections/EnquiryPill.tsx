'use client';

import { useRouter } from 'next/navigation';
import { useId, useState, type FormEvent } from 'react';
import { Icon } from '@/components/ui/Icon';
import { site } from '@/content/site';
import { isPlaceholder } from '@/lib/href';

/* The reference captures an email here. A plot buyer gives a phone number, so
   this captures a number and hands it to WhatsApp — the channel this market
   actually replies on.

   While `site.whatsapp` is still a [BRACKETED] placeholder there is nowhere to
   send it, so the pill routes to /contact with the number prefilled instead of
   opening a dead deep link. */

export function EnquiryPill() {
  const router = useRouter();
  const inputId = useId();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  const whatsappReady = !isPlaceholder(site.whatsapp);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const digits = phone.replace(/\D/g, '');

    if (digits.length < 10) {
      setError('Enter a 10-digit mobile number.');
      return;
    }
    setError(null);

    const message = `Hi ${site.name}, please call me about a site visit. My number is ${digits}.`;

    if (whatsappReady) {
      window.open(
        `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`,
        '_blank',
        'noopener,noreferrer',
      );
      return;
    }

    router.push(`/contact?phone=${encodeURIComponent(digits)}`);
  };

  return (
    <div className="mx-auto w-full max-w-[30rem]">
      <form
        onSubmit={onSubmit}
        className="flex items-center gap-1 rounded-card border border-white/40 bg-surface/90 p-1.5 shadow-[0_10px_40px_rgba(26,22,19,0.1)] backdrop-blur-[13px]"
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
          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-pill bg-core-black px-5 text-body-sm font-medium text-white transition-colors hover:bg-ink"
        >
          {whatsappReady ? <Icon name="whatsapp" size={16} /> : null}
          Book a site visit
        </button>
      </form>

      {error ? (
        <p id={`${inputId}-error`} role="alert" className="mt-2 text-center text-body-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
