"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { EventModuleKey, EventTypeKey } from "@wtw/shared";
import { InvitationCard, nameLines } from "@/app/_components/invitation-card";
import { Button, Field, Input, Textarea } from "@/app/_components/ui";
import { saveEventDetails, toggleModule } from "@/lib/event-actions";
import { eventSurfaceLabel } from "@/lib/event-public-sections";
import { formatEventDate } from "@/lib/event-display";
import type { FormState } from "@/lib/form-state";
import type { EventDetail, Theme } from "@/lib/types";

/** The sections a host toggles here, in the order the design lists them. */
const SECTION_ORDER: EventModuleKey[] = [
  EventModuleKey.OUR_STORY,
  EventModuleKey.TIMELINE,
  EventModuleKey.VENUE_MAP,
  EventModuleKey.REGISTRY,
  EventModuleKey.DRESS_CODE,
  EventModuleKey.FAQ,
  EventModuleKey.ACCOMMODATION,
  EventModuleKey.COUNTDOWN,
  EventModuleKey.GAMES,
  EventModuleKey.GALLERY,
];

const INITIAL: FormState = {};

type NameFieldConfig = {
  primary: string;
  secondary?: string;
  description: string;
  descriptionPlaceholder: string;
};

function nameFieldConfig(typeKey: EventDetail["typeKey"], websiteEnabled: boolean): NameFieldConfig {
  switch (typeKey) {
    case EventTypeKey.WEDDING:
      return {
        primary: "Partner 1",
        secondary: "Partner 2",
        description: websiteEnabled ? "Our story" : "Invitation note",
        descriptionPlaceholder: "Share the note guests should read before they RSVP.",
      };
    case EventTypeKey.ANNIVERSARY:
      return {
        primary: "First name",
        secondary: "Second name",
        description: "Celebration note",
        descriptionPlaceholder: "Share what you are celebrating and what guests should know.",
      };
    case EventTypeKey.BIRTHDAY:
      return {
        primary: "Birthday person",
        description: "Invitation note",
        descriptionPlaceholder: "Share the note guests should read before they RSVP.",
      };
    case EventTypeKey.BABY_SHOWER:
      return {
        primary: "Parent or baby name",
        description: "Invitation note",
        descriptionPlaceholder: "Share the note guests should read before they RSVP.",
      };
    case EventTypeKey.CORPORATE:
      return {
        primary: "Organization or host",
        description: "Event note",
        descriptionPlaceholder: "Share the purpose, welcome note or arrival details guests should know.",
      };
    default:
      return {
        primary: "Honoree or host",
        description: "Invitation note",
        descriptionPlaceholder: "Share the note guests should read before they RSVP.",
      };
  }
}

