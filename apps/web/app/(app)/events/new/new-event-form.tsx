"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { EVENT_TYPES, EventTypeKey } from "@wtw/shared";
import { Button, Field, Input, Select } from "@/app/_components/ui";
import { createEvent } from "@/lib/event-actions";
import type { FormState } from "@/lib/form-state";

/**
 * The four choices the design offers. "Other" stands for the celebrations that
 * share one module set, so picking it reveals which one rather than adding
 * four more cards to the row.
 */
const PRIMARY_CHOICES = [
  { key: EventTypeKey.WEDDING, emoji: "💍", label: "Wedding" },
  { key: EventTypeKey.BIRTHDAY, emoji: "🎂", label: "Birthday" },
  { key: EventTypeKey.BABY_SHOWER, emoji: "🎈", label: "Baby shower" },
] as const;

const OTHER_CHOICES = [
  EventTypeKey.GRADUATION,
  EventTypeKey.ANNIVERSARY,
  EventTypeKey.BRIDAL_SHOWER,
  EventTypeKey.CORPORATE,
] as const;

const INITIAL: FormState = {};

export function NewEventForm() {
  const [state, action] = useActionState(createEvent, INITIAL);
  const [selected, setSelected] = useState<EventTypeKey | null>(null);
  const [isOther, setIsOther] = useState(false);

  return (
    <form action={action} className="mt-8 flex flex-col gap-8">
      <fieldset>
        <legend className="sr-only">What are we celebrating?</legend>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {PRIMARY_CHOICES.map((choice) => (
            <TypeCard
              key={choice.key}
              emoji={choice.emoji}
              label={choice.label}
              checked={!isOther && selected === choice.key}
              onSelect={() => {
                setSelected(choice.key);
                setIsOther(false);
              }}
            />
          ))}

          <TypeCard
            emoji="🎉"
            label="Other"
            checked={isOther}
            onSelect={() => {
              setIsOther(true);
              setSelected(EventTypeKey.GRADUATION);
            }}
          />
        </div>

        {/* The real value the API receives, whichever card is showing. */}
        <input type="hidden" name="typeKey" value={selected ?? ""} />
      </fieldset>

      {isOther ? (
        <Field label="Which celebration?" htmlFor="other-type" className="max-w-[420px]">
          <Select
            id="other-type"
            value={selected ?? ""}
            onChange={(nativeEvent) => setSelected(nativeEvent.target.value as EventTypeKey)}
          >
            {OTHER_CHOICES.map((key) => (
              <option key={key} value={key}>
                {EVENT_TYPES[key].name}
              </option>
            ))}
          </Select>
        </Field>
      ) : null}

      <div className="w-full max-w-[596px] rounded-2xl bg-ivory p-8">
        <h2 className="font-serif text-xl font-semibold text-black">The basics</h2>
        <span aria-hidden className="mt-4 block h-px w-full bg-rule/70" />

        <div className="mt-5 flex flex-col gap-5">
          <Field label="Event name" htmlFor="title" error={state.fieldErrors?.title}>
            <Input
              id="title"
              name="title"
              required
              placeholder="e.g., Amina &amp; Brian's Wedding"
              className="bg-white"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Date" htmlFor="startsAt" error={state.fieldErrors?.startsAt}>
              <Input id="startsAt" name="startsAt" type="date" required className="bg-white" />
            </Field>

            <Field
              label="Expected guests"
              htmlFor="expectedGuests"
              error={state.fieldErrors?.expectedGuests}
            >
              <Input
                id="expectedGuests"
                name="expectedGuests"
                type="number"
                min={1}
                inputMode="numeric"
                placeholder="e.g., 180"
                className="bg-white"
              />
            </Field>
          </div>

          <Field label="City" htmlFor="city" error={state.fieldErrors?.city}>
            <Input id="city" name="city" placeholder="e.g., Nairobi" className="bg-white" />
          </Field>

          {state.message ? (
            <p role="alert" className="text-sm text-ember">
              {state.message}
            </p>
          ) : null}

          <SubmitButton disabled={selected === null} />
        </div>
      </div>
    </form>
  );
}

function TypeCard({
  emoji,
  label,
  checked,
  onSelect,
}: {
  emoji: string;
  label: string;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center justify-center gap-3 rounded-xl px-6 py-8 text-center transition-colors ${
        checked ? "bg-ivory ring-2 ring-forest" : "bg-ivory hover:ring-1 hover:ring-rule"
      }`}
    >
      <input
        type="radio"
        name="typeChoice"
        checked={checked}
        onChange={onSelect}
        className="sr-only"
      />
      <span aria-hidden className="text-2xl">
        {emoji}
      </span>
      <span className="font-serif text-xl text-black">{label}</span>
    </label>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={disabled || pending} className="self-start">
      {pending ? "Creating…" : "Continue to templates"}
    </Button>
  );
}
