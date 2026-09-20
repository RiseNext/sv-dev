'use client';

/* The repository had NO error boundary. A thrown error in a Server Component —
   most plausibly the CMS being unreachable during a revalidation — would
   otherwise render Next's default stack-trace page to a visitor.

   ⚠️ `loading.tsx` is DELIBERATELY NOT ADDED. Every page here is statically
   prerendered, so a loading skeleton would be a visual regression, not an
   improvement: it would flash where previously there was finished HTML. */

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="px-gutter py-32">
      <div className="container-page max-w-[52ch]">
        <p className="font-mono text-body-xs uppercase tracking-[0.06em] text-ink-faint">
          Something went wrong
        </p>
        <h1 className="mt-4 text-display-sm text-ink">
          This page could not be loaded.
        </h1>
        <p className="mt-4 text-body text-ink-soft">
          Please try again. If it keeps happening, call us and we will help you directly.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-8 min-h-12 rounded-pill border border-line-strong px-6 text-body-sm text-ink transition-colors hover:border-ink"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
