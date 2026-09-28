import { LinkButton } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <section className="flex min-h-svh flex-col items-center justify-center px-gutter text-center">
      <p className="label-mono font-mono">404</p>
      <h1 className="mt-6 max-w-[18ch] text-heading-lg text-ink">
        That page has moved <em>or never existed.</em>
      </h1>
      <p className="mt-5 max-w-[46ch] text-body-md text-ink-soft">
        Every live project has a page under Projects. Start there, or tell us what you were looking
        for and we will send it.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <LinkButton href="/projects">Browse the projects</LinkButton>
        <LinkButton href="/" variant="ghost">
          Back to home
        </LinkButton>
      </div>
    </section>
  );
}
