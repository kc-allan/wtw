import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { EventStatus } from "@wtw/shared";
import { api } from "@/lib/api";
import { formatEventDate } from "@/lib/event-display";
import { SITE_ORIGIN } from "@/lib/site";
import type { EventDetail } from "@/lib/types";
import { InvitationCard, nameLines } from "@/app/_components/invitation-card";
import { WizardSteps } from "../../../_components/wizard-steps";
import { SharePanel } from "./share-panel";

export const metadata: Metadata = { title: "Share — Worth the Wait" };

export default async function ShareStepPage({ params }: PageProps<"/events/[id]/share">) {
  const { id } = await params;

  const event = await api<EventDetail>(`/events/${id}`).catch(() => null);
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
      <WizardSteps current="share" eventId={id} />

      <h1 className="mt-8 font-serif text-section font-semibold text-black">You&rsquo;re live</h1>
      <p className="mt-1 text-base tracking-[0.02em] text-ink/70">
        {event.title} is published. Now let people know
      </p>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,588px)_minmax(0,1fr)]">
        <SharePanel
          eventId={event.id}
          url={url}
          title={event.title}
          dateLabel={formatEventDate(event.startsAt, event.timezone)}
        />

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
