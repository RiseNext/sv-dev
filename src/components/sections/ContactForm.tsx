'use client';

import { useSearchParams } from 'next/navigation';
import { useId, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { contact } from '@/content/pages';
import { projects } from '@/content/projects';
import { cx } from '@/lib/cx';

type Errors = Partial<Record<'name' | 'phone', string>>;

const FIELD =
  'min-h-12 w-full rounded-pill border border-line-strong bg-surface px-4 text-body-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-ink';

/* The hero's capture pill hands the number over in ?phone=, so a visitor who
   started there does not type it twice. */

export function ContactForm() {
  const id = useId();
  const params = useSearchParams();
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<string | null>(null);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get('name') ?? '').trim();
    const phone = String(data.get('phone') ?? '').trim();

    const next: Errors = {};
    if (!name) next.name = 'Please enter your name.';
    if (!phone) next.phone = 'Please enter a number we can call back on.';
    else if (phone.replace(/\D/g, '').length < 8) next.phone = 'That number looks incomplete.';

    setErrors(next);

    if (Object.keys(next).length > 0) {
      setStatus(null);
      const firstKey = Object.keys(next)[0];
      if (firstKey) document.getElementById(`${id}-${firstKey}`)?.focus();
      return;
    }

    /* No endpoint is wired up, and this deliberately does NOT fake a success
       message. A visitor told "we'll call you back" when nothing was sent is
       worse off than one who sees no form at all. */
    setStatus(
      'This form is not connected to a handler yet, so nothing has been sent. Wire it to your CRM or an email service before publishing — see the README.',
    );
  };

  const describe = (key: 'name' | 'phone') => ({
    id: `${id}-${key}`,
    name: key,
    className: cx(FIELD, errors[key] && 'border-danger'),
    'aria-describedby': errors[key] ? `${id}-${key}-error` : undefined,
    'aria-invalid': errors[key] ? true : undefined,
  });

  const label = 'mb-2 block font-mono text-body-xs uppercase tracking-[0.06em] text-ink-faint';

  return (
    <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
      <div className="grid gap-5 min-[30rem]:grid-cols-2">
        <div>
          <label className={label} htmlFor={`${id}-name`}>
            Name
          </label>
          <input {...describe('name')} autoComplete="name" placeholder="Your name" />
          {errors.name ? (
            <p id={`${id}-name-error`} className="mt-2 text-body-xs text-danger">
              {errors.name}
            </p>
          ) : null}
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
          {errors.phone ? (
            <p id={`${id}-phone-error`} className="mt-2 text-body-xs text-danger">
              {errors.phone}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label className={label} htmlFor={`${id}-project`}>
          Project of interest (optional)
        </label>
        <select id={`${id}-project`} name="project" className={FIELD} defaultValue="">
          <option value="">No preference</option>
          {projects.map((project) => (
            <option key={project.slug} value={project.slug}>
              {project.name} — {project.locality}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={label} htmlFor={`${id}-message`}>
          Anything else (optional)
        </label>
        <textarea
          id={`${id}-message`}
          name="message"
          rows={4}
          className={cx(FIELD, 'min-h-32 rounded-card py-3')}
          placeholder="Plot size, budget, when you would like to visit"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg">
          Request a call back
          <Icon name="arrowRight" size={16} />
        </Button>
        <p className="max-w-[34ch] text-body-xs text-ink-faint">{contact.formNote}</p>
      </div>

      {status ? (
        <p
          role="status"
          className="rounded-card border border-line bg-surface p-4 text-body-sm text-ink-soft"
        >
          {status}
        </p>
      ) : null}
    </form>
  );
}
