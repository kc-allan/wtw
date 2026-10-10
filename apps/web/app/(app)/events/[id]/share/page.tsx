import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { EventStatus, RsvpStatus, type EventVisibility } from "@wtw/shared";
import { api } from "@/lib/api";
import { BackToEvent } from "../_hub/back-to-event";
import { formatEventDate } from "@/lib/event-display";
import { SITE_ORIGIN } from "@/lib/site";
import type { EventDetail, Guest, Paginated } from "@/lib/types";
import { InvitationCard, nameLines } from "@/app/_components/invitation-card";
import { SharePanel } from "./share-panel";
import { ShareControls } from "./share-controls";

export const metadata: Metadata = { title: "Share | Worth the Wait" };

export default async function ShareStepPage({ params }: PageProps<"/events/[id]/share">) {
  const { id } = await params;

  const [event, pendingGuests] = await Promise.all([
    api<EventDetail>(`/events/${id}`).catch(() => null),
    api<Paginated<Guest>>(`/events/${id}/guests?status=${RsvpStatus.PENDING}&perPage=100`).catch(() => null),
  ]);
  if (!event) {
    notFound();
  }

  // Nothing to share until it is live.
  if (event.status !== EventStatus.PUBLISHED) {
    redirect(`/events/${id}/publish`);
  }

  const url = `${SITE_ORIGIN}/e/${event.slug}`;
  const names = nameLines(event.hostNames, event.title);

  return (
    <main className="w-full px-6 py-8 lg:px-10">
      <BackToEvent eventId={id} />

      <h1 className="mt-8 font-serif text-section font-semibold text-black">You&rsquo;re live</h1>
      <p className="mt-1 text-base tracking-[0.02em] text-ink/70">
        {event.title} is published. Choose who can open it, then share the link through your own apps.
      </p>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,588px)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <SharePanel
            eventId={event.id}
            url={url}
            title={event.title}
            dateLabel={formatEventDate(event.startsAt, event.timezone)}
            visibility={event.visibility}
          />
          <ShareControls eventId={event.id} visibility={event.visibility as EventVisibility} />
          <ReminderPanel
            eventId={event.id}
            url={url}
            title={event.title}
            dateLabel={formatEventDate(event.startsAt, event.timezone)}
            visibility={event.visibility}
            guests={pendingGuests?.data ?? []}
            total={pendingGuests?.meta.total ?? 0}
          />
          <DownloadPanel eventId={event.id} />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white px-6 py-4">
            <p className="text-base text-ink/70">Preview</p>
            <Link
              href={`/e/${event.slug}`}
              target="_blank"
              className="inline-flex items-center rounded-full border border-forest px-5 py-2.5 text-base text-forest"
            >
              Open full preview
            </Link>
          </div>

          <div className="mt-4 flex justify-center rounded-2xl bg-sand/50 p-10">
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
              className="w-full max-w-[330px] aspect-[330/450]"
            />
          </div>
        </div>
      </div>
    </main>
  );
}

function DownloadPanel({ eventId }: { eventId: string }) {
  return (
    <section className="rounded-2xl bg-white p-6">
      <h2 className="font-serif text-2xl text-black">Download invitation</h2>
      <p className="mt-2 text-base text-ink/70">
        Save a shareable image or printable PDF. Both include the live RSVP link.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <a
          href={`/api/events/${eventId}/invitation-download?format=svg`}
          className="inline-flex rounded-full bg-forest px-6 py-3 text-base font-medium text-bright hover:bg-forest-deep"
        >
          Download image
        </a>
        <a
          href={`/api/events/${eventId}/invitation-download?format=pdf`}
          className="inline-flex rounded-full border border-forest px-6 py-3 text-base font-medium text-forest hover:bg-forest/5"
        >
          Download PDF
        </a>
      </div>
    </section>
  );
}

function ReminderPanel({
  eventId,
  url,
  title,
  dateLabel,
  visibility,
  guests,
  total,
}: {
  eventId: string;
  url: string;
  title: string;
  dateLabel: string;
  visibility: string;
  guests: Guest[];
  total: number;
}) {
  const isPrivate = visibility === "private";
  const message = `Reminder: please reply to ${title} on ${dateLabel}. Details and RSVP: ${url}`;

  return (
    <section id="reminders" className="rounded-2xl bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl text-black">Pending replies</h2>
          <p className="mt-2 text-base text-ink/70">
            {total === 0
              ? "Everyone on the current guest list has replied."
              : `${total} ${total === 1 ? "guest has" : "guests have"} not replied yet.`}
          </p>
        </div>
        <Link
          href={`/events/${eventId}/guests?status=${RsvpStatus.PENDING}`}
          className="rounded-full border border-forest px-4 py-2 text-base text-forest hover:bg-forest/5"
        >
          Review list
        </Link>
      </div>

      {isPrivate ? (
        <p className="mt-4 rounded-xl bg-ivory px-4 py-3 text-sm text-ink/70">
          This event is private. Remind pending guests from the guest list using their personal invitation links.
        </p>
      ) : total > 0 ? (
        <>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(message)}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-forest px-5 py-2.5 text-base font-medium text-bright"
            >
              Open WhatsApp reminder
            </a>
            <a
              href={`sms:?&body=${encodeURIComponent(message)}`}
              className="rounded-full border border-forest px-5 py-2.5 text-base font-medium text-forest"
            >
              Open SMS reminder
            </a>
            <a
              href={`mailto:?subject=${encodeURIComponent(`Reminder: ${title}`)}&body=${encodeURIComponent(message)}`}
              className="rounded-full border border-forest px-5 py-2.5 text-base font-medium text-forest"
            >
              Open email reminder
            </a>
          </div>
          <ul className="mt-5 divide-y divide-rule/60 rounded-xl bg-ivory">
            {guests.map((guest) => (
              <li key={guest.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <span>
                  <span className="block text-base font-medium text-black">
                    {[guest.firstName, guest.lastName].filter(Boolean).join(" ")}
                  </span>
                  <span className="block text-sm text-ink/60">
                    {[guest.phone, guest.email].filter(Boolean).join(" · ") || "No contact saved"}
                  </span>
                </span>
                <span className="text-sm text-ink/60">
                  {guest.invitation ? "Has personal link" : "No personal link yet"}
                </span>
              </li>
            ))}
          </ul>
          {total > guests.length ? (
            <p className="mt-3 text-sm text-ink/60">
              Showing the first {guests.length}. Open the guest list to review everyone.
            </p>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
