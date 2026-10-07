import { EventModuleKey } from "@wtw/shared";
import type { CSSProperties } from "react";
import { invitationAccent, invitationDesign } from "@/lib/invitation-designs";
import { InvitationHero, invitationStyles as styles } from "@/app/_components/invitation-hero";
import { formatEventDate, formatEventTime } from "@/lib/event-display";
import type { GalleryPhoto, PublicEvent, PublicGame, RegistryForGuests } from "@/lib/types";
import { InvitationCard, nameLines } from "@/app/_components/invitation-card";
import { FALLBACK_PALETTE } from "@/app/_data/templates";
import { CeremonyProgramme } from "./ceremony-programme";
import { EventSections } from "./event-sections";
import { GiftingSection } from "./gifting-section";
import { GamesSection } from "./games-section";
import { publicPageSections } from "@/lib/event-public-sections";
import { MomentsSection } from "./moments-section";
import { PageNav } from "./page-nav";
import { RsvpForm } from "./rsvp-form";
import collectionStyles from "@/app/_components/invitation-collection.module.css";

/**
 * The event exactly as a guest reads it. Kept apart from the fetching so the
 * host can see the same page before it is published, from their own data.
 */
export function EventPageView({
  slug,
  token,
  accessCode,
  event,
  ceremonies,
  modules,
  guest,
  registry,
  photos,
  games,
  previewMode = false,
}: {
  slug: string;
  token?: string;
  accessCode?: string;
  event: PublicEvent["event"];
  ceremonies: PublicEvent["ceremonies"];
  modules: PublicEvent["modules"];
  guest: PublicEvent["guest"];
  registry: RegistryForGuests | null;
  /** Null when the gallery is switched off, empty when there are no photos. */
  photos: GalleryPhoto[] | null;
  games: PublicGame[];
  previewMode?: boolean;
}) {
  const design = invitationDesign(event.theme?.key);
  const basePalette = design?.palette ?? event.theme?.palette ?? FALLBACK_PALETTE;
  const accent = invitationAccent(modules.find((module) => module.key === EventModuleKey.INVITATION)?.config);
  const palette = { ...basePalette, accent: accent ?? basePalette.accent };
  const names = nameLines(event.hostNames, event.title);

  const enabled = new Set(modules.map((module) => module.key));
  const rsvpModule = modules.find((module) => module.key === EventModuleKey.RSVP);
  const galleryConfig = modules.find((module) => module.key === EventModuleKey.GALLERY)?.config;

  const hasGifting =
    registry !== null &&
    (registry.items.length > 0 ||
      registry.cashGiftMethods.length > 0 ||
      registry.externalRegistries.length > 0);

  const sections = publicPageSections({
    event,
    modules,
    ceremoniesCount: ceremonies.length,
    hasGallery: photos !== null,
    hasRegistry: hasGifting,
    hasGames: games.length > 0,
  });

  return (
    <div
      className={`min-h-dvh ${design ? `${styles.landing} ${styles[`${design.kind}Page`] ?? ""} ${collectionStyles[design.kind] ? `${collectionStyles.page} ${collectionStyles[design.kind]}` : ""}` : ""}`}
      style={{ backgroundColor: palette.surface, color: palette.ink, "--invite-accent": palette.accent } as CSSProperties}
    >
      <PageNav sections={sections} palette={palette} />

      {design ? <>
        <InvitationHero design={design} names={event.hostNames} title={event.title}
          date={formatEventDate(event.startsAt, event.timezone)} venue={[event.venueName, event.city].filter(Boolean).join(", ")}
          accent={palette.accent} rsvp={enabled.has(EventModuleKey.RSVP)} />
        <section id="celebration-details" aria-label="Celebration details" className={styles.details}>
          <div><span>When</span><strong>{formatEventDate(event.startsAt, event.timezone)}</strong>
            {event.startsAt ? <p>{formatEventTime(event.startsAt, event.timezone)} · {event.timezone.replaceAll("_", " ")}</p> : null}</div>
          <div><span>Where</span><strong>{event.venueName || event.city || "Location to be announced"}</strong>
            {event.venueAddress ? <p>{event.venueAddress}</p> : null}
            {event.venueName || event.venueAddress || event.city ? <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([event.venueName, event.venueAddress, event.city].filter(Boolean).join(", "))}`} target="_blank" rel="noreferrer">Get directions</a> : null}</div>
        </section>
      </> : <>
      <header id="top" className="scroll-mt-20 px-6 py-10 sm:py-16">
        <InvitationCard
          themeKey={event.theme?.key ?? null}
          group={event.theme?.group ?? null}
          eventTypeKey={event.typeKey}
          palette={basePalette}
          accentColor={accent}
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
      </>}

      <div className={design ? styles.body : undefined}>

      <CeremonyProgramme
        ceremonies={ceremonies}
        timezone={event.timezone}
        palette={palette}
      />

      <EventSections event={event} modules={modules} palette={palette} design={design} />

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
              {design?.replyHeading ?? (design?.kind === "brunch" ? "A seat with your name on it" : design?.kind === "garden" ? "The pleasure of your company" : "Will you be there?")}
            </h2>

            <RsvpForm
              tone={design && design.category !== "wedding" ? "casual" : "formal"}
              slug={slug}
              token={token}
              guest={guest}
              config={rsvpModule?.config ?? {}}
              palette={palette}
              previewMode={previewMode}
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

      {games.length > 0 ? (
        <GamesSection
          slug={slug}
          token={token}
          accessCode={accessCode}
          guest={guest}
          games={games}
          palette={palette}
          previewMode={previewMode}
        />
      ) : null}

      {hasGifting && registry ? (
        <GiftingSection
          slug={slug}
          token={token}
          heading="Gifting"
          note={registry.cashGiftNote ?? undefined}
          methods={registry.cashGiftMethods}
          externalRegistries={registry.externalRegistries}
          items={registry.items}
          currency={registry.currency}
          palette={palette}
        />
      ) : null}
      </div>

      <footer
        className="px-6 py-10 text-center text-sm"
        style={{ color: palette.muted }}
      >
        Made with Worth the Wait
      </footer>
    </div>
  );
}
