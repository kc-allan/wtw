import { EventTypeKey } from "@wtw/shared";
import { nameLines } from "@/app/_components/invitation-card";

/**
 * The card alongside the later steps, showing what is being made from the
 * answers so far. It deliberately carries no theme: a design has not been
 * chosen yet, so it wears the brand's own colour until one is.
 */
const CONGRATULATIONS: Record<string, string> = {
  [EventTypeKey.WEDDING]: "Congratulations on your Nuptials",
  [EventTypeKey.BIRTHDAY]: "Happy birthday to",
  [EventTypeKey.BABY_SHOWER]: "A little one is on the way for",
  [EventTypeKey.GRADUATION]: "Congratulations, graduate",
  [EventTypeKey.ANNIVERSARY]: "Congratulations on your anniversary",
  [EventTypeKey.BRIDAL_SHOWER]: "Before the big day, for",
  [EventTypeKey.CORPORATE]: "You are invited to",
};

export function DraftPreview({
  typeKey,
  hostNames,
  title,
}: {
  typeKey: EventTypeKey;
  hostNames: string[];
  title: string;
}) {
  const lines = nameLines(hostNames, title);

  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl bg-ember px-8 py-16 text-center lg:min-h-[640px] xl:min-h-[780px]">
      <p className="text-base text-white/90">
        {CONGRATULATIONS[typeKey] ?? "You are invited to"}
      </p>

      <p className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <HeartIcon />
        {lines.map((line) => (
          <span
            key={line}
            className="text-3xl font-semibold text-balance text-white sm:text-4xl"
          >
            {line}
          </span>
        ))}
      </p>
    </div>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 32 30" className="h-7 w-7 shrink-0" fill="none" aria-hidden>
      <path
        d="M16 27S3.5 19.6 3.5 11.3A6.8 6.8 0 0 1 16 7.6a6.8 6.8 0 0 1 12.5 3.7C28.5 19.6 16 27 16 27Z"
        stroke="#fff"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M20.5 15.5h4M22.5 13.5v4"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
