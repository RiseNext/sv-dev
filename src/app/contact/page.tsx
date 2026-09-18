import { Suspense } from 'react';
import { Accordion } from '@/components/ui/Accordion';
import { Icon } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import { ContactForm } from '@/components/sections/ContactForm';
import { PageHero } from '@/components/sections/PageHero';
import { Statement } from '@/components/sections/Statement';
import { contact } from '@/content/pages';
import { site } from '@/content/site';
import { anchorProps, telHref } from '@/lib/href';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Contact',
  description: contact.hero.lead,
  path: '/contact',
});

const channels = [
  { icon: 'phone' as const, label: 'Phone', value: site.phone, href: telHref(site.phone) },
  { icon: 'whatsapp' as const, label: 'WhatsApp', value: site.whatsapp, href: site.whatsapp },
  { icon: 'mail' as const, label: 'Email', value: site.email, href: `mailto:${site.email}` },
];

export default function ContactPage() {
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
          <Reveal className="rounded-media bg-surface p-6 tablet:p-10">
            <Suspense fallback={null}>
              <ContactForm />
            </Suspense>
          </Reveal>

          <Reveal delay={100} className="flex flex-col gap-4">
            <ul className="grid gap-px overflow-hidden rounded-media bg-line">
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

            <div className="rounded-media bg-surface p-6">
              <p className="font-mono text-body-xs uppercase tracking-[0.06em] text-ink-faint">
                Site office
              </p>
              <address className="mt-3 text-body-sm text-ink">
                {site.address.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
              <p className="mt-4 text-body-sm text-ink-soft">{site.officeHours}</p>
              <a
                {...anchorProps(site.mapUrl)}
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
        <Accordion items={contact.faq} />
      </div>

      <div className="pb-section-sm" />
    </>
  );
}
