'use client';

import { useId, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/cx';
import { contact } from '@/content/pages';
import { projects } from '@/content/projects';
import styles from './ContactForm.module.css';

type Errors = Partial<Record<'name' | 'phone', string>>;

export function ContactForm() {
  const id = useId();
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
       worse off than one who sees no form at all. See README → Before you go live. */
    setStatus(
      'This form is not connected to a handler yet, so nothing has been sent. Wire it to your CRM or an email service before publishing — see the README.',
    );
  };

  const field = (key: 'name' | 'phone') => ({
    id: `${id}-${key}`,
    name: key,
    className: cx(styles.input, errors[key] && styles.invalid),
    'aria-describedby': errors[key] ? `${id}-${key}-error` : undefined,
    'aria-invalid': errors[key] ? true : undefined,
  });

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className={styles.twoUp}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor={`${id}-name`}>
            Name
          </label>
          <input {...field('name')} autoComplete="name" />
          {errors.name ? (
            <p id={`${id}-name-error`} className={styles.error}>
              <Icon name="close" size={14} />
              {errors.name}
            </p>
          ) : null}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={`${id}-phone`}>
            Phone
          </label>
          <input {...field('phone')} type="tel" inputMode="tel" autoComplete="tel" />
          {errors.phone ? (
            <p id={`${id}-phone-error`} className={styles.error}>
              <Icon name="close" size={14} />
              {errors.phone}
            </p>
          ) : null}
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${id}-project`}>
          Project of interest <span className={styles.optional}>(optional)</span>
        </label>
        <select id={`${id}-project`} name="project" className={styles.select} defaultValue="">
          <option value="">No preference</option>
          {projects.map((project) => (
            <option key={project.slug} value={project.slug}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${id}-message`}>
          Message <span className={styles.optional}>(optional)</span>
        </label>
        <textarea
          id={`${id}-message`}
          name="message"
          className={styles.textarea}
          placeholder="Plot size, preferred visit day, anything else."
        />
      </div>

      <p className={styles.note}>{contact.formNote}</p>

      <Button type="submit" size="lg">
        Request a callback
      </Button>

      {/* Announced when it appears, without stealing focus. */}
      <div role="status" aria-live="polite">
        {status ? (
          <p className={styles.status}>
            <Icon name="document" size={18} />
            {status}
          </p>
        ) : null}
      </div>
    </form>
  );
}
