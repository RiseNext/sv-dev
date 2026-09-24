import { cx } from '@/lib/cx';

/* The design template's curved edge where a dark band meets the cream page.

   Drawn as the CREAM that is cut back into the band — laid over the band's top
   or bottom edge — rather than as the band's own outline, so the band stays a
   plain rectangle with a solid background and nothing behind it can show
   through a gap. `preserveAspectRatio="none"` lets one path stretch to any
   width; only its height changes by breakpoint. */

const PATHS = {
  top: 'M0,0 H1440 V26 C1190,74 930,76 660,44 C420,16 200,10 0,38 Z',
  bottom: 'M0,80 H1440 V38 C1210,6 960,2 700,30 C450,56 220,60 0,36 Z',
} as const;

export function Wave({ edge, className }: { edge: 'top' | 'bottom'; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      className={cx(
        'pointer-events-none absolute inset-x-0 block h-10 w-full text-cream tablet:h-16 desktop:h-20',
        edge === 'top' ? 'top-0' : 'bottom-0',
        className,
      )}
    >
      <path d={PATHS[edge]} fill="currentColor" />
    </svg>
  );
}
