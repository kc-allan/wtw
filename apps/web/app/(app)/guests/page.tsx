import type { Metadata } from "next";
import Link from "next/link";
import { EVENT_TYPES } from "@wtw/shared";
import { api } from "@/lib/api";
import { eventStanding, formatEventDate } from "@/lib/event-display";
import type { EventSummary, Paginated, RsvpSummary } from "@/lib/types";

export const metadata: Metadata = { title: "Guests — Worth the Wait" };

/**
 * Guest lists belong to an event, so the top-level "Guests" tab is a way in
 * rather than a list of its own: every event the host runs, with where its
 * replies stand, linking through to that event's list.
 */
export default async function GuestsHubPage() {
  const { data: events } = await api<Paginated<EventSummary>>("/events?perPage=50");
  const summaries = await Promise.all(
    events.map((event) =>
      api<RsvpSummary>(`/events/${event.id}/rsvps/summary`).catch(() => null),
    ),
  );

  return (
    <main className="mx-auto w-full max-w-[1392px] flex-1 px-6 py-10">
      <h1 className="font-serif text-section font-semibold text-black">Guests</h1>
      <p className="mt-1 text-base tracking-[0.02em] text-ink/70">
        Pick an event to manage its guest list, invitations and replies.
      </p>

      {events.length === 0 ? (
        <p className="mt-10 text-base text-ink/70">
          Once you create an event, its guest list appears here.{" "}
          <Link href="/events/new" className="underline underline-offset-4">
            Create one
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
          {events.map((event, index) => {
            const summary = summaries[index];
            const standing = eventStanding(event);

            return (
              <li key={event.id}>
                <Link
                  href={`/events/${event.id}/guests`}
                  className="flex flex-wrap items-center justify-between gap-6 rounded-xl bg-white px-6 py-5 outline-offset-2"
                >
                  <div>
                    <p className="font-serif text-xl font-semibold text-black">{event.title}</p>
                    <p className="mt-1 text-base text-ink/70">
                      {EVENT_TYPES[event.typeKey].name} ·{" "}
                      {formatEventDate(event.startsAt, event.timezone)} · {standing.label}
                    </p>
                  </div>

                  <dl className="flex gap-8">
                    <Stat label="Invited" value={summary?.totalGuests} />
                    <Stat label="Attending" value={summary?.attending} />
                    <Stat label="Pending" value={summary?.pending} />
                  </dl>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
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
