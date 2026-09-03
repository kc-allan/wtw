"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { EVENT_TYPES, EventTypeKey } from "@wtw/shared";
import { Field, Input, Select } from "@/app/_components/ui";
import { CITIES, OTHER_CITY } from "@/lib/cities";
import { saveEventBasics } from "@/lib/create-actions";
import type { CreateDraft } from "@/lib/create-draft";
import type { FormState } from "@/lib/form-state";

/**
 * The four the design offers. "Other" stands for the celebrations that share
 * one module set, so choosing it reveals which one rather than putting four
 * more pills in the row.
 */
const PRIMARY_CHOICES = [
  { key: EventTypeKey.WEDDING, label: "Wedding" },
  { key: EventTypeKey.BIRTHDAY, label: "Birthday" },
  { key: EventTypeKey.BABY_SHOWER, label: "Baby Shower" },
] as const;

const OTHER_CHOICES = [
  EventTypeKey.GRADUATION,
  EventTypeKey.ANNIVERSARY,
  EventTypeKey.BRIDAL_SHOWER,
  EventTypeKey.CORPORATE,
] as const;

/** The types that come as a pair, and so ask for a second name. */
const PAIRED_TYPES = new Set<EventTypeKey>([EventTypeKey.WEDDING, EventTypeKey.ANNIVERSARY]);

const INITIAL: FormState = {};

export function EventBasicsForm({
  draft,
  themeKey,
}: {
  draft: CreateDraft | null;
  themeKey?: string;
}) {
  const [state, action] = useActionState(saveEventBasics, INITIAL);
  const [selected, setSelected] = useState<EventTypeKey>(draft?.typeKey ?? EventTypeKey.WEDDING);
  const [isOther, setIsOther] = useState(
    draft ? OTHER_CHOICES.includes(draft.typeKey as (typeof OTHER_CHOICES)[number]) : false,
  );
  const [undecided, setUndecided] = useState(draft !== null && !draft.startsAt);
  const [city, setCity] = useState(startingCity(draft));

  return (
    <form action={action} className="mt-8">
      <fieldset>
        <legend className="sr-only">What are we celebrating?</legend>

        <div className="flex flex-wrap gap-4">
          {PRIMARY_CHOICES.map((choice) => (
            <TypePill
              key={choice.key}
              label={choice.label}
              checked={!isOther && selected === choice.key}
              onSelect={() => {
                setSelected(choice.key);
                setIsOther(false);
              }}
            />
          ))}

          <TypePill
            label="Other"
            checked={isOther}
            onSelect={() => {
              setIsOther(true);
              setSelected(EventTypeKey.GRADUATION);
            }}
          />
        </div>

        {/* The real value the API receives, whichever pill is showing. */}
        <input type="hidden" name="typeKey" value={selected} />
        {themeKey ? <input type="hidden" name="themeKey" value={themeKey} /> : null}
      </fieldset>

      {isOther ? (
        <Field
          label="Which celebration?"
          htmlFor="other-type"
          className="mt-6 max-w-[420px]"
        >
          <Select
            id="other-type"
            value={selected}
            onChange={(nativeEvent) => setSelected(nativeEvent.target.value as EventTypeKey)}
            className="bg-white"
          >
            {OTHER_CHOICES.map((key) => (
              <option key={key} value={key}>
                {EVENT_TYPES[key].name}
              </option>
            ))}
          </Select>
        </Field>
      ) : null}

      <div className="mt-8 w-full max-w-[594px] rounded-2xl bg-white p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-black">Enter your details</h2>
        <span aria-hidden className="mt-4 block h-px w-full bg-rule/60" />

        <div className="mt-5 flex flex-col gap-5">
          <Field label="Full Name" htmlFor="fullName" error={state.fieldErrors?.fullName}>
            <Input
              id="fullName"
              name="fullName"
              autoComplete="name"
              required
              defaultValue={draft?.fullName}
              placeholder="e.g., Amina Wanjiku"
              className="bg-white"
            />
          </Field>

          {PAIRED_TYPES.has(selected) ? (
            <Field label="Partners Full name" htmlFor="partnerName">
              <Input
                id="partnerName"
                name="partnerName"
                defaultValue={draft?.partnerName}
                placeholder="e.g., Jayde Wambua"
                className="bg-white"
              />
            </Field>
          ) : null}

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Field label="Date" htmlFor="startsAt" error={state.fieldErrors?.startsAt}>
                <Input
                  id="startsAt"
                  name="startsAt"
                  type="date"
                  required={!undecided}
                  disabled={undecided}
                  defaultValue={draft?.startsAt?.slice(0, 10)}
                  className="bg-white disabled:opacity-50"
                />
              </Field>

              <label className="mt-3 flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  name="dateUndecided"
                  checked={undecided}
                  onChange={(nativeEvent) => setUndecided(nativeEvent.target.checked)}
                  className="h-4 w-4 accent-forest"
                />
                <span className="text-base text-ink">We&rsquo;re still deciding</span>
              </label>
            </div>

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
                defaultValue={draft?.expectedGuests}
                placeholder="e.g., 180"
                className="bg-white"
              />
            </Field>
          </div>

          <Field label="City" htmlFor="city" error={state.fieldErrors?.city}>
            <Select
              id="city"
              name="city"
              value={city}
              onChange={(nativeEvent) => setCity(nativeEvent.target.value)}
              className="bg-white"
            >
              <option value="">e.g., Nairobi</option>
              {CITIES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
              <option value={OTHER_CITY}>Somewhere else</option>
            </Select>
          </Field>

          {city === OTHER_CITY ? (
            <Field label="Where?" htmlFor="otherCity">
              <Input
                id="otherCity"
                name="otherCity"
                required
                placeholder="Town or village"
                className="bg-white"
              />
            </Field>
          ) : null}

          {state.message ? (
            <p role="alert" className="text-sm text-ember">
              {state.message}
            </p>
          ) : null}

          <SubmitButton />
        </div>
      </div>
    </form>
  );
}

/** A city off the list is remembered as the free-text answer it was. */
function startingCity(draft: CreateDraft | null): string {
  if (!draft?.city) return "";
  return CITIES.includes(draft.city as (typeof CITIES)[number]) ? draft.city : OTHER_CITY;
}

function TypePill({
  label,
  checked,
  onSelect,
}: {
  label: string;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={`cursor-pointer rounded-full bg-white px-8 py-3 text-base whitespace-nowrap text-black transition-colors ${
        checked ? "ring-2 ring-forest" : "ring-1 ring-transparent hover:ring-rule"
      }`}
    >
      <input
        type="radio"
        name="typeChoice"
        checked={checked}
        onChange={onSelect}
        className="sr-only"
      />
      {label}
    </label>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-forest px-6 py-4 text-base font-medium text-bright transition-colors hover:bg-forest-deep disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "One moment…" : "Continue"}
    </button>
  );
}
