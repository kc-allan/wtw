export function Hero() {
  return (
    <section className="w-full px-6 py-6">
      <div className="mx-auto flex w-full max-w-[1391px] flex-col items-center gap-4 px-4 text-center">
        <p className="text-base font-medium text-ember">
          Plan. Celebrate. Remember
        </p>
        <h1 className="text-display font-semibold text-ink">
          {/* Every celebration{" "}
          <br className="hidden md:inline" aria-hidden />
          deserves to be <span className="text-ink-strong">worth the wait</span> */}
          Bring your celebration to life.
        </h1>
        <p className="text-xl tracking-[0.02em] text-ink">
          Create a beautiful event website, manage RSVPs, share your gift registry and discover trusted vendors across Africa.{" "}
          <br className="hidden md:inline" aria-hidden />
          Everything you need, all in one place.
        </p>
      </div>
    </section>
  );
}
