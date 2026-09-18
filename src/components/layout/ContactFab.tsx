'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/cx';
import { isPlaceholder } from '@/lib/href';
import { site } from '@/content/site';
import styles from './ContactFab.module.css';

export function ContactFab() {
  const [pastHero, setPastHero] = useState(false);
  const [footerInView, setFooterInView] = useState(false);

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.5);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer || typeof IntersectionObserver === 'undefined') return;

    const io = new IntersectionObserver(([entry]) => setFooterInView(!!entry?.isIntersecting), {
      threshold: 0.05,
    });
    io.observe(footer);
    return () => io.disconnect();
  }, []);

  const configured = !isPlaceholder(site.whatsapp);
  const visible = pastHero && !footerInView;

  return (
    <a
      className={cx(styles.fab, visible && styles.visible)}
      href={configured ? `https://wa.me/${site.whatsapp}` : '/contact'}
      {...(configured ? { target: '_blank', rel: 'noopener noreferrer' } : null)}
      aria-hidden={visible ? undefined : true}
      tabIndex={visible ? undefined : -1}
      aria-label={
        configured
          ? `Message ${site.name} on WhatsApp (opens in a new tab)`
          : 'Go to the contact page'
      }
    >
      <Icon name="whatsapp" size={26} />
    </a>
  );
}
