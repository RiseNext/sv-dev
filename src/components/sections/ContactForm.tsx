'use client';

import { useSearchParams } from 'next/navigation';
import { useId, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/cx';

/* =============================================================================
   ⚠️ THIS MODULE NO LONGER IMPORTS `projects` DIRECTLY.

   It used to do `import { projects } from '@/content/projects'` — which worked
   only because that was a static array. A 'use client' module CANNOT import
   server-fetched data, so the project list now arrives as a PROP from
   `app/contact/page.tsx`.

   That matters beyond tidiness: FR-LEAD-03 requires `projectSlug` to be
   validated against known slugs, so the options the visitor SEES and the set the
   server ACCEPTS must be the same set. Passing them down from the server
   guarantees it.
   ========================================================================== */

/** Widened from `'name' | 'phone'`: the server can now report errors on
 *  `project` and `message` too, and every code it returns must land in a slot
 *  that already exists. */
type ErrorKey = 'name' | 'phone' | 'project' | 'message';
type Errors = Partial<Record<ErrorKey, string>>;

export type ContactFormProject = { slug: string; name: string; locality: string };

type ServerError = {
  error?: {
    code?: string;
    message?: string;
    requestId?: string;
    details?: { field?: string; code?: string; message?: string }[];
  };
};

const FIELD =
  'min-h-12 w-full rounded-pill border border-line-strong bg-surface px-4 text-body-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-ink';

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent' }
  | { kind: 'failed'; message: string; requestId?: string };

/* The hero's capture pill hands the number over in ?phone=, so a visitor who
   started there does not type it twice. */

export function ContactForm({
  projects,
  formNote,
}: {
  projects: ContactFormProject[];
  formNote?: string;
}) {
  const id = useId();
  const params = useSearchParams();
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Double-submit guard. Neither this nor a pending state existed before.
    if (status.kind === 'sending') return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim();
    const phone = String(data.get('phone') ?? '').trim();
    const project = String(data.get('project') ?? '').trim();
    const message = String(data.get('message') ?? '').trim();

    /* Client-side validation stays EXACTLY as strict as it was, and no
       stricter. The server currently accepts >= 8 digits to match this rule
       precisely — a backend enforcing 10 against a form that accepts 8 would
       reject real enquiries with a 422 that reads as "the site is broken".
       Both thresholds move together, in one release, or neither moves. */
    const next: Errors = {};
    if (!name) next.name = 'Please enter your name.';
    if (!phone) next.phone = 'Please enter a number we can call back on.';
    else if (phone.replace(/\D/g, '').length < 8) next.phone = 'That number looks incomplete.';

    setErrors(next);

    if (Object.keys(next).length > 0) {
      setStatus({ kind: 'idle' });
      const firstKey = Object.keys(next)[0];
      if (firstKey) document.getElementById(`${id}-${firstKey}`)?.focus();
      return;
    }

    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!base) {
      setStatus({
        kind: 'failed',
        message:
          'The enquiry form is not configured yet, so nothing has been sent. Please call us instead.',
      });
      return;
    }

    setStatus({ kind: 'sending' });

    try {
      const response = await fetch(`${base.replace(/\/+$/, '')}/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Lets a double-tap on a flaky mobile connection replay the original
          // 201 instead of creating a second enquiry.
          'Idempotency-Key': `${id}-${Date.now()}`,
        },
        body: JSON.stringify({
          name,
          phone,
          ...(project ? { projectSlug: project } : {}),
          ...(message ? { message } : {}),
          // The honeypot. Rendered off-screen below and always empty for a
          // human; a bot that fills every field trips it.
          website: String(data.get('website') ?? ''),
        }),
      });

      if (response.status === 201) {
        /* 🔴 SUCCESS IS SHOWN ONLY FOR A REAL 201.
           This form previously refused to fake a success, on the stated
           principle that "a visitor told 'we'll call you back' when nothing was
           sent is worse off than one who sees no form at all". That principle is
           preserved exactly — the message is now true. */
        form.reset();
        setErrors({});
        setStatus({ kind: 'sent' });
        return;
      }

      const body = (await response.json().catch(() => ({}))) as ServerError;

      if (response.status === 422 && body.error?.details?.length) {
        // Server field names match the input `name` attributes exactly, so
        // these land in the EXISTING inline slots with no redesign.
        const mapped: Errors = {};
        for (const detail of body.error.details) {
          const field = detail.field as ErrorKey | undefined;
          if (field && ['name', 'phone', 'project', 'message'].includes(field)) {
            mapped[field] = detail.message ?? 'Please check this field.';
          }
        }
        setErrors(mapped);
        setStatus({ kind: 'idle' });
        const firstKey = Object.keys(mapped)[0];
        if (firstKey) document.getElementById(`${id}-${firstKey}`)?.focus();
        return;
      }

      if (response.status === 429) {
        setStatus({
          kind: 'failed',
          message: 'That is a lot of enquiries in a short time. Please try again in a few minutes.',
        });
        return;
      }

      setStatus({
        kind: 'failed',
        message: 'We could not send that just now. Please try again, or call us directly.',
        requestId: body.error?.requestId,
      });
    } catch {
      setStatus({
        kind: 'failed',
        message: 'We could not reach our server. Please check your connection, or call us directly.',
      });
    }
  };

  const describe = (key: ErrorKey) => ({
    id: `${id}-${key}`,
    name: key,
    className: cx(FIELD, errors[key] && 'border-danger'),
    'aria-describedby': errors[key] ? `${id}-${key}-error` : undefined,
    'aria-invalid': errors[key] ? true : undefined,
  });

  const label = 'mb-2 block font-mono text-body-xs uppercase tracking-[0.06em] text-ink-faint';

  const fieldError = (key: ErrorKey) =>
    errors[key] ? (
      <p id={`${id}-${key}-error`} className="mt-2 text-body-xs text-danger">
        {errors[key]}
      </p>
    ) : null;

  return (
    <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
      <div className="grid gap-5 min-[30rem]:grid-cols-2">
        <div>
          <label className={label} htmlFor={`${id}-name`}>
            Name
          </label>
          <input {...describe('name')} autoComplete="name" placeholder="Your name" />
          {fieldError('name')}
        </div>

        <div>
          <label className={label} htmlFor={`${id}-phone`}>
            Phone
          </label>
          <input
            {...describe('phone')}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            defaultValue={params.get('phone') ?? ''}
            placeholder="10-digit mobile number"
          />
          {fieldError('phone')}
        </div>
      </div>

      <div>
        <label className={label} htmlFor={`${id}-project`}>
          Project of interest (optional)
        </label>
        <select {...describe('project')} defaultValue="">
          <option value="">No preference</option>
          {projects.map((project) => (
            <option key={project.slug} value={project.slug}>
              {project.name} — {project.locality}
            </option>
          ))}
        </select>
        {fieldError('project')}
      </div>

      <div>
        <label className={label} htmlFor={`${id}-message`}>
          Anything else (optional)
        </label>
        <textarea
          {...describe('message')}
          rows={4}
          className={cx(FIELD, 'min-h-32 rounded-card py-3', errors.message && 'border-danger')}
          placeholder="Plot size, budget, when you would like to visit"
        />
        {fieldError('message')}
      </div>

      {/* THE HONEYPOT. Off-screen rather than display:none, because some bots
          skip hidden inputs. Never focusable, never announced, never
          autofilled. A human cannot reach it; a bot that fills everything
          trips it, and the server then returns a response byte-identical to
          success so the bot cannot tell. */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
        <label htmlFor={`${id}-website`}>Leave this field empty</label>
        <input
          id={`${id}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" disabled={status.kind === 'sending'}>
          {status.kind === 'sending' ? 'Sending…' : 'Request a call back'}
          <Icon name="arrowRight" size={16} />
        </Button>
        {formNote ? <p className="max-w-[34ch] text-body-xs text-ink-faint">{formNote}</p> : null}
      </div>

      {status.kind === 'sent' ? (
        <p
          role="status"
          className="rounded-card border border-line bg-surface p-4 text-body-sm text-ink-soft"
        >
          Thanks — we have your enquiry and will call you back.
        </p>
      ) : null}

      {status.kind === 'failed' ? (
        <p
          role="alert"
          className="rounded-card border border-danger bg-surface p-4 text-body-sm text-ink-soft"
        >
          {status.message}
          {status.requestId ? (
            <span className="mt-2 block font-mono text-body-xs text-ink-faint">
              Reference: {status.requestId}
            </span>
          ) : null}
        </p>
      ) : null}
    </form>
  );
}
