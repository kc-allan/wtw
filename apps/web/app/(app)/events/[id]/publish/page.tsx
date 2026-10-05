import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { EventStatus, EVENT_TYPES } from "@wtw/shared";
import { api } from "@/lib/api";
import { BackToEvent } from "../_hub/back-to-event";
import { formatEventDate } from "@/lib/event-display";
import type { EventDetail } from "@/lib/types";
import { InvitationCard, nameLines } from "@/app/_components/invitation-card";
import { PublishPanel } from "./publish-panel";

export const metadata: Metadata = { title: "Publish — Worth the Wait" };

export default async function PublishStepPage({ params }: PageProps<"/events/[id]/publish">) {
  const { id } = await params;

  const event = await api<EventDetail>(`/events/${id}`).catch(() => null);
  if (!event) {
    notFound();
  }

  // Already live? The useful screen is the one with the share links on it.
  if (event.status === EventStatus.PUBLISHED) {
    redirect(`/events/${id}/share`);
  }

  const names = nameLines(event.hostNames, event.title);

  /** What a host should have settled before guests can see the page. */
  const checks = [
    { label: "A design is chosen", done: event.theme !== null },
    { label: "The event has a name", done: event.title.trim().length > 0 },
    { label: "Date", done: Boolean(event.startsAt), optional: true },
    {
      label: "Somewhere to go",
      done: Boolean(event.venueName ?? event.venueAddress ?? event.city),
      optional: true,
    },
    { label: "Hosts are named", done: event.hostNames.length > 0, optional: true },
  ];

  const blocking = checks.filter((check) => !check.optional && !check.done);

  return (
    <main className="w-full px-6 py-8 lg:px-10">
      <BackToEvent eventId={id} />

      <h1 className="mt-8 font-serif text-section font-semibold text-black">
        Ready when you are
      </h1>
      <p className="mt-1 text-base tracking-[0.02em] text-ink/70">
        Publishing gives {event.title} its own link. You can keep editing afterwards.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <div className="rounded-2xl bg-white p-8">
          <h2 className="font-serif text-xl font-semibold text-black">Before you go live</h2>

          <ul className="mt-5 flex flex-col gap-3">
            {checks.map((check) => (
              <li key={check.label} className="flex items-center gap-3 text-base">
                <span
                  aria-hidden
                  className={`grid size-5 shrink-0 place-items-center rounded-full text-xs ${
                    check.done ? "bg-mint text-success" : "bg-canvas text-muted"
                  }`}
                >
                  {check.done ? "✓" : "–"}
                </span>
                <span className={check.done ? "text-ink" : "text-ink/70"}>
                  {check.label}
                  {check.optional && !check.done ? (
                    <span className="ms-2 text-sm text-muted">optional</span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-8 grid gap-4 border-t border-rule/50 pt-6 sm:grid-cols-2">
            <Detail label="Celebration" value={EVENT_TYPES[event.typeKey].name} />
            <Detail
              label="Date"
              value={formatEventDate(event.startsAt, event.timezone)}
            />
            <Detail label="Design" value={event.theme?.name ?? "Not chosen"} />
            <Detail
              label="Sections switched on"
              value={String(event.modules.filter((module) => module.enabled).length)}
            />
          </dl>

          <PublishPanel eventId={event.id} slug={event.slug} blocked={blocking.length > 0} />
        </div>

        <div className="flex items-start justify-center rounded-2xl bg-sand/40 p-8">
          <InvitationCard
            themeKey={event.theme?.key ?? null}
            group={event.theme?.group ?? null}
            eventTypeKey={event.typeKey}
            palette={event.theme?.palette ?? null}
            content={{
              names,
              themeName: event.theme?.name ?? "",
              dateLabel: formatEventDate(event.startsAt, event.timezone),
            }}
            className="w-full max-w-[300px] aspect-[300/420]"
          />
        </div>
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-base text-ink/60">{label}</dt>
      <dd className="text-base text-ink">{value}</dd>
    </div>
  );
}
