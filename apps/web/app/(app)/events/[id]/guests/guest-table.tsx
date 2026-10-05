import Link from "next/link";
import { RsvpStatus } from "@wtw/shared";
import type { Ceremony, Guest, Paginated } from "@/lib/types";
import { GuestCeremonies } from "./guest-ceremonies";
import { GuestRowActions } from "./guest-row-actions";

const RSVP_LABELS: Record<RsvpStatus, { label: string; className: string }> = {
  [RsvpStatus.ATTENDING]: { label: "Attending", className: "bg-mint text-success" },
  [RsvpStatus.NOT_ATTENDING]: { label: "Declined", className: "bg-blush text-ember" },
  [RsvpStatus.MAYBE]: { label: "Maybe", className: "bg-sand text-clay" },
  [RsvpStatus.PENDING]: { label: "Pending", className: "bg-canvas text-ink/70" },
};

/** Two letters from the guest's name, matching the design's avatar. */
function initials(guest: Guest): string {
  return [guest.firstName, guest.lastName]
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => (part as string)[0]?.toUpperCase() ?? "")
    .join("");
}

export function GuestTable({
  guests,
  eventId,
  ceremonies,
  filters,
}: {
  guests: Paginated<Guest>;
  eventId: string;
  /** Empty for the event types that are one gathering, which hides the column. */
  ceremonies: Ceremony[];
  /** Carried into the pager so turning a page keeps the current filter. */
  filters: { status?: string; group?: string };
}) {
  if (guests.data.length === 0) {
    return (
      <div className="mt-4 rounded-xl bg-white px-6 py-16 text-center">
        <p className="text-base text-ink/70">
          No guests here yet. Add them and every RSVP lands on this page.
        </p>
      </div>
    );
  }

  const { page, perPage, total, totalPages } = guests.meta;
  const first = (page - 1) * perPage + 1;
  const last = Math.min(page * perPage, total);

  return (
    <div className="mt-4 overflow-hidden rounded-xl bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-start">
          <thead>
            <tr className="bg-ivory text-base text-ink/60">
              <th scope="col" className="px-6 py-4 text-start font-normal">
                Guest
              </th>
              <th scope="col" className="px-6 py-4 text-start font-normal">
                Group
              </th>
              <th scope="col" className="px-6 py-4 text-start font-normal">
                RSVP
              </th>
              <th scope="col" className="px-6 py-4 text-start font-normal">
                Party
              </th>
              <th scope="col" className="px-6 py-4 text-start font-normal">
                Meal
              </th>
              {ceremonies.length > 0 ? (
                <th scope="col" className="px-6 py-4 text-start font-normal">
                  Invited to
                </th>
              ) : null}
              <th scope="col" className="px-6 py-4 text-start font-normal">
                Invited via
              </th>
              <th scope="col" className="px-6 py-4 text-start font-normal">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {guests.data.map((guest) => {
              const rsvp = RSVP_LABELS[guest.rsvp?.status ?? RsvpStatus.PENDING];

              return (
                <tr key={guest.id} className="border-t border-rule/40">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden
                        className="grid size-9 shrink-0 place-items-center rounded-full bg-mint text-sm text-forest"
                      >
                        {initials(guest)}
                      </span>
                      <span>
                        <span className="block text-base font-medium text-black">
                          {[guest.firstName, guest.lastName].filter(Boolean).join(" ")}
                        </span>
                        <span className="block text-base text-ink/60">
                          {guest.phone ?? guest.email ?? "—"}
                        </span>
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-base text-ink">{guest.groupLabel ?? "—"}</td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm ${rsvp.className}`}
                    >
                      <span aria-hidden>&bull;</span>
                      {rsvp.label}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-base text-ink tabular-nums">
                    {guest.rsvp?.partySize ?? "—"}
                  </td>

                  <td className="px-6 py-4 text-base text-ink">
                    {guest.rsvp?.mealChoice ?? "—"}
                  </td>

                  {ceremonies.length > 0 ? (
                    <td className="px-6 py-4">
                      <GuestCeremonies
                        eventId={eventId}
                        guestId={guest.id}
                        guestName={guest.firstName}
                        ceremonies={ceremonies}
                        selected={guest.ceremonyKeys}
                      />
                    </td>
                  ) : null}

                  <td className="px-6 py-4 text-base text-ink capitalize">
                    {guest.invitation?.channel ?? "—"}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/events/${eventId}/preview?guestId=${guest.id}`}
                        target="_blank"
                        className="rounded-full border border-rule px-3 py-1.5 text-sm text-forest hover:bg-ivory"
                      >
                        Preview
                      </Link>
                      <GuestRowActions eventId={eventId} guest={guest} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-rule/40 px-6 py-4">
        <p className="text-base text-ink/70">
          {first} - {last} of {total} items
        </p>

        <div className="flex gap-2">
          <PageLink
            eventId={eventId}
            filters={filters}
            page={page - 1}
            disabled={page <= 1}
          >
            Previous
          </PageLink>
          <PageLink
            eventId={eventId}
            filters={filters}
            page={page + 1}
            disabled={page >= totalPages}
          >
            Next
          </PageLink>
        </div>
      </div>
    </div>
  );
}

function PageLink({
  eventId,
  filters,
  page,
  disabled,
  children,
}: {
  eventId: string;
  filters: { status?: string; group?: string };
  page: number;
  disabled: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span
        aria-disabled
        className="rounded-lg border border-rule px-4 py-2 text-base text-muted"
      >
        {children}
      </span>
    );
  }

  const params = new URLSearchParams({ page: String(page) });
  if (filters.status) params.set("status", filters.status);
  if (filters.group) params.set("group", filters.group);

  return (
    <Link
      href={`/events/${eventId}/guests?${params}`}
      className="rounded-lg border border-rule px-4 py-2 text-base text-ink hover:bg-ivory"
    >
      {children}
    </Link>
  );
}
