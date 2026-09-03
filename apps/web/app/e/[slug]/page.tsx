import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventModuleKey } from "@wtw/shared";
import { api, ApiError } from "@/lib/api";
import { formatEventDate, formatEventTime } from "@/lib/event-display";
import type { PublicEvent } from "@/lib/types";
import { InvitationCard, nameLines } from "@/app/_components/invitation-card";
import { FALLBACK_PALETTE } from "@/app/_data/templates";
import { EventSections } from "./event-sections";
import { RsvpForm } from "./rsvp-form";

async function load(slug: string, token?: string, code?: string) {
  const query = new URLSearchParams();
  if (token) query.set("t", token);
  if (code) query.set("code", code);

  return api<PublicEvent>(`/e/${slug}${query.toString() ? `?${query}` : ""}`, {
    auth: false,
    // Guests hit this the moment a host shares the link, so it must reflect
    // edits quickly without hammering the API on every open.
    revalidate: 30,
  });
}

export async function generateMetadata({
  params,
}: PageProps<"/e/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const data = await load(slug).catch(() => null);

  if (!data) {
    return { title: "Event — Worth the Wait" };
  }

  return {
    title: data.event.title,
    description: data.event.tagline ?? data.event.description ?? undefined,
    // A private event should not be indexable even if the link leaks.
    robots: data.event.visibility === "public" ? undefined : { index: false, follow: false },
  };
}

export default async function PublicEventPage({ params, searchParams }: PageProps<"/e/[slug]">) {
  const { slug } = await params;
  const query = await searchParams;

  const token = typeof query.t === "string" ? query.t : undefined;
  const code = typeof query.code === "string" ? query.code : undefined;

  let data: PublicEvent;
  try {
    data = await load(slug, token, code);
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      return <PrivateNotice />;
    }
    notFound();
  }

  const { event, modules, guest } = data;
  const palette = event.theme?.palette ?? FALLBACK_PALETTE;
  const names = nameLines(event.hostNames, event.title);

  const enabled = new Set(modules.map((module) => module.key));
  const rsvpModule = modules.find((module) => module.key === EventModuleKey.RSVP);

  return (
    <div
      className="min-h-dvh"
      style={{ backgroundColor: palette.surface, color: palette.ink }}
    >
      {/* The invitation itself, full bleed, in the theme's own colours. */}
      <header className="px-6 py-10 sm:py-16">
        <InvitationCard
          themeKey={event.theme?.key ?? null}
          group={event.theme?.group ?? null}
          eventTypeKey={event.typeKey}
          palette={palette}
          content={{
            names,
            themeName: event.theme?.name ?? "",
            dateLabel: formatEventDate(event.startsAt, event.timezone),
          }}
          className="mx-auto w-full max-w-[520px] aspect-[520/660]"
        />

        <div className="mx-auto mt-8 max-w-[640px] text-center">
          <p className="text-lg" style={{ color: palette.ink }}>
            {formatEventDate(event.startsAt, event.timezone)}
            {" · "}
            {formatEventTime(event.startsAt, event.timezone)}
          </p>
          {event.venueName || event.city ? (
            <p className="mt-1 text-base" style={{ color: palette.muted }}>
              {[event.venueName, event.city].filter(Boolean).join(", ")}
            </p>
          ) : null}
          {event.tagline ? (
            <p className="mt-4 font-serif text-xl" style={{ color: palette.ink }}>
              {event.tagline}
            </p>
          ) : null}
        </div>
      </header>

      <EventSections event={event} modules={modules} palette={palette} />

      {enabled.has(EventModuleKey.RSVP) ? (
        <section
          id="rsvp"
          aria-labelledby="rsvp-heading"
          className="scroll-mt-8 px-6 py-12"
          style={{ backgroundColor: palette.background, color: palette.ink }}
        >
          <div className="mx-auto max-w-[560px]">
            <h2
              id="rsvp-heading"
              className="text-center font-serif text-section font-semibold"
            >
              Will you be there?
            </h2>

            <RsvpForm
              slug={slug}
              token={token}
              guest={guest}
              config={rsvpModule?.config ?? {}}
              palette={palette}
            />
          </div>
        </section>
      ) : null}

      <footer
        className="px-6 py-10 text-center text-sm"
        style={{ color: palette.muted }}
      >
        Made with Worth the Wait
      </footer>
    </div>
  );
}

function PrivateNotice() {
  return (
    <main className="grid min-h-dvh place-items-center bg-canvas px-6">
      <div className="max-w-[420px] text-center">
        <h1 className="font-serif text-section font-semibold text-black">
          This one&rsquo;s private
        </h1>
        <p className="mt-3 text-base text-ink/70">
          Open the link the hosts sent you, and it will let you straight in.
        </p>
      </div>
    </main>
  );
}
