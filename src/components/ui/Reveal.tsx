'use client';

import { useEffect, useRef, useState, type ElementType, type HTMLAttributes } from 'react';

/* Scroll-into-view reveal: fade + rise, fires once, then the element is
   unobserved. One shared IntersectionObserver services every instance rather
   than one observer per element. */

let observer: IntersectionObserver | null = null;
const callbacks = new WeakMap<Element, () => void>();

function getObserver(): IntersectionObserver | null {
  if (typeof IntersectionObserver === 'undefined') return null;
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        callbacks.get(entry.target)?.();
        callbacks.delete(entry.target);
        observer?.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -6% 0px', threshold: 0.05 },
  );
  return observer;
}

type RevealProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  delay?: number;
};

export function Reveal({ as: Tag = 'div', delay = 0, style, children, ...rest }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || shown) return;

    const io = getObserver();
    if (!io) {
      setShown(true);
      return;
    }

    callbacks.set(node, () => setShown(true));
    io.observe(node);

    return () => {
      callbacks.delete(node);
      io.unobserve(node);
    };
  }, [shown]);

  return (
    <Tag
      ref={ref}
      data-reveal={shown ? 'shown' : 'pending'}
      style={delay ? { ...style, '--reveal-delay': `${delay}ms` } : style}
      {...rest}
    >
      {children}
    </Tag>
  );
}
