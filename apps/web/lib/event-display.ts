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
  return new Date(event.startsAt).getTime() < Date.now() ? { label: "Past" } : { label: "Live" };
}

/**
 * Renders in the event's own timezone rather than the reader's: a Nairobi
 * wedding reads "14 February 2027" to a host checking from London too.
 */
export function formatEventDate(
  startsAt: string,
  timeZone: string,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" },
): string {
  try {
    return new Intl.DateTimeFormat("en-GB", { ...options, timeZone }).format(new Date(startsAt));
  } catch {
    // An unknown zone from old data should not take the page down.
    return new Intl.DateTimeFormat("en-GB", options).format(new Date(startsAt));
  }
}

export function formatEventTime(startsAt: string, timeZone: string): string {
  return formatEventDate(startsAt, timeZone, { hour: "numeric", minute: "2-digit" });
}
