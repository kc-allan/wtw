import { formatEventDate, formatEventTime } from "@/lib/event-display";
import type { Ceremony, ThemePalette } from "@/lib/types";

/**
 * The gatherings that make up the day, in order. A guest asked to only some of
 * them is sent only those, so this renders whatever it is given rather than
 * deciding who sees what.
 */
export function CeremonyProgramme({
  ceremonies,
  timezone,
  palette,
}: {
  ceremonies: Ceremony[];
  timezone: string;
  palette: ThemePalette;
}) {
  if (ceremonies.length === 0) return null;

  return (
    <section
      id="ceremonies"
      aria-labelledby="ceremonies-heading"
      className="scroll-mt-20 px-6 py-12"
      style={{ backgroundColor: palette.surface, color: palette.ink }}
    >
      <div className="mx-auto w-full max-w-[720px]">
        <h2
          id="ceremonies-heading"
          className="font-serif text-section font-semibold"
          style={{ color: palette.ink }}
        >
          {ceremonies.length === 1 ? "The ceremony" : "The ceremonies"}
        </h2>

        <ol className="mt-6 flex flex-col gap-6">
          {ceremonies.map((ceremony) => (
            <li
              key={ceremony.id}
              className="border-l-2 pl-5"
              style={{ borderColor: palette.accent }}
            >
              <h3 className="font-serif text-xl font-semibold" style={{ color: palette.ink }}>
                {ceremony.name}
              </h3>

              {ceremony.startsAt ? (
                <p className="mt-1 text-base" style={{ color: palette.ink }}>
                  {formatEventDate(ceremony.startsAt, timezone)}
                  {" · "}
                  {formatEventTime(ceremony.startsAt, timezone)}
                </p>
              ) : null}

              {ceremony.venueName || ceremony.city ? (
                <p className="mt-1 text-base" style={{ color: palette.muted }}>
                  {[ceremony.venueName, ceremony.city].filter(Boolean).join(", ")}
                </p>
              ) : null}

              {ceremony.dressCode ? (
                <p className="mt-1 text-base" style={{ color: palette.muted }}>
                  Dress code: {ceremony.dressCode}
                </p>
              ) : null}

              {ceremony.description ? (
                <p className="mt-2 text-base" style={{ color: palette.ink }}>
                  {ceremony.description}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