export function CustomizeEditor({ event, themes }: { event: EventDetail; themes: Theme[] }) {
  const save = saveEventDetails.bind(null, event.id);
  const [state, action, pending] = useActionState(save, INITIAL);
  const [dirty, setDirty] = useState(false);

  const surfaceLabel = eventSurfaceLabel(event);
  const websiteEnabled = surfaceLabel === "Wedding website";
  const fieldConfig = nameFieldConfig(event.typeKey, websiteEnabled);

  useEffect(() => {
    if (state.message === "Saved") {
      setDirty(false);
    }
  }, [state.message]);

  // Typing updates the card beside the form. Saving updates the preview and guest page.
  const [partner1, setPartner1] = useState(event.hostNames[0] ?? "");
  const [partner2, setPartner2] = useState(event.hostNames[1] ?? "");
  const [venueName, setVenueName] = useState(event.venueName ?? "");
  const [dateUndecided, setDateUndecided] = useState(event.startsAt === null);

  const [themeKey, setThemeKey] = useState(event.theme?.key ?? null);
  const activeTheme = useMemo(
    () => themes.find((theme) => theme.key === themeKey) ?? null,
    [themes, themeKey],
  );

  const names = nameLines([partner1, partner2].filter(Boolean), event.title);
  const dateValue = event.startsAt?.slice(0, 10) ?? "";
  const timeValue = event.startsAt?.slice(11, 16) ?? "";
  const dateLabel = formatEventDate(event.startsAt, event.timezone, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).replaceAll("/", ". ");

  /**
   * Colour swatches. One per distinct accent, because a palette is recognised
   * by its accent because the backgrounds are all near-white paper.
   */
  const swatches = themes.filter(
    (theme, index) =>
      themes.findIndex((other) => other.palette.accent === theme.palette.accent) === index,
  ).slice(0, 6);

  return (
    <>
      <div className="mt-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-section font-semibold text-black">Make it yours</h1>
          <p className="mt-1 text-base tracking-[0.02em] text-ink/70">
            {activeTheme?.name ?? "Your design"}. Save changes before previewing or publishing.
          </p>
          <p className="mt-2 text-sm text-ink/60">Editing {surfaceLabel.toLowerCase()} content.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {dirty || pending ? (
            <span className="inline-flex items-center rounded-full border border-rule bg-white px-5 py-2.5 text-base text-ink/50">
              Save before preview
            </span>
          ) : (
            <Link
              href={`/events/${event.id}/preview`}
              target="_blank"
              className="inline-flex items-center rounded-full border border-rule bg-white px-5 py-2.5 text-base text-forest"
            >
              Preview
            </Link>
          )}
          {dirty || pending ? (
            <span className="inline-flex items-center rounded-full bg-forest/50 px-5 py-2.5 text-base font-medium text-bright">
              Save before publish
            </span>
          ) : (
            <Link
              href={`/events/${event.id}/publish`}
              className="inline-flex items-center rounded-full bg-forest px-5 py-2.5 text-base font-medium text-bright"
            >
              Publish event
            </Link>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,340px)_minmax(0,1fr)_minmax(0,340px)]">
        <form action={action} onChange={() => setDirty(true)} className="rounded-2xl bg-white p-6">
          <h2 className="font-serif text-xl text-ink/70">Content</h2>

          <div className="mt-4 flex flex-col gap-4">
            <Field label={fieldConfig.primary} htmlFor="partner1">
              <Input
                id="partner1"
                name="partner1"
                value={partner1}
                onChange={(nativeEvent) => setPartner1(nativeEvent.target.value)}
                className="bg-white"
              />
            </Field>

            {fieldConfig.secondary ? (
              <Field label={fieldConfig.secondary} htmlFor="partner2">
                <Input
                  id="partner2"
                  name="partner2"
                  value={partner2}
                  onChange={(nativeEvent) => setPartner2(nativeEvent.target.value)}
                  className="bg-white"
                />
              </Field>
            ) : (
              <input type="hidden" name="partner2" value="" />
            )}

            <Field label="Event name" htmlFor="title" error={state.fieldErrors?.title}>
              <Input id="title" name="title" defaultValue={event.title} className="bg-white" />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Field label="Date" htmlFor="startsAtDate" error={state.fieldErrors?.startsAt}>
                  <Input
                    id="startsAtDate"
                    name="startsAtDate"
                    type="date"
                    disabled={dateUndecided}
                    defaultValue={dateValue}
                    className="bg-white disabled:opacity-50"
                  />
                </Field>
                <label className="mt-3 flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    name="dateUndecided"
                    checked={dateUndecided}
                    onChange={(nativeEvent) => setDateUndecided(nativeEvent.target.checked)}
                    className="h-4 w-4 accent-forest"
                  />
                  <span className="text-sm text-ink">Date to be announced</span>
                </label>
              </div>

              <Field label="Time" htmlFor="startsAtTime">
                <Input
                  id="startsAtTime"
                  name="startsAtTime"
                  type="time"
                  disabled={dateUndecided}
                  defaultValue={timeValue}
                  className="bg-white disabled:opacity-50"
                />
              </Field>
            </div>

            <Field label="Timezone" htmlFor="timezone">
              <select
                id="timezone"
                name="timezone"
                defaultValue={event.timezone}
                className="w-full rounded-lg border border-rule bg-white px-4 py-3 text-base text-ink outline-offset-2 focus:border-forest"
              >
                <option value="Africa/Nairobi">Africa/Nairobi</option>
                <option value="Africa/Kampala">Africa/Kampala</option>
                <option value="Africa/Dar_es_Salaam">Africa/Dar es Salaam</option>
                <option value="Europe/London">Europe/London</option>
                <option value="America/New_York">America/New York</option>
              </select>
            </Field>

            <Field label="Venue" htmlFor="venueName">
              <Input
                id="venueName"
                name="venueName"
                value={venueName}
                onChange={(nativeEvent) => setVenueName(nativeEvent.target.value)}
                placeholder="All Saints Cathedral, Nairobi"
                className="bg-white"
              />
            </Field>

            <Field label="Address" htmlFor="venueAddress">
              <Input
                id="venueAddress"
                name="venueAddress"
                defaultValue={event.venueAddress ?? ""}
                placeholder="Street address, entrance or landmark"
                className="bg-white"
              />
            </Field>

            <Field label="City" htmlFor="city">
              <Input id="city" name="city" defaultValue={event.city ?? ""} className="bg-white" />
            </Field>

            <Field label={fieldConfig.description} htmlFor="description">
              <Textarea
                id="description"
                name="description"
                rows={4}
                defaultValue={event.description ?? ""}
                placeholder={fieldConfig.descriptionPlaceholder}
                className="bg-white"
              />
            </Field>

            <input type="hidden" name="themeKey" value={themeKey ?? ""} />

            <p role="status" className={`text-sm ${state.message === "Saved" ? "text-success" : "text-ember"}`}>
              {pending ? "Saving" : dirty ? "Unsaved changes" : state.message === "Saved" ? "Saved" : state.message}
            </p>

            <SaveButton />
          </div>
        </form>

        <div className="flex items-start justify-center">
          <InvitationCard
            themeKey={themeKey}
            group={activeTheme?.group ?? event.theme?.group ?? null}
            eventTypeKey={event.typeKey}
            palette={activeTheme?.palette ?? event.theme?.palette ?? null}
            content={{
              names,
              themeName: activeTheme?.name ?? event.theme?.name ?? "",
              dateLabel,
            }}
            className="w-full max-w-[330px] aspect-[330/450]"
          />
        </div>

        <div className="rounded-2xl bg-white p-6">
          <h2 className="font-serif text-xl text-ink/70">Color</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {swatches.map((theme) => (
              <button
                key={theme.key}
                type="button"
                aria-label={theme.name}
                aria-pressed={theme.key === themeKey}
                onClick={() => {
                  setThemeKey(theme.key);
                  setDirty(true);
                }}
                className={`size-9 rounded-full ${
                  theme.key === themeKey
                    ? "outline outline-2 outline-offset-2 outline-forest"
                    : ""
                }`}
                style={{ backgroundColor: theme.palette.accent }}
              />
            ))}
          </div>
          {themeKey !== event.theme?.key ? (
            <p className="mt-3 text-sm text-ink/70">
              Save changes to keep {activeTheme?.name}.
            </p>
          ) : null}

          <div className="mt-8 flex items-center justify-between gap-3">
            <h2 className="text-sm tracking-[0.08em] text-muted uppercase">
              {websiteEnabled ? "Website sections" : "Optional sections"}
            </h2>
            <Link
              href={`/events/${event.id}/content`}
              className="text-sm text-forest underline underline-offset-2"
            >
              Edit content
            </Link>
          </div>
          <ul className="mt-4 flex flex-col">
            {SECTION_ORDER.map((key) => {
              const module = event.modules.find((entry) => entry.key === key);
              if (!module) return null;
              return <SectionToggle key={key} eventId={event.id} module={module} />;
            })}
          </ul>
        </div>
      </div>
    </>
  );
}

