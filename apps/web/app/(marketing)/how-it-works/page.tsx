import type { Metadata } from "next";
import { ButtonLink, PageHeading } from "@/app/_components/ui";
import { howItWorksSteps } from "@/app/_data/marketing";

export const metadata: Metadata = {
  title: "How it works — Worth the Wait",
  description:
    "From idea to invitation in nine steps. The same flow works for every celebration; the only thing that changes is which tools switch on.",
};

export default function HowItWorksPage() {
  return (
    <section className="mx-auto flex w-full max-w-[1160px] flex-col gap-10 px-6 py-12">
      <PageHeading
        eyebrow="How it works"
        title="From idea to invitation, in nine steps."
        lead="The same flow works for every celebration; the only thing that changes is which tools switch on."
      />

      <ol className="flex flex-col">
        {howItWorksSteps.map((step, index) => (
          <li key={step.title} className="flex gap-4 sm:gap-10">
            {/* The rail: a two-digit ordinal above a dotted line that stops
                after the final step rather than trailing into nothing. */}
            <div className="flex w-8 shrink-0 flex-col items-center sm:w-12">
              <span className="font-serif text-2xl text-gold tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              {index < howItWorksSteps.length - 1 ? (
                <span
                  aria-hidden
                  className="mt-3 w-px flex-1 border-l border-dashed border-gold/60"
                />
              ) : null}
            </div>

            <div className="flex-1 pb-10">
              <div className="rounded-lg bg-sand/45 px-4 py-5 sm:px-6">
                <h2 className="font-serif text-xl font-semibold text-black">
                  {step.title}
                </h2>
                <p className="mt-1 text-base tracking-[0.02em] text-ink/80">
                  {step.description}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <div className="flex justify-center">
        <ButtonLink href="/create" className="w-full max-w-[560px]">
          Create an event
        </ButtonLink>
      </div>
    </section>
  );
}
