import { PageHero } from '@/components/layout/PageHero';
import { Icon } from '@/components/ui/Icon';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ContactForm } from '@/components/sections/ContactForm';
import { FaqList } from '@/components/sections/FaqList';
import { contact } from '@/content/pages';
import { site } from '@/content/site';
import { pageMetadata } from '@/lib/seo';
import styles from './page.module.css';

export const metadata = pageMetadata({
  title: 'Contact',
  description: 'Book a site visit or request a callback with directions, availability and pricing.',
  path: '/contact',
});

const details = [
  { icon: 'phone' as const, label: 'Phone', value: site.phone, href: `tel:${site.phone.replace(/[^\d+]/g, '')}` },
  { icon: 'mail' as const, label: 'Email', value: site.email, href: `mailto:${site.email}` },
  { icon: 'mapPin' as const, label: 'Site office', value: site.address.join(', ') },
  { icon: 'check' as const, label: 'Opening hours', value: site.officeHours },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow={contact.hero.eyebrow}
        title={contact.hero.title}
        lead={contact.hero.lead}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Contact' }]}
      />

      <Section aria-labelledby="contact-title">
        <div className={styles.layout}>
          <div>
            <SectionHeading
              eyebrow="Talk to us"
              title="Come and walk the layout"
              lead="Site visits run seven days a week. Tell us when suits and we will have someone meet you at the gate."
              id="contact-title"
            />

            <div className={styles.details}>
              {details.map((item) => (
                <div key={item.label} className={styles.detail}>
                  <Icon name={item.icon} size={20} />
                  <div>
                    <span className={styles.detailLabel}>{item.label}</span>
                    <span className={styles.detailValue}>
                      {item.href ? <a href={item.href}>{item.value}</a> : item.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <ContactForm />
        </div>
      </Section>

      <Section id="faq" tone="surface" aria-labelledby="faq-title">
        <SectionHeading
          eyebrow="Questions"
          title="Before you visit"
          lead="The five things buyers ask most often."
          id="faq-title"
        />
        <FaqList items={contact.faq} />
      </Section>
    </>
  );
}
