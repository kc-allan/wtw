import type { Metadata } from "next";
import { Accordion } from "@/app/_components/accordion";
import { ButtonLink, PageHeading } from "@/app/_components/ui";
import { pricingFaqs, pricingPlans } from "@/app/_data/marketing";

export const metadata: Metadata = {
  title: "Pricing — Worth the Wait",
  description:
    "Pay once, per celebration. No subscription for hosts. Pick a plan when you are ready to publish. M-Pesa or card.",
};

export default function PricingPage() {
  return (
    <section className="mx-auto flex w-full max-w-[1340px] flex-col gap-12 px-6 py-12">
      <PageHeading
        eyebrow="Pricing"
        title="Pay once, per celebration."
        lead="No subscription for hosts. Pick a plan when you're ready to publish. M-Pesa or Card"
      />

      <ul className="grid gap-6 lg:grid-cols-3">
        {pricingPlans.map((plan) => (
          <li key={plan.id} className="relative flex">
            {plan.featured ? (
              <span className="absolute -top-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-gold px-5 py-2 text-sm font-medium whitespace-nowrap text-white">
                Most popular
              </span>
            ) : null}

            <div
              className={`flex w-full flex-col rounded-2xl bg-white p-8 ${
                plan.featured ? "border-2 border-forest" : "border border-transparent"
              }`}
            >
              <p className="text-base tracking-[0.02em] text-ink/70">{plan.eyebrow}</p>

              <p className="mt-2 text-3xl font-medium text-black">
                {plan.price}
                {plan.period ? (
                  <span className="text-base font-normal text-muted">{plan.period}</span>
                ) : null}
              </p>

              <p className="mt-3 text-base tracking-[0.02em] text-ink/80">{plan.summary}</p>

              <ul className="mt-6 flex flex-col gap-3">
                {plan.included.map((feature) => (
                  <li key={feature} className="flex gap-3 text-base text-ink">
                    <Tick />
                    {feature}
                  </li>
                ))}
                {plan.excluded?.map((feature) => (
                  <li key={feature} className="flex gap-3 text-base text-muted">
                    <Cross />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Pushes every card's action to the same baseline however many
                  features sit above it. */}
              <div className="mt-auto pt-8">
                <ButtonLink href={plan.cta.href} variant="ghost">
                  {plan.cta.label}
                </ButtonLink>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mx-auto w-full max-w-[1160px]">
        <h2 className="sr-only">Pricing questions</h2>
        <Accordion items={pricingFaqs} />
      </div>
    </section>
  );
}

function Tick() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className="mt-1 size-4 shrink-0 text-gold">
      <path
        d="m3 11 4 4 10-10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Cross() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className="mt-1 size-4 shrink-0 text-muted">
      <path
        d="M5 5l10 10M15 5L5 15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
