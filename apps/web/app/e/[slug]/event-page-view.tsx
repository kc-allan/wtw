import { EventModuleKey } from "@wtw/shared";
import { formatEventDate, formatEventTime } from "@/lib/event-display";
import type { GalleryPhoto, PublicEvent, RegistryForGuests } from "@/lib/types";
import { InvitationCard, nameLines } from "@/app/_components/invitation-card";
import { FALLBACK_PALETTE } from "@/app/_data/templates";
import { CeremonyProgramme } from "./ceremony-programme";
import { EventSections, renderedSectionKeys } from "./event-sections";
import { GiftingSection } from "./gifting-section";
import { MomentsSection } from "./moments-section";
import { PageNav, type PageSection } from "./page-nav";
import { RsvpForm } from "./rsvp-form";

/**
 * The event exactly as a guest reads it. Kept apart from the fetching so the
 * host can see the same page before it is published, from their own data.
 */
export function EventPageView({
  slug,
  token,
  event,
  ceremonies,
  modules,
  guest,
  registry,
  photos,
}: {
  slug: string;
  token?: string;
  event: PublicEvent["event"];
  ceremonies: PublicEvent["ceremonies"];
  modules: PublicEvent["modules"];
  guest: PublicEvent["guest"];
  registry: RegistryForGuests | null;
  /** Null when the gallery is switched off, empty when there are no photos. */
  photos: GalleryPhoto[] | null;
}) {
  const palette = event.theme?.palette ?? FALLBACK_PALETTE;
  const names = nameLines(event.hostNames, event.title);

  const enabled = new Set(modules.map((module) => module.key));
  const rsvpModule = modules.find((module) => module.key === EventModuleKey.RSVP);
  const galleryConfig = modules.find((module) => module.key === EventModuleKey.GALLERY)?.config;

  const hasGifting =
    registry !== null &&
    (registry.items.length > 0 || registry.cashGiftMethods.length > 0);

  // Only the sections with something in them earn a place in the nav.
  const rendered = new Set(renderedSectionKeys(modules, event, palette));

  const sections: PageSection[] = [
    { id: "top", label: "Home" },
    ...(rendered.has(EventModuleKey.OUR_STORY) ? [{ id: "our_story", label: "Our Story" }] : []),
    ...(enabled.has(EventModuleKey.RSVP) ? [{ id: "rsvp", label: "RSVP" }] : []),
    ...(photos !== null ? [{ id: "moments", label: "Moments" }] : []),
    ...(ceremonies.length > 0 ? [{ id: "ceremonies", label: "Venues" }] : []),
    ...(hasGifting ? [{ id: "registry", label: "Registry" }] : []),
  ];

  return (
    <div
      className="min-h-dvh"
      style={{ backgroundColor: palette.surface, color: palette.ink }}
    >
      <PageNav sections={sections} palette={palette} />

      {/* The invitation itself, full bleed, in the theme's own colours. */}
      <header id="top" className="scroll-mt-20 px-6 py-10 sm:py-16">
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
            {[
              formatEventDate(event.startsAt, event.timezone),
              formatEventTime(event.startsAt, event.timezone),
            ]
              .filter(Boolean)
              .join(" · ")}
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

      <CeremonyProgramme
        ceremonies={ceremonies}
        timezone={event.timezone}
        palette={palette}
      />

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

      {photos !== null ? (
        <MomentsSection
          heading="Moments"
          pendingNote={
            typeof galleryConfig?.pendingNote === "string"
              ? galleryConfig.pendingNote
              : undefined
          }
          photos={photos}
          palette={palette}
        />
      ) : null}

      {hasGifting && registry ? (
        <GiftingSection
          slug={slug}
          token={token}
          heading="Gifting"
          note={registry.cashGiftNote ?? undefined}
          methods={registry.cashGiftMethods}
          items={registry.items}
          currency={registry.currency}
          palette={palette}
        />
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
