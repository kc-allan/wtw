import Image from "next/image";
import { steps } from "@/app/_data/landing";
import { DriftingShapes } from "./drifting-shapes";

export function HowItWorks() {
  return (
    <section
      aria-labelledby="how-it-works-heading"
      /* `clip` rather than `hidden` so the sticky columns keep working. */
      className="w-full overflow-x-clip px-6 py-10 lg:p-10"
    >
      <div className="relative mx-auto flex w-full max-w-[1360px] flex-col items-start justify-between gap-10 lg:flex-row lg:gap-0">
        <DriftingShapes />

        <div className="flex flex-col gap-2 px-3 py-10 lg:sticky lg:top-0 lg:w-[578px] lg:shrink-0 lg:py-20">
          <p className="text-base tracking-[0.02em] text-ember">How it works</p>
          <h2
            id="how-it-works-heading"
            className="text-2xl font-semibold text-black"
          >
            Published in an afternoon
          </h2>
          <p className="max-w-[554px] text-base tracking-[0.02em] text-black">
            From picking a design to sending it to two hundred people,{" "}
            <br className="hidden xl:inline" aria-hidden />
            all of it happens on your phone, in one sitting.
          </p>
        </div>

        <ol className="relative flex w-full flex-col gap-[111px] py-10 lg:w-[617px] lg:shrink-0 lg:py-20">
          {steps.map((step) => (
            <li key={step.number} className="flex flex-col gap-[50px]">
              <Image
                src={step.illustration}
                alt=""
                width={step.width}
                height={step.height}
                unoptimized
                className="h-auto w-full max-w-[385px]"
              />
              <div className="flex flex-col gap-2">
                <h3 className="flex items-center gap-[22px] text-2xl font-normal tracking-[0.02em] text-black">
                  <span>{step.number}</span>
                  <span>{step.title}</span>
                </h3>
                <p className="text-base tracking-[0.02em] text-black">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