function SectionToggle({
  eventId,
  module,
}: {
  eventId: string;
  module: EventDetail["modules"][number];
}) {
  const [enabled, setEnabled] = useState(module.enabled);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  return (
    <li className="flex items-center justify-between gap-4 border-b border-rule/40 py-3 last:border-0">
      <span className="text-base text-ink">
        {module.name}
        {module.required ? <span className="ms-2 text-sm text-muted">Always on</span> : null}
        {error ? <span className="block text-sm text-ember">{error}</span> : null}
      </span>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={module.name}
        disabled={module.required}
        onClick={() => {
          const next = !enabled;
          // Flip immediately, then put it back if the API refuses.
          setEnabled(next);
          setError(null);
          startTransition(async () => {
            const result = await toggleModule(eventId, module.key, next);
            if (!result.ok) {
              setEnabled(!next);
              setError(result.message ?? "Could not change that");
            }
          });
        }}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
          enabled ? "bg-success" : "bg-muted"
        }`}
      >
        <span
          aria-hidden
          className={`absolute top-0.5 size-5 rounded-full bg-white transition-[inset-inline-start] ${
            enabled ? "start-[22px]" : "start-0.5"
          }`}
        />
      </button>
    </li>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="self-start">
      {pending ? "Saving" : "Save changes"}
    </Button>
  );
}
