"use client";

import { useActionState, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { CEREMONIES, CEREMONY_ORDER } from "@wtw/shared";
import { Button, Field, Input, Select, Textarea } from "@/app/_components/ui";
import { chooseCeremonyTheme, saveCeremonyDetails, setCeremonies } from "@/lib/ceremony-actions";
import type { Ceremony, EventDetail, Theme } from "@/lib/types";
import type { FormState } from "@/lib/form-state";

const INITIAL: FormState = {};

export function CeremonyEditor({ event, themes }: { event: EventDetail; themes: Theme[] }) {
  const [open, setOpen] = useState<string | null>(event.ceremonies[0]?.id ?? null);

  return (
    <div className="mt-8 flex flex-col gap-8">
      <WhichCeremonies eventId={event.id} chosen={event.ceremonies} />

      {event.ceremonies.length === 0 ? (
        <p className="text-base text-ink/70">
          Choose the ceremonies above and each one will appear here to fill in.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {event.ceremonies.map((ceremony) => (
            <li key={ceremony.id} className="rounded-2xl bg-ivory">
              <h3>
                <button
                  type="button"
                  aria-expanded={open === ceremony.id}
                  onClick={() => setOpen(open === ceremony.id ? null : ceremony.id)}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="font-serif text-xl font-semibold text-black">
                    {ceremony.name}
                  </span>
                  <span className="text-sm text-ink/60">
                    {summarise(ceremony)}
                  </span>
                </button>
              </h3>

              {open === ceremony.id ? (
                <div className="border-t border-rule/50 px-6 py-6">
                  <CeremonyDetails eventId={event.id} ceremony={ceremony} />
                  <CeremonyTheme
                    eventId={event.id}
                    ceremony={ceremony}
                    themes={themes}
                    inheritedName={event.theme?.name ?? null}
                  />
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** A one-line answer to "is this filled in yet". */
function summarise(ceremony: Ceremony): string {
  const parts = [
    ceremony.startsAt
      ? new Date(ceremony.startsAt).toLocaleDateString("en-KE", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "No date yet",
    ceremony.venueName ?? ceremony.city ?? "No place yet",
  ];
  return parts.join(" · ");
}

function WhichCeremonies({ eventId, chosen }: { eventId: string; chosen: Ceremony[] }) {
  const [state, action] = useActionState(setCeremonies.bind(null, eventId), INITIAL);
  const selected = new Set(chosen.map((ceremony) => ceremony.key));

  return (
    <form action={action} className="rounded-2xl bg-ivory p-6">
      <fieldset>
        <legend className="font-serif text-xl font-semibold text-black">
          Which ceremonies are you having?
        </legend>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
          {CEREMONY_ORDER.map((key) => (
            <label key={key} className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                name="ceremonies"
                value={key}
                defaultChecked={selected.has(key)}
                className="h-4 w-4 accent-forest"
              />
              <span className="text-base text-ink">{CEREMONIES[key].name}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {state.message ? (
        <p role="alert" className="mt-3 text-sm text-ember">
          {state.message}
        </p>
      ) : null}

      <p className="mt-4 text-sm text-ink/60">
        Clearing a ceremony removes its details and the guests assigned to it.
      </p>
      <SaveButton className="mt-4" label="Save ceremonies" />
    </form>
  );
}

function CeremonyDetails({ eventId, ceremony }: { eventId: string; ceremony: Ceremony }) {
  const [state, action] = useActionState(
    saveCeremonyDetails.bind(null, eventId, ceremony.id),
    INITIAL,
  );

  return (
    <form action={action} className="flex flex-col gap-5">
      <Field label="Name" htmlFor={`name-${ceremony.id}`}>
        <Input
          id={`name-${ceremony.id}`}
          name="name"
          defaultValue={ceremony.name}
          className="bg-white"
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Date and time" htmlFor={`startsAt-${ceremony.id}`}>
          <Input
            id={`startsAt-${ceremony.id}`}
            name="startsAt"
            type="datetime-local"
            defaultValue={ceremony.startsAt?.slice(0, 16)}
            className="bg-white"
          />
        </Field>
        <Field label="Dress code" htmlFor={`dressCode-${ceremony.id}`}>
          <Input
            id={`dressCode-${ceremony.id}`}
            name="dressCode"
            defaultValue={ceremony.dressCode ?? ""}
            placeholder="e.g., Traditional attire"
            className="bg-white"
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Venue" htmlFor={`venueName-${ceremony.id}`}>
          <Input
            id={`venueName-${ceremony.id}`}
            name="venueName"
            defaultValue={ceremony.venueName ?? ""}
            className="bg-white"
          />
        </Field>
        <Field label="City" htmlFor={`city-${ceremony.id}`}>
          <Input
            id={`city-${ceremony.id}`}
            name="city"
            defaultValue={ceremony.city ?? ""}
            className="bg-white"
          />
        </Field>
      </div>

      <Field label="What to expect" htmlFor={`description-${ceremony.id}`}>
        <Textarea
          id={`description-${ceremony.id}`}
          name="description"
          rows={3}
          defaultValue={ceremony.description ?? ""}
          className="bg-white"
        />
      </Field>

      {state.message ? (
        <p role="status" className="text-sm text-ink/70">
          {state.message}
        </p>
      ) : null}

      <SaveButton label="Save details" className="self-start" />
    </form>
  );
}

function CeremonyTheme({
  eventId,
  ceremony,
  themes,
  inheritedName,
}: {
  eventId: string;
  ceremony: Ceremony;
  themes: Theme[];
  inheritedName: string | null;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="mt-6 border-t border-rule/50 pt-6">
      <Field label="Design" htmlFor={`theme-${ceremony.id}`} className="max-w-[420px]">
        <Select
          id={`theme-${ceremony.id}`}
          value={ceremony.theme?.key ?? ""}
          disabled={pending}
          onChange={(nativeEvent) => {
            const value = nativeEvent.target.value;
            startTransition(async () => {
              await chooseCeremonyTheme(eventId, ceremony.id, value === "" ? null : value);
            });
          }}
          className="bg-white"
        >
          <option value="">
            {inheritedName ? `Same as the event (${inheritedName})` : "Same as the event"}
          </option>
          {themes.map((theme) => (
            <option key={theme.key} value={theme.key}>
              {theme.name}
            </option>
          ))}
        </Select>
      </Field>
    </div>
  );
}

function SaveButton({ label, className = "" }: { label: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="ghost" disabled={pending} className={className}>
      {pending ? "Saving…" : label}
    </Button>
  );
}
