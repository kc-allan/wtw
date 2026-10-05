import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CreateStepKey, EventModuleKey, EventStatus, typeAsksCreateStep } from "@wtw/shared";
import { api } from "@/lib/api";
import { SITE_URL } from "@/lib/env";
import type { EventDetail, Guest, Paginated } from "@/lib/types";
import { EventRail, type RailSection } from "./_hub/event-rail";
import { CeremoniesPanel, GuestListPanel, InvitationsPanel, Panel } from "./_hub/panels";
import { WebsitePages, type WebsitePage } from "./_hub/website-pages";

export const metadata: Metadata = { title: "Your event — Worth the Wait" };

interface InvitationRow {
  guestId: string;
  status: string;
}

/** The sections the site is made of, named as a guest reads them. */
const PAGE_LABELS: Partial<Record<EventModuleKey, string>> = {
  [EventModuleKey.OUR_STORY]: "Our Story",
  [EventModuleKey.RSVP]: "RSVP",
  [EventModuleKey.GALLERY]: "Moments",
  [EventModuleKey.VENUE_MAP]: "Venues",
  [EventModuleKey.REGISTRY]: "Registry",
  [EventModuleKey.TIMELINE]: "The day",
  [EventModuleKey.FAQ]: "Questions",
  [EventModuleKey.DRESS_CODE]: "What to wear",
  [EventModuleKey.ACCOMMODATION]: "Staying over",
};

export default async function EventHubPage({ params, searchParams }: PageProps<"/events/[id]">) {
  const { id } = await params;
  const { section } = await searchParams;

  const [event, guests, invitations] = await Promise.all([
    api<EventDetail>(`/events/${id}`).catch(() => null),
    api<Paginated<Guest>>(`/events/${id}/guests?perPage=1`).catch(() => null),
    api<InvitationRow[]>(`/events/${id}/invitations`).catch(() => [] as InvitationRow[]),
  ]);
  if (!event) notFound();

  const guestCount = guests?.meta.total ?? 0;
  const sentCount = invitations.filter((row) =>
    ["sent", "opened", "responded"].includes(row.status),
  ).length;
  const isLive = event.status === EventStatus.PUBLISHED;
  const publicHref = `${SITE_URL}/e/${event.slug}`;
  const hasCeremonies = typeAsksCreateStep(event.typeKey, CreateStepKey.CEREMONIES);

  const websitePages: WebsitePage[] = [
    { anchor: "top", label: "Home" },
    ...event.modules
      .filter((module) => module.enabled && PAGE_LABELS[module.key])
      .sort((a, b) => a.position - b.position)
      .map((module) => ({
        anchor: module.key === EventModuleKey.VENUE_MAP ? "ceremonies" : module.key,
        label: PAGE_LABELS[module.key] as string,
        moduleKey: module.key,
      })),
  ];

  const sections: RailSection[] = [
    ...(hasCeremonies
      ? [
          {
            id: "ceremonies",
            label: "Ceremonies",
            status: String(event.ceremonies.length),
          },
        ]
      : []),
    {
      id: "website",
      label: "Invitation",
      status: isLive ? "Live" : "Not live",
      children: <WebsitePages pages={websitePages} href={isLive ? publicHref : `/events/${id}/preview`} />,
    },
    {
      id: "guests",
      label: "Guest List",
      status: `${guestCount} ${guestCount === 1 ? "Guest" : "Guests"}`,
    },
    {
      id: "invitations",
      label: "Invitations",
      status: sentCount === 0 ? "Not sent" : `${sentCount} sent`,
    },
  ];

  const current =
    typeof section === "string" && sections.some((entry) => entry.id === section)
      ? section
      : sections[0].id;

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <div className="w-full shrink-0 border-b border-rule/40 bg-white px-6 py-10 lg:w-[450px] lg:border-r lg:border-b-0 lg:px-8">
        <EventRail eventId={id} sections={sections} current={current} />
      </div>

      <div className="relative min-w-0 flex-1 overflow-hidden bg-canvas px-6 py-12 lg:px-10">
        <Backdrop />
        <div className="relative">
          {current === "ceremonies" ? (
            <CeremoniesPanel eventId={id} ceremonies={event.ceremonies} />
          ) : null}

          {current === "website" ? (
            <Panel
              heading={isLive ? "Your invitation is live" : "Your invitation"}
              lead={
                isLive
                  ? "Guests can open your invitation and reply."
                  : "Add the essentials, preview it, then publish when it reads right."
              }
            >
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href={`/events/${id}/customize`}
                  className="rounded-full bg-forest px-8 py-3.5 text-base font-medium text-bright transition-colors hover:bg-forest-deep"
                >
                  Edit invitation
                </Link>
                <Link
                  href={`/events/${id}/${isLive ? "share" : "publish"}`}
                  className="rounded-full border border-forest px-8 py-3.5 text-base text-forest transition-colors hover:bg-forest/5"
                >
                  {isLive ? "Share it" : "Publish"}
                </Link>
              </div>

              {isLive ? (
                <p className="mt-6 text-base text-ink/70">
                  <a
                    href={publicHref}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="underline underline-offset-4"
                  >
                    {publicHref.replace(/^https?:\/\//, "")}
                  </a>
                </p>
              ) : null}
            </Panel>
          ) : null}

          {current === "guests" ? (
            <GuestListPanel
              eventId={id}
              joinHref={`${publicHref}/join`}
              formOpen={event.guestListFormEnabled}
              published={isLive}
            />
          ) : null}

          {current === "invitations" ? (
            <InvitationsPanel eventId={id} sent={sentCount} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** The soft warm shapes the panel sits on, kept well behind the content. */
function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <span className="absolute -top-24 left-1/4 h-[420px] w-[520px] rounded-full bg-sand/45 blur-3xl" />
      <span className="absolute -right-32 bottom-0 h-[420px] w-[420px] rounded-full bg-blush/50 blur-3xl" />
    </div>
  );
}
