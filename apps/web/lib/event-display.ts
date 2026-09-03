import { EventStatus } from "@wtw/shared";
import type { EventSummary } from "./types";

export type EventStanding = { label: "Live" | "Draft" | "Past" | "Archived" };

/**
 * What the host sees on the card. "Past" is not a stored status — an event
 * that has happened is still published — so it is derived from the date, and
 * only for events that actually went live.
 */
export function eventStanding(event: Pick<EventSummary, "status" | "startsAt">): EventStanding {
  if (event.status === EventStatus.ARCHIVED) {
    return { label: "Archived" };
  }
  if (event.status === EventStatus.DRAFT) {
    return { label: "Draft" };
  }
  // An event with no date yet cannot have happened.
  if (event.startsAt === null) {
    return { label: "Live" };
  }
  return new Date(event.startsAt).getTime() < Date.now() ? { label: "Past" } : { label: "Live" };
}

/** What stands in for a date the host has not settled on yet. */
export const DATE_UNDECIDED = "Date to be announced";

/**
 * Renders in the event's own timezone rather than the reader's: a Nairobi
 * wedding reads "14 February 2027" to a host checking from London too. A host
 * who is still deciding has no date to render, so callers say what to put
 * there instead rather than each one testing for null.
 */
export function formatEventDate(
  startsAt: string | null,
  timeZone: string,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" },
  undecided: string = DATE_UNDECIDED,
): string {
  if (startsAt === null) {
    return undecided;
  }
  try {
    return new Intl.DateTimeFormat("en-GB", { ...options, timeZone }).format(new Date(startsAt));
  } catch {
    // An unknown zone from old data should not take the page down.
    return new Intl.DateTimeFormat("en-GB", options).format(new Date(startsAt));
  }
}

export function formatEventTime(
  startsAt: string | null,
  timeZone: string,
  undecided = "",
): string {
  return formatEventDate(startsAt, timeZone, { hour: "numeric", minute: "2-digit" }, undecided);
}
