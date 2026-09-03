import { EventModuleKey } from "@wtw/shared";
import { formatEventDate, formatEventTime } from "@/lib/event-display";
import type { EventModuleView, PublicEvent, ThemePalette } from "@/lib/types";
import { Countdown } from "./countdown";

/**
 * Renders whichever sections the host switched on, in their saved order. The
 * page has no per-event-type code: a birthday simply has fewer modules than a
 * wedding, which is the whole point of the module registry.
 */
export function EventSections({
  event,
  modules,
  palette,
}: {
  event: PublicEvent["event"];
  modules: EventModuleView[];
  palette: ThemePalette;
}) {
  const sections = modules
    .filter((module) => RENDERERS[module.key])
    .sort((a, b) => a.position - b.position);

  return (
    <div className="flex flex-col">
      {sections.map((module, index) => {
        const rendered = RENDERERS[module.key]?.(module, event, palette);
        if (!rendered) return null;

        return (
          <section
            key={module.key}
            aria-labelledby={`section-${module.key}`}
            // Alternating grounds keep long pages readable without a second
            // colour having to be designed per theme.
            style={{
              backgroundColor: index % 2 === 0 ? palette.surface : `${palette.background}0d`,
            }}
            className="px-6 py-12"
          >
            <div className="mx-auto w-full max-w-[720px]">
              <h2
                id={`section-${module.key}`}
                className="font-serif text-section font-semibold"
                style={{ color: palette.ink }}
              >
                {rendered.heading}
              </h2>
              <div className="mt-5" style={{ color: palette.ink }}>
                {rendered.body}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}

type Rendered = { heading: string; body: React.ReactNode } | null;
type Renderer = (
  module: EventModuleView,
  event: PublicEvent["event"],
  palette: ThemePalette,
) => Rendered;

/** Narrow a module's untyped config blob to the shape a section needs. */
function read<T>(config: Record<string, unknown>, key: string): T | undefined {
  return config[key] as T | undefined;
}

const RENDERERS: Partial<Record<EventModuleKey, Renderer>> = {
  [EventModuleKey.EVENT_DETAILS]: (module, event) => {
    const description = read<string>(module.config, "description") ?? event.description;
    const hostedBy = read<string>(module.config, "hostedByLabel");

    if (!description && !hostedBy) return null;

    return {
      heading: "The day",
      body: (
        <>
          {hostedBy ? <p className="text-base opacity-80">{hostedBy}</p> : null}
          {description ? (
            <p className="mt-2 text-base whitespace-pre-line opacity-90">{description}</p>
          ) : null}
        </>
      ),
    };
  },

  [EventModuleKey.COUNTDOWN]: (module, event) => {
    const target = read<string>(module.config, "targetAt") ?? event.startsAt;
    const hideWhenPassed = read<boolean>(module.config, "hideWhenPassed") ?? true;

    // There is nothing to count down to until a date is settled on.
    if (target === null) {
      return null;
    }
    if (hideWhenPassed && new Date(target).getTime() < Date.now()) {
      return null;
    }

    return { heading: "Counting down", body: <Countdown target={target} /> };
  },

  [EventModuleKey.OUR_STORY]: (module) => {
    const sections =
      read<{ title: string; body: string; date?: string }[]>(module.config, "sections") ?? [];
    if (sections.length === 0) return null;

    return {
      heading: "Our story",
      body: (
        <ol className="flex flex-col gap-6">
          {sections.map((entry) => (
            <li key={entry.title}>
              <h3 className="font-serif text-xl">{entry.title}</h3>
              <p className="mt-1 text-base whitespace-pre-line opacity-90">{entry.body}</p>
            </li>
          ))}
        </ol>
      ),
    };
  },

  [EventModuleKey.TIMELINE]: (module, event) => {
    const entries =
      read<{ startsAt: string; title: string; description?: string; location?: string }[]>(
        module.config,
        "entries",
      ) ?? [];
    if (entries.length === 0) return null;

    return {
      heading: "The order of the day",
      body: (
        <ol className="flex flex-col gap-5">
          {entries.map((entry) => (
            <li key={`${entry.startsAt}-${entry.title}`} className="flex gap-5">
              <span className="w-20 shrink-0 text-base tabular-nums opacity-70">
                {formatEventTime(entry.startsAt, event.timezone)}
              </span>
              <span>
                <span className="block text-base font-medium">{entry.title}</span>
                {entry.location ? (
                  <span className="block text-base opacity-70">{entry.location}</span>
                ) : null}
                {entry.description ? (
                  <span className="mt-1 block text-base opacity-80">{entry.description}</span>
                ) : null}
              </span>
            </li>
          ))}
        </ol>
      ),
    };
  },

  [EventModuleKey.VENUE_MAP]: (module, event) => {
    const venues =
      read<{ label: string; address: string; directionsNote?: string; parkingNote?: string }[]>(
        module.config,
        "venues",
      ) ?? [];

    // Fall back to the single venue on the event when none are configured.
    const list =
      venues.length > 0
        ? venues
        : event.venueName
          ? [{ label: event.venueName, address: event.venueAddress ?? event.city ?? "" }]
          : [];

    if (list.length === 0) return null;

    return {
      heading: "Getting there",
      body: (
        <ul className="flex flex-col gap-5">
          {list.map((venue) => (
            <li key={venue.label}>
              <h3 className="text-base font-medium">{venue.label}</h3>
              {venue.address ? <p className="text-base opacity-80">{venue.address}</p> : null}
              {"directionsNote" in venue && venue.directionsNote ? (
                <p className="mt-1 text-base opacity-70">{venue.directionsNote}</p>
              ) : null}
              {venue.address ? (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${venue.label} ${venue.address}`,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-base underline underline-offset-4"
                >
                  Open in maps
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      ),
    };
  },

  [EventModuleKey.DRESS_CODE]: (module) => {
    const title = read<string>(module.config, "title");
    const description = read<string>(module.config, "description");
    const swatches = read<string[]>(module.config, "palette") ?? [];

    if (!title && !description && swatches.length === 0) return null;

    return {
      heading: "What to wear",
      body: (
        <>
          {title ? <p className="text-base font-medium">{title}</p> : null}
          {description ? <p className="mt-1 text-base opacity-90">{description}</p> : null}
          {swatches.length > 0 ? (
            <ul className="mt-4 flex flex-wrap gap-3">
              {swatches.map((colour) => (
                <li key={colour} className="flex items-center gap-2 text-sm opacity-80">
                  <span
                    aria-hidden
                    className="size-7 rounded-full border border-current/20"
                    style={{ backgroundColor: colour }}
                  />
                  {colour}
                </li>
              ))}
            </ul>
          ) : null}
        </>
      ),
    };
  },

  [EventModuleKey.ACCOMMODATION]: (module) => {
    const options =
      read<{ name: string; address?: string; bookingUrl?: string; note?: string }[]>(
        module.config,
        "options",
      ) ?? [];
    if (options.length === 0) return null;

    return {
      heading: "Somewhere to stay",
      body: (
        <ul className="flex flex-col gap-4">
          {options.map((option) => (
            <li key={option.name}>
              <h3 className="text-base font-medium">{option.name}</h3>
              {option.address ? <p className="text-base opacity-80">{option.address}</p> : null}
              {option.note ? <p className="text-base opacity-70">{option.note}</p> : null}
              {option.bookingUrl ? (
                <a
                  href={option.bookingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-base underline underline-offset-4"
                >
                  Book a room
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      ),
    };
  },

  [EventModuleKey.FAQ]: (module) => {
    const items =
      read<{ question: string; answer: string }[]>(module.config, "items") ?? [];
    if (items.length === 0) return null;

    return {
      heading: "Good to know",
      body: (
        <dl className="flex flex-col gap-5">
          {items.map((item) => (
            <div key={item.question}>
              <dt className="text-base font-medium">{item.question}</dt>
              <dd className="mt-1 text-base opacity-90">{item.answer}</dd>
            </div>
          ))}
        </dl>
      ),
    };
  },
};
