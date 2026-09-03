import Link from "next/link";

export const WIZARD_STEPS = [
  { key: "type", label: "Event type" },
  { key: "template", label: "Template" },
  { key: "customize", label: "Customize" },
  { key: "publish", label: "Publish" },
  { key: "share", label: "Share" },
] as const;

export type WizardStepKey = (typeof WIZARD_STEPS)[number]["key"];

/**
 * Progress across the create flow. Completed steps are links back; the ones
 * ahead are inert, because reaching them out of order would skip the data the
 * next screen needs.
 */
export function WizardSteps({
  current,
  eventId,
}: {
  current: WizardStepKey;
  eventId?: string;
}) {
  const currentIndex = WIZARD_STEPS.findIndex((step) => step.key === current);

  return (
    <nav aria-label="Progress">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-3">
        {WIZARD_STEPS.map((step, index) => {
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;
          const href = eventId && index > 0 ? `/events/${eventId}/${step.key}` : "/create";

          const marker = (
            <span
              className={`grid size-7 shrink-0 place-items-center rounded-full text-sm ${
                isDone
                  ? "bg-forest text-bright"
                  : isCurrent
                    ? "border border-ember text-ember"
                    : "border border-rule text-muted"
              }`}
            >
              {isDone ? <CheckIcon /> : index + 1}
            </span>
          );

          const label = (
            <span
              className={`text-base whitespace-nowrap ${
                isCurrent ? "text-ember" : isDone ? "text-ink" : "text-muted"
              }`}
            >
              {step.label}
            </span>
          );

          return (
            <li key={step.key} className="flex items-center gap-2">
              {isDone && eventId ? (
                <Link
                  href={href}
                  className="flex items-center gap-2 outline-offset-4 hover:underline"
                >
                  {marker}
                  {label}
                </Link>
              ) : (
                <span
                  aria-current={isCurrent ? "step" : undefined}
                  className="flex items-center gap-2"
                >
                  {marker}
                  {label}
                </span>
              )}

              {index < WIZARD_STEPS.length - 1 ? (
                <span aria-hidden className="mx-2 hidden h-px w-10 bg-rule sm:block" />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className="size-3.5">
      <path
        d="m4 10.5 4 4 8-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
