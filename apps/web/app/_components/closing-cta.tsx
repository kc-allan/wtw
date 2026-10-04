import { ButtonLink } from "./ui";

/** The last thing on the page: one design chosen, one invitation to make. */
export function ClosingCta() {
  return (
    <section aria-labelledby="closing-cta-heading" className="w-full px-6 py-16">
      <div className="mx-auto flex w-full max-w-[720px] flex-col items-center gap-3 text-center">
        <h2
          id="closing-cta-heading"
          className="font-serif text-section font-semibold text-black"
        >
          Found your favourite? Make it yours.
        </h2>
        <p className="text-base tracking-[0.02em] text-ink/70">
          Choose your design, add your details and create an invitation made for your
          celebration.
        </p>
        <ButtonLink href="/create" className="mt-2">
          Create Your Invitation
        </ButtonLink>
      </div>
    </section>
  );
}
