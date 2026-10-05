import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EventStatus } from "@wtw/shared";
import { api } from "@/lib/api";
import { SITE_URL } from "@/lib/env";
import type { GalleryPhoto, PublicEvent, RegistryForGuests } from "@/lib/types";
import { EventPageView } from "@/app/e/[slug]/event-page-view";

export const metadata: Metadata = {
  title: "Preview | Worth the Wait",
  robots: { index: false, follow: false },
};

interface EventPreview extends Omit<PublicEvent, "guest"> {
  guest: PublicEvent["guest"];
  registry: RegistryForGuests | null;
  gallery: GalleryPhoto[] | null;
}

export default async function PreviewPage({
  params,
  searchParams,
}: PageProps<"/events/[id]/preview">) {
  const { id } = await params;
  const { guestId } = await searchParams;
  const guestQuery = typeof guestId === "string" ? `?guestId=${encodeURIComponent(guestId)}` : "";

  const preview = await api<EventPreview>(`/events/${id}/preview${guestQuery}`).catch(() => null);
  if (!preview) notFound();

  const isLive = preview.event.status === EventStatus.PUBLISHED;

  return (
    <>
      <PreviewBar eventId={id} slug={preview.event.slug} isLive={isLive} guest={preview.guest} />

      <EventPageView
        slug={preview.event.slug}
        event={preview.event}
        ceremonies={preview.ceremonies}
        modules={preview.modules}
        guest={preview.guest}
        registry={preview.registry}
        photos={preview.gallery}
        previewMode
      />
    </>
  );
}

/**
 * Says whose view this is and whether anyone else can see it yet, because the
 * page below is otherwise indistinguishable from the real thing.
 */
function PreviewBar({
  eventId,
  slug,
  isLive,
  guest,
}: {
  eventId: string;
  slug: string;
  isLive: boolean;
  guest: PublicEvent["guest"];
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-forest px-6 py-3 text-bright">
      <p className="text-base">
        {guest
          ? `Previewing as ${guest.firstName}${guest.lastName ? ` ${guest.lastName}` : ""}. Replies are not sent from this preview.`
          : isLive
            ? "This is your page as guests see it."
            : "This is your page as guests will see it. Nobody else can open it yet."}
      </p>

      <span className="flex items-center gap-3">
        {isLive ? (
          <a
            href={`${SITE_URL}/e/${slug}`}
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-full border border-bright/40 px-4 py-1.5 text-base transition-colors hover:bg-bright/10"
          >
            Open the live page
          </a>
        ) : (
          <Link
            href={`/events/${eventId}/publish`}
            className="rounded-full bg-bright px-4 py-1.5 text-base text-forest transition-opacity hover:opacity-90"
          >
            Publish it
          </Link>
        )}
        <Link
          href={`/events/${eventId}`}
          className="text-base underline underline-offset-4"
        >
          Back to the event
        </Link>
      </span>
    </div>
  );
}
