"use client";

import Link from "next/link";
import { useActionState, useMemo, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { EventModuleKey } from "@wtw/shared";
import { InvitationCard, nameLines } from "@/app/_components/invitation-card";
import { Button, Field, Input, Textarea } from "@/app/_components/ui";
import { saveEventDetails, toggleModule } from "@/lib/event-actions";
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

export function CustomizeEditor({ event, themes }: { event: EventDetail; themes: Theme[] }) {
  const save = saveEventDetails.bind(null, event.id);
  const [state, action] = useActionState(save, INITIAL);

  // Typing updates the preview immediately; saving persists it.
  const [partner1, setPartner1] = useState(event.hostNames[0] ?? "");
  const [partner2, setPartner2] = useState(event.hostNames[1] ?? "");
  const [venueName, setVenueName] = useState(event.venueName ?? "");

  const [themeKey, setThemeKey] = useState(event.theme?.key ?? null);
  const activeTheme = useMemo(
    () => themes.find((theme) => theme.key === themeKey) ?? null,
    [themes, themeKey],
  );

  const names = nameLines([partner1, partner2].filter(Boolean), event.title);
  const dateLabel = formatEventDate(event.startsAt, event.timezone, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).replaceAll("/", ". ");

  /**
   * Colour swatches. One per distinct accent, because a palette is recognised
   * by its accent — the backgrounds are all near-white paper.
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
            {activeTheme?.name ?? "Your design"}. Changes as you type.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/e/${event.slug}`}
            target="_blank"
            className="inline-flex items-center rounded-full border border-rule bg-white px-5 py-2.5 text-base text-forest"
          >
            Preview
          </Link>
          <Link
            href={`/events/${event.id}/publish`}
            className="inline-flex items-center rounded-full bg-forest px-5 py-2.5 text-base font-medium text-bright"
          >
            Publish event
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,340px)_minmax(0,1fr)_minmax(0,340px)]">
        <form action={action} className="rounded-2xl bg-white p-6">
          <h2 className="font-serif text-xl text-ink/70">Content</h2>

          <div className="mt-4 flex flex-col gap-4">
            <Field label="Partner 1" htmlFor="partner1">
              <Input
                id="partner1"
                name="partner1"
                value={partner1}
                onChange={(nativeEvent) => setPartner1(nativeEvent.target.value)}
                className="bg-white"
              />
            </Field>

            <Field label="Partner 2" htmlFor="partner2">
              <Input
                id="partner2"
                name="partner2"
                value={partner2}
                onChange={(nativeEvent) => setPartner2(nativeEvent.target.value)}
                className="bg-white"
              />
            </Field>

            <Field label="Event name" htmlFor="title" error={state.fieldErrors?.title}>
              <Input id="title" name="title" defaultValue={event.title} className="bg-white" />
            </Field>

            <Field label="Date" htmlFor="startsAt" error={state.fieldErrors?.startsAt}>
              <Input
                id="startsAt"
                name="startsAt"
                type="date"
                defaultValue={event.startsAt.slice(0, 10)}
                className="bg-white"
              />
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

            <Field label="City" htmlFor="city">
              <Input id="city" name="city" defaultValue={event.city ?? ""} className="bg-white" />
            </Field>

            <Field label="Your story" htmlFor="description">
              <Textarea
                id="description"
                name="description"
                rows={4}
                defaultValue={event.description ?? ""}
                placeholder="We met in a Nairobi bookshop in 2019…"
                className="bg-white"
              />
            </Field>

            {state.message ? (
              <p role="alert" className="text-sm text-ember">
                {state.message}
              </p>
            ) : null}

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
                onClick={() => setThemeKey(theme.key)}
                className={`size-9 rounded-full ${
                  theme.key === themeKey
                    ? "outline outline-2 outline-offset-2 outline-forest"
                    : ""
                }`}
                style={{ backgroundColor: theme.palette.accent }}
              />
            ))}
          </div>
          {/* Swatches preview only; the design is saved on the Template step. */}
          {themeKey !== event.theme?.key ? (
            <p className="mt-3 text-sm text-ink/70">
              Previewing {activeTheme?.name}.{" "}
              <Link
                href={`/events/${event.id}/template`}
                className="underline underline-offset-2"
              >
                Change the design
              </Link>{" "}
              to keep it.
            </p>
          ) : null}

          <h2 className="mt-8 text-sm tracking-[0.08em] text-muted uppercase">
            Website sections
          </h2>
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
      {pending ? "Saving…" : "Save changes"}
    </Button>
  );
}
