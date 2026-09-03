import Link from "next/link";
import type { CreateStep } from "@/lib/create-flow";

/**
 * The progress strip across the top of every step: a way back, then the steps
 * with the ones behind you ticked. Only steps already answered are links —
 * jumping ahead would skip the answer the next step is built from.
 */
export function StepStrip({
  steps,
  currentId,
  backHref,
}: {
  steps: CreateStep[];
  currentId: string;
  backHref: string;
}) {
  const currentIndex = steps.findIndex((step) => step.id === currentId);

  return (
    <nav aria-label="Progress" className="flex flex-wrap items-center gap-x-6 gap-y-3">
      <Link
        href={backHref}
        className="flex items-center gap-2 text-base text-black transition-opacity hover:opacity-70"
      >
        <ChevronLeft />
        Back
      </Link>

      <ol className="flex flex-wrap items-center gap-y-2">
        {steps.map((step, index) => {
          const done = index < currentIndex;
          const current = index === currentIndex;

          return (
            <li key={step.id} className="flex items-center">
              {index > 0 ? (
                <span aria-hidden className="mx-2 h-px w-6 bg-rule sm:mx-3 sm:w-10" />
              ) : null}

              <span className="flex items-center gap-2">
                {done ? (
                  <CheckMark />
                ) : (
                  <span
                    aria-hidden
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm ${
                      current ? "bg-blush text-ember" : "bg-blush/60 text-bark"
                    }`}
                  >
                    {index + 1}
                  </span>
                )}

                {done ? (
                  <Link
                    href={step.href}
                    className="text-base whitespace-nowrap text-black transition-opacity hover:opacity-70"
                  >
                    {step.label}
                  </Link>
                ) : (
                  <span
                    aria-current={current ? "step" : undefined}
                    className={`text-base whitespace-nowrap ${
                      current ? "text-ember" : "text-bark"
                    }`}
                  >
                    {step.label}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function CheckMark() {
  return (
    <span
      aria-label="Done"
      role="img"
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ember"
    >
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden>
        <path
          d="m5 12.5 4.5 4.5L19 7"
          stroke="#fff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function ChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d="M15 5 8 12l7 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
