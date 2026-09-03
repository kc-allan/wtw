"use client";

import Link from "next/link";
import { RsvpStatus } from "@wtw/shared";
import type { RsvpSummary } from "@/lib/types";

/**
 * Filters live in the URL rather than component state, so a filtered view is
 * shareable, survives a refresh, and the export button can reuse it.
 */
export function GuestFilters({
  eventId,
  summary,
  groups,
  activeStatus,
  activeGroup,
}: {
  eventId: string;
  summary: RsvpSummary | null;
  groups: string[];
  activeStatus?: string;
  activeGroup?: string;
}) {
  const base = `/events/${eventId}/guests`;

  function href(next: { status?: string; group?: string }) {
    const params = new URLSearchParams();
    const status = "status" in next ? next.status : activeStatus;
    const group = "group" in next ? next.group : activeGroup;
    if (status) params.set("status", status);
    if (group) params.set("group", group);
    const query = params.toString();
    return query ? `${base}?${query}` : base;
  }

  const statuses = [
    { key: undefined, label: "All", count: summary?.totalGuests },
    { key: RsvpStatus.ATTENDING, label: "Attending", count: summary?.attending },
    { key: RsvpStatus.PENDING, label: "Pending", count: summary?.pending },
    { key: RsvpStatus.NOT_ATTENDING, label: "Declined", count: summary?.notAttending },
  ];

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white px-6 py-4">
      <div className="flex flex-wrap gap-3">
        {statuses.map((status) => {
          const isActive = (status.key ?? undefined) === (activeStatus ?? undefined);
          return (
            <Link
              key={status.label}
              href={href({ status: status.key })}
              aria-current={isActive ? "true" : undefined}
              className={`rounded-full px-5 py-2 text-base whitespace-nowrap ${
                isActive ? "bg-forest text-bright" : "border border-rule text-ink hover:bg-ivory"
              }`}
            >
              {status.label}
              {status.count === undefined ? "" : ` (${status.count})`}
            </Link>
          );
        })}
      </div>

      {groups.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {groups.map((group) => {
            const isActive = group === activeGroup;
            return (
              <Link
                key={group}
                href={href({ group: isActive ? undefined : group })}
                aria-pressed={isActive}
                className={`rounded-full px-5 py-2 text-base whitespace-nowrap ${
                  isActive ? "bg-forest text-bright" : "border border-rule text-ink hover:bg-ivory"
                }`}
              >
                {group}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
