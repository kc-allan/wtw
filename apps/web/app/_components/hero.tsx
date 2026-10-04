import { ButtonLink } from "./ui";

export function Hero() {
  return (
    <section className="w-full px-6 py-6">
      <div className="mx-auto flex w-full max-w-[1391px] flex-col items-center gap-4 px-4 text-center">
        <p className="text-base font-medium text-ember">
          Plan. Celebrate. Remember
        </p>
        <h1 className="text-display font-semibold text-ink">
          For every moment worth celebrating.
        </h1>
        <p className="text-xl tracking-[0.02em] text-ink">
          Beautiful digital invitations made for your celebration.{" "}
          <br className="hidden md:inline" aria-hidden />
          Choose a design, make it yours, and bring your guests together.
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href="/invitations" variant="ghost">
            Explore Invitations
          </ButtonLink>
          <ButtonLink href="/create">Create Yours</ButtonLink>
        </div>
      </div>
    </section>
  );
}
