import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EventStatus, EventTypeKey } from "@wtw/shared";
import { api } from "@/lib/api";
import { SITE_URL } from "@/lib/env";
import { eventSurfaceLabel, publicPageSections } from "@/lib/event-public-sections";
import type { EventDetail, GalleryPhoto, Guest, Paginated, PublicEvent, RegistryForGuests } from "@/lib/types";
import { EventRail, type NextTask, type RailSection } from "./_hub/event-rail";
import { CeremoniesPanel, GuestListPanel, InvitationsPanel, Panel } from "./_hub/panels";
import { WebsitePages, type WebsitePage } from "./_hub/website-pages";

export const metadata: Metadata = { title: "Your event | Worth the Wait" };

interface InvitationRow {
  guestId: string;
  status: string;
}

interface EventPreview extends Omit<PublicEvent, "guest"> {
  guest: null;
  registry: RegistryForGuests | null;
  gallery: GalleryPhoto[] | null;
}

function hasText(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function nextTaskForEvent({
  event,
  guestCount,
  isLive,
}: {
  event: EventDetail;
  guestCount: number;
  isLive: boolean;
}): NextTask {
  if (!event.theme) {
    return {
      label: "Choose a design so the invitation has a finished look.",
      href: `/events/${event.id}/template`,
      action: "Choose design",
    };
  }

  if (!hasText(event.title) || event.hostNames.length === 0) {
    return {
      label: "Add the names guests should see first.",
      href: `/events/${event.id}/customize`,
      action: "Add details",
    };
  }

  if (!event.startsAt) {
    return {
      label: "Set the date, or mark it as to be announced.",
      href: `/events/${event.id}/customize`,
      action: "Set date",
    };
  }

  if (!hasText(event.venueName) && !hasText(event.city) && !hasText(event.venueAddress)) {
    return {
      label: "Add the place guests should plan around.",
      href: `/events/${event.id}/customize`,
      action: "Add location",
    };
  }

  if (guestCount === 0) {
    return {
      label: "Add guests or open address collection before you publish.",
      href: `/events/${event.id}?section=guests`,
      action: "Add guests",
    };
  }

  if (!isLive) {
    return {
      label: "Preview the saved invitation, then publish when it reads right.",
      href: `/events/${event.id}/publish`,
      action: "Preview and publish",
    };
  }

  return {
    label: "Share the live link with guests.",
    href: `/events/${event.id}/share`,
    action: "Share invitation",
  };
}

function sectionForTask(task: NextTask): string {
  if (task.href.includes("section=guests")) return "guests";
  if (task.href.includes("share")) return "invitations";
  return "invitation";
}

export default async function EventHubPage({ params, searchParams }: PageProps<"/events/[id]">) {
  const { id } = await params;
  const { section } = await searchParams;

  const [event, guests, invitations, preview] = await Promise.all([
    api<EventDetail>(`/events/${id}`).catch(() => null),
    api<Paginated<Guest>>(`/events/${id}/guests?perPage=1`).catch(() => null),
    api<InvitationRow[]>(`/events/${id}/invitations`).catch(() => [] as InvitationRow[]),
    api<EventPreview>(`/events/${id}/preview`).catch(() => null),
  ]);
  if (!event) notFound();

  const guestCount = guests?.meta.total ?? 0;
  const sentCount = invitations.filter((row) =>
    ["sent", "opened", "responded"].includes(row.status),
  ).length;
  const isLive = event.status === EventStatus.PUBLISHED;
  const publicHref = `${SITE_URL}/e/${event.slug}`;
  const hasCeremonies = event.typeKey === EventTypeKey.WEDDING;
  const surfaceLabel = eventSurfaceLabel(event);
  const hasRegistry = Boolean(
    preview?.registry &&
      (preview.registry.items.length > 0 || preview.registry.cashGiftMethods.length > 0),
  );

  const websitePages: WebsitePage[] = publicPageSections({
    event,
    modules: event.modules,
    ceremoniesCount: event.ceremonies.length,
    hasGallery: preview?.gallery !== null && preview?.gallery !== undefined,
    hasRegistry,
  }).map((page) => ({
    anchor: page.id,
    label: page.label,
    moduleKey: page.moduleKey,
  }));
  const nextTask = nextTaskForEvent({ event, guestCount, isLive });

  const sections: RailSection[] = [
    ...(hasCeremonies
      ? [
          {
            id: "ceremonies",
            label: "Gatherings",
            status: String(event.ceremonies.length),
          },
        ]
      : []),
    {
      id: "invitation",
      label: surfaceLabel,
      status: isLive ? "Live" : "Not live",
      children: (
        <WebsitePages
          pages={websitePages}
          href={isLive ? publicHref : `/events/${id}/preview`}
          editHref={`/events/${id}/customize`}
        />
      ),
    },
    {
      id: "guests",
      label: "Guests",
      status: `${guestCount} ${guestCount === 1 ? "Guest" : "Guests"}`,
    },
    {
      id: "invitations",
      label: "Sharing",
      status: sentCount === 0 ? "Not shared" : `${sentCount} shared`,
    },
  ];

  const requestedSection = section === "website" ? "invitation" : section;
  const current =
    typeof requestedSection === "string" && sections.some((entry) => entry.id === requestedSection)
      ? requestedSection
      : sectionForTask(nextTask);

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <div className="w-full shrink-0 border-b border-rule/40 bg-white px-6 py-10 lg:w-[450px] lg:border-r lg:border-b-0 lg:px-8">
        <EventRail
          eventId={id}
          eventTitle={event.title}
          surfaceLabel={surfaceLabel}
          nextTask={nextTask}
          sections={sections}
          current={current}
        />
      </div>

      <div className="relative min-w-0 flex-1 overflow-hidden bg-canvas px-6 py-12 lg:px-10">
        <Backdrop />
        <div className="relative">
          {current === "ceremonies" ? (
            <CeremoniesPanel eventId={id} ceremonies={event.ceremonies} />
          ) : null}

          {current === "invitation" ? (
            <Panel
              heading={isLive ? `Your ${surfaceLabel.toLowerCase()} is live` : `Your ${surfaceLabel.toLowerCase()}`}
              lead={
                isLive
                  ? "Guests can open the saved page and reply."
                  : "Add the essentials, save your changes, preview it, then publish when it reads right."
              }
            >
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href={`/events/${id}/customize`}
                  className="rounded-full bg-forest px-8 py-3.5 text-base font-medium text-bright transition-colors hover:bg-forest-deep"
                >
                  Edit {surfaceLabel.toLowerCase()}
                </Link>
                <Link
                  href={`/events/${id}/content`}
                  className="rounded-full border border-forest px-8 py-3.5 text-base text-forest transition-colors hover:bg-forest/5"
                >
                  Edit sections
                </Link>
                <Link
                  href={`/events/${id}/preview`}
                  target="_blank"
                  className="rounded-full border border-forest px-8 py-3.5 text-base text-forest transition-colors hover:bg-forest/5"
                >
                  Preview
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
