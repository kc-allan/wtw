import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RsvpStatus } from "@wtw/shared";
import { api } from "@/lib/api";
import { BackToEvent } from "../_hub/back-to-event";
import type { EventDetail, Guest, Paginated, RsvpSummary } from "@/lib/types";
import { AddGuests } from "./add-guests";
import { GuestFilters } from "./guest-filters";
import { GuestTable } from "./guest-table";

export const metadata: Metadata = { title: "Guest list — Worth the Wait" };

const PER_PAGE = 25;

export default async function GuestListPage({
  params,
  searchParams,
}: PageProps<"/events/[id]/guests">) {
  const { id } = await params;
  const query = await searchParams;

  const status = typeof query.status === "string" ? query.status : undefined;
  const groupLabel = typeof query.group === "string" ? query.group : undefined;
  const page = Number(query.page) > 0 ? Number(query.page) : 1;

  const search = new URLSearchParams({ page: String(page), perPage: String(PER_PAGE) });
  if (status && Object.values(RsvpStatus).includes(status as RsvpStatus)) {
    search.set("status", status);
  }
  if (groupLabel) {
    search.set("groupLabel", groupLabel);
  }

  const [event, guests, summary, groups] = await Promise.all([
    api<EventDetail>(`/events/${id}`).catch(() => null),
    api<Paginated<Guest>>(`/events/${id}/guests?${search}`).catch(() => null),
    api<RsvpSummary>(`/events/${id}/rsvps/summary`).catch(() => null),
    api<string[]>(`/events/${id}/guests/groups`).catch(() => [] as string[]),
  ]);

  if (!event || !guests) {
    notFound();
  }

  // Only the filters, not the pagination, belong on an export of everything.
  const exportQuery = new URLSearchParams();
  if (search.get("status")) exportQuery.set("status", search.get("status") as string);
  if (search.get("groupLabel")) exportQuery.set("groupLabel", search.get("groupLabel") as string);

  const declinedShare =
    summary && summary.totalGuests > 0
      ? Math.round((summary.notAttending / summary.totalGuests) * 100)
      : 0;

  const mealSummary = summary?.meals.length
    ? summary.meals.map((meal) => `${meal.count} ${meal.choice}`).join(". ")
    : "No meal choices collected";

  return (
    <main className="w-full px-6 py-8 lg:px-10">
      <BackToEvent eventId={id} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-section font-semibold text-black">Guest list</h1>
          <p className="mt-1 text-base tracking-[0.02em] text-ink/70">
            {event.title}. {summary?.totalGuests ?? 0} invited
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/events/${id}/share`}
            className="text-base font-medium text-forest hover:underline"
          >
            Send reminder
          </Link>
          <a
            href={`/api/events/${id}/guest-export?${exportQuery}`}
            className="inline-flex items-center rounded-full border border-forest px-5 py-2.5 text-base text-forest"
          >
            Export CSV
          </a>
          <AddGuests eventId={id} />
        </div>
      </div>

      <ul className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Attending replies"
          value={summary?.attending}
          hint={summary ? `${summary.totalAttendees} people attending` : undefined}
          tone="text-success-bright"
        />
        <StatCard
          label="Pending"
          value={summary?.pending}
          hint="No reply yet"
          tone="text-gold"
        />
        <StatCard
          label="Declined"
          value={summary?.notAttending}
          hint={`${declinedShare}% of invited`}
          tone="text-ember"
        />
        <StatCard
          label="People attending"
          value={summary?.totalAttendees}
          hint={summary ? `${summary.plusOnes} additional guests` : mealSummary}
          tone="text-black"
        />
      </ul>

      <GuestFilters
        eventId={id}
        summary={summary}
        groups={groups}
        activeStatus={status}
        activeGroup={groupLabel}
      />

      <GuestTable
        guests={guests}
        eventId={id}
        ceremonies={event.ceremonies}
        filters={{ status, group: groupLabel }}
      />
    </main>
  );
}

function StatCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: number | undefined;
  hint?: string;
  tone: string;
}) {
  return (
    <li className="rounded-xl bg-white p-6">
      <p className="text-base font-semibold text-black">{label}</p>
      <p className={`mt-2 text-3xl tabular-nums ${tone}`}>{value ?? "—"}</p>
      {hint ? <p className="mt-2 text-base text-ink/60">{hint}</p> : null}
    </li>
  );
}
