import { Suspense } from 'react';
import { Accordion } from '@/components/ui/Accordion';
import { Icon } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import { ContactForm } from '@/components/sections/ContactForm';
import { PageHero } from '@/components/sections/PageHero';
import { Statement } from '@/components/sections/Statement';
import { contact } from '@/content/pages';
import { getSiteSettings } from '@/lib/api/site';
import { getProjects } from '@/lib/api/projects';
import { getFaqs } from '@/lib/api/content';
import { anchorProps, mailHref, telHref, whatsappHref } from '@/lib/href';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata() {
  const site = await getSiteSettings();
  return pageMetadata({
    title: 'Contact',
    description: contact.hero.lead,
    path: '/contact',
    siteName: site.name,
  });
}

export default async function ContactPage() {
  const [site, projects, faqs] = await Promise.all([
    getSiteSettings(),
    getProjects(),
    getFaqs(),
  ]);

  /* 🔴 TWO LIVE BUGS FIXED HERE.
     · `mailto:` was built by hand, so `[EMAIL@DOMAIN]` produced the string
       `mailto:[EMAIL@DOMAIN]` — which `isPlaceholder()` cannot detect, because
       it requires the WHOLE string to be bracketed. A live, focusable, dead
       mailto shipped on this page.
     · WhatsApp was passed as the RAW DIGIT STRING, so it was inert only BY
       ACCIDENT. The moment a real number is entered in the CMS it becomes a
       RELATIVE link to /919XXXXXXXXX and 404s.
     Both now go through helpers in lib/href.ts that render a placeholder inert
     and a real value correctly. */
  const channels = [
    { icon: 'phone' as const, label: 'Phone', value: site.phone, href: telHref(site.phone) },
    {
      icon: 'whatsapp' as const,
      label: 'WhatsApp',
      value: site.whatsapp,
      href: whatsappHref(site.whatsapp),
    },
    { icon: 'mail' as const, label: 'Email', value: site.email, href: mailHref(site.email) },
  ];

  return (
    <>
      <PageHero
        label={contact.hero.eyebrow}
        title="Book a site visit."
        titleAccent="We will meet you at the gate."
        lead={contact.hero.lead}
      />

      <section className="px-gutter pt-16" aria-label="Enquiry">
        <div className="container-page grid gap-4 tablet:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          {/* A soft dark bloom sits under the enquiry card — decorative only, so
              it is blurred well inside the gutter and never carries type. It
              lifts the white form off the off-white field without introducing
              the hard dark band the palette rules out. */}
          {/* `theme-light` on the wrapper so the form card AND the dark glow
              behind it (`bg-ink/20`) keep their light-theme colours on the
              green field. */}
          <Reveal className="theme-light relative isolate">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-3 -z-10 rounded-[2rem] bg-ink/20 blur-2xl tablet:-inset-5"
            />
            <div className="rounded-media bg-surface p-6 tablet:p-10">
              <Suspense fallback={null}>
                <ContactForm
                  projects={projects.map((p) => ({
                    slug: p.slug,
                    name: p.name,
                    locality: p.locality,
                  }))}
                  formNote={site.formNote}
                />
              </Suspense>
            </div>
          </Reveal>

          <Reveal delay={100} className="flex flex-col gap-4">
            <ul className="theme-light grid gap-px overflow-hidden rounded-media bg-line">
              {channels.map((channel) => (
                <li key={channel.label} className="bg-surface">
                  <a
                    {...anchorProps(channel.href)}
                    className="flex items-center gap-4 px-6 py-5 transition-colors hover:bg-bg"
                  >
                    <Icon name={channel.icon} size={20} className="shrink-0 text-gold-ink" />
                    <span>
                      <span className="block font-mono text-body-xs uppercase tracking-[0.06em] text-ink-faint">
                        {channel.label}
                      </span>
                      <span className="mt-1 block text-body-sm text-ink">{channel.value}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="theme-light rounded-media bg-surface p-6">
              <p className="font-mono text-body-xs uppercase tracking-[0.06em] text-ink-faint">
                Site office
              </p>
              <address className="mt-3 text-body-sm text-ink">
                {site.address.map((line: string) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
              <p className="mt-4 text-body-sm text-ink-soft">{site.officeHours}</p>
              <a
                {...anchorProps(site.mapUrl ?? '[GOOGLE_MAPS_URL]')}
                className="mt-4 inline-flex items-center gap-2 text-body-sm font-medium text-ink"
              >
                <Icon name="mapPin" size={16} />
                Open in Maps
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <Statement id="faq" label="FAQ" title="Before you come," titleAccent="the usual questions" />
      <div className="container-prose mt-14">
        <Accordion
          items={faqs.length ? faqs.map((f) => ({ q: f.question, a: f.answer })) : contact.faq}
        />
      </div>

      <div className="pb-section-sm" />
    </>
  );
}
