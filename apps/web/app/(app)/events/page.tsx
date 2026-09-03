import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/lib/api";
import type { EventSummary, Paginated, RsvpSummary } from "@/lib/types";
import { EventCard } from "./_event-card";

export const metadata: Metadata = { title: "My events — Worth the Wait" };

export default async function MyEventsPage() {
  const { data: events } = await api<Paginated<EventSummary>>("/events?perPage=50");

  // One summary per event. Fine at the scale a host works at; if a planner
  // account ever holds hundreds, this wants a batched endpoint instead.
  const summaries = await Promise.all(
    events.map((event) =>
      api<RsvpSummary>(`/events/${event.id}/rsvps/summary`).catch(() => null),
    ),
  );

  return (
    <main className="mx-auto w-full max-w-[1392px] flex-1 px-6 py-10">
      <h1 className="font-serif text-section font-semibold text-black">My events</h1>
      <p className="mt-1 text-base tracking-[0.02em] text-ink/70">
        Everything you&rsquo;re hosting, in one place. Open an event to manage it
      </p>

      <ul className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {events.map((event, index) => (
          <li key={event.id} className="flex">
            <EventCard event={event} summary={summaries[index]} />
          </li>
        ))}

        <li className="flex">
          <Link
            href="/events/new"
            className="flex w-full flex-col items-center justify-center rounded-xl bg-white p-6 text-center outline-offset-2"
          >
            <span className="flex w-full flex-col items-center rounded-lg border border-dashed border-rule px-8 py-14">
              <span
                aria-hidden
                className="grid size-9 place-items-center rounded-full bg-mint text-xl text-forest"
              >
                +
              </span>
              <span className="mt-4 text-base font-semibold text-black">
                Create a new event
              </span>
              <span className="mt-2 max-w-[280px] text-base text-ink/70">
                A wedding, birthday, baby shower or anything worth celebrating
              </span>
            </span>
          </Link>
        </li>
      </ul>
    </main>
  );
}
