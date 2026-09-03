import Link from "next/link";
import { EVENT_TYPES } from "@wtw/shared";
import type { EventSummary, RsvpSummary } from "@/lib/types";
import { eventStanding, formatEventDate } from "@/lib/event-display";

/**
 * One event at a glance. The colour block is the theme's accent rather than its
 * background: a palette's background is the pale paper the invitation is
 * printed on, so a grid of those would read as a row of blank cards.
 */
export function EventCard({
  event,
  summary,
}: {
  event: EventSummary;
  summary: RsvpSummary | null;
}) {
  const standing = eventStanding(event);
  const block = event.theme?.palette.accent ?? "#0e3d3e";

  return (
    <Link
      href={`/events/${event.id}/guests`}
      className="flex w-full flex-col overflow-hidden rounded-xl bg-white outline-offset-2"
    >
      <div
        className="relative h-[172px] w-full"
        style={{ backgroundColor: block }}
      >
        <span className="absolute end-3 top-3 rounded-full bg-white/90 px-3 py-1 text-sm text-ink">
          {standing.label}
        </span>
        <span className="absolute bottom-3 start-3 rounded-full bg-white/90 px-3 py-1 text-sm text-ink">
          {EVENT_TYPES[event.typeKey].plural}
        </span>
      </div>

      <div className="border-b border-rule/50 px-5 py-4">
        <h2 className="font-serif text-xl font-semibold text-black">{event.title}</h2>
        <p className="mt-1 text-base text-ink/70">
          {formatEventDate(event.startsAt, event.timezone)}
          {event.city ? `. ${event.city}` : event.venueName ? `. ${event.venueName}` : ""}
        </p>
      </div>

      <dl className="grid grid-cols-3 gap-2 px-5 py-4">
        <Stat label="Attending" value={summary?.attending} />
        <Stat label="Pending" value={summary?.pending} />
        <Stat label="Declined" value={summary?.notAttending} />
      </dl>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: number | undefined }) {
  return (
    <div>
      <dd className="text-lg text-black tabular-nums">{value ?? "—"}</dd>
      <dt className="text-base text-ink/70">{label}</dt>
    </div>
  );
}
