"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { RsvpStatus } from "@wtw/shared";
import type { PublicEvent, ThemePalette } from "@/lib/types";
import { submitRsvp, type RsvpState } from "./rsvp-actions";
import { TurnstileWidget } from "@/app/_components/turnstile-widget";

const INITIAL: RsvpState = {};

export function RsvpForm({
  slug,
  token,
  guest,
  config,
  palette,
  previewMode = false,
  tone = "formal",
}: {
  slug: string;
  token?: string;
  guest: PublicEvent["guest"];
  config: Record<string, unknown>;
  palette: ThemePalette;
  previewMode?: boolean;
  tone?: "formal" | "casual";
}) {
  const action = submitRsvp.bind(null, slug, token ?? "");
  const [state, formAction] = useActionState(action, INITIAL);
  const [idempotencyKey, setIdempotencyKey] = useState("");

  useEffect(() => {
    if (guest || token) return;
    const storageKey = `wtw-rsvp:${slug}`;
    try {
      const stored = sessionStorage.getItem(storageKey);
      if (stored && /^[A-Za-z0-9_-]{43}$/.test(stored)) {
        setIdempotencyKey(stored);
        return;
      }
      const bytes = crypto.getRandomValues(new Uint8Array(32));
      const key = btoa(String.fromCharCode(...bytes))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
      sessionStorage.setItem(storageKey, key);
      setIdempotencyKey(key);
      return;
    } catch {
      const bytes = crypto.getRandomValues(new Uint8Array(32));
      const fallback = btoa(String.fromCharCode(...bytes))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
      setIdempotencyKey(fallback);
    }
  }, [guest, slug, token]);

  useEffect(() => {
    if (state.status === "sent" && !token) {
      try {
        sessionStorage.removeItem(`wtw-rsvp:${slug}`);
      } catch {
        // Ignore session storage failures; the in-memory key remains for form state.
      }
    }
  }, [slug, state.status, token]);

  const [status, setStatus] = useState<RsvpStatus | null>(
    (guest?.rsvp?.status as RsvpStatus) ?? null,
  );
  // The split is offered against the party size, so it has to follow it.
  const [partySize, setPartySize] = useState(guest?.rsvp?.partySize ?? 1);

  const controlStyle = {
    backgroundColor: palette.surface,
    color: palette.ink,
    borderColor: `${palette.ink}33`,
  };

  if (state.status === "sent") {
    return (
      <div role="status" className="mt-6 rounded-lg p-4 text-center text-base" style={controlStyle}>
        <p>
          Thank you{guest ? `, ${guest.firstName}` : ""}. Your reply is in.
        </p>
        {state.returnUrl ? (
          <p className="mt-2 break-all text-sm opacity-80">
            Save this private link if you need to change your reply: {state.returnUrl}
          </p>
        ) : (
          <p className="mt-2 text-sm opacity-80">
            Reopen this link any time to change it.
          </p>
        )}
      </div>
    );
  }

  const allowMaybe = (config.allowMaybe as boolean | undefined) ?? true;
  const allowPlusOnes = (config.allowPlusOnes as boolean | undefined) ?? false;
  const mealOptions = (config.mealOptions as string[] | undefined) ?? [];
  const collectDietary = (config.collectDietary as boolean | undefined) ?? false;
  const collectMessage = (config.collectMessage as boolean | undefined) ?? true;
  const collectBreakdown =
    (config.collectHeadcountBreakdown as boolean | undefined) ?? false;
  const deadline = typeof config.deadline === "string" ? new Date(config.deadline) : null;
  const isClosed = deadline !== null && deadline.getTime() < Date.now();
  const ceiling = Math.min(
    guest?.maxPartySize ?? (config.maxPartySize as number | undefined) ?? 1,
    (config.maxPartySize as number | undefined) ?? guest?.maxPartySize ?? 1,
  );

  const choices = [
    { key: RsvpStatus.ATTENDING, label: tone === "casual" ? "I'll be there" : "Joyfully accepts" },
    ...(allowMaybe ? [{ key: RsvpStatus.MAYBE, label: "Not sure yet" }] : []),
    { key: RsvpStatus.NOT_ATTENDING, label: tone === "casual" ? "I can't make it" : "Regretfully declines" },
  ];

  if (isClosed) {
    return (
      <p className="mt-6 text-center text-base opacity-80">
        RSVP is closed. Please contact the hosts if your plans changed.
      </p>
    );
  }

  return (
    <form action={formAction} onSubmit={previewMode ? (event) => event.preventDefault() : undefined} className="mt-6 flex flex-col gap-5">
      {!guest && !token ? <input type="hidden" name="idempotencyKey" value={idempotencyKey} /> : null}
      {guest ? (
        <p className="text-center text-base opacity-80">
          Replying as {guest.firstName}
          {guest.lastName ? ` ${guest.lastName}` : ""}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-base">
            First name
            <input
              type="text"
              name="firstName"
              required
              maxLength={80}
              className="rounded-lg border px-4 py-3"
              style={controlStyle}
              aria-describedby={state.fieldErrors?.firstName ? "firstName-error" : undefined}
            />
            {state.fieldErrors?.firstName ? (
              <span id="firstName-error" className="text-sm" style={{ color: palette.accent }}>
                {state.fieldErrors.firstName}
              </span>
            ) : null}
          </label>
          <label className="flex flex-col gap-1.5 text-base">
            Last name
            <input
              type="text"
              name="lastName"
              maxLength={80}
              className="rounded-lg border px-4 py-3"
              style={controlStyle}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-base">
            Email
            <input
              type="email"
              name="email"
              className="rounded-lg border px-4 py-3"
              style={controlStyle}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-base">
            Phone
            <input
              type="tel"
              name="phone"
              className="rounded-lg border px-4 py-3"
              style={controlStyle}
            />
          </label>
        </div>
      )}

      <fieldset className="flex flex-col gap-3">
        <legend className="sr-only">Can you come?</legend>

        {choices.map((choice) => (
          <label
            key={choice.key}
            className="flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-base"
            style={{
              ...controlStyle,
              borderColor: status === choice.key ? palette.accent : `${palette.ink}33`,
            }}
          >
            <input
              type="radio"
              name="status"
              value={choice.key}
              checked={status === choice.key}
              onChange={() => setStatus(choice.key)}
              className="size-4"
              required
            />
            {choice.label}
          </label>
        ))}
      </fieldset>

      {status === RsvpStatus.ATTENDING ? (
        <>
          {allowPlusOnes && ceiling > 1 ? (
            <label className="flex flex-col gap-1.5 text-base">
              How many of you, including yourself?
              <input
                type="number"
                name="partySize"
                min={1}
                max={ceiling}
                value={partySize}
                onChange={(nativeEvent) =>
                  setPartySize(Number(nativeEvent.target.value) || 1)
                }
                className="rounded-lg border px-4 py-3"
                style={controlStyle}
              />
            </label>
          ) : (
            <input type="hidden" name="partySize" value={1} />
          )}

          {collectBreakdown && partySize > 1 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-base">
                Adults
                <input
                  type="number"
                  name="adults"
                  min={0}
                  max={partySize}
                  defaultValue={guest?.rsvp?.adults ?? partySize}
                  className="rounded-lg border px-4 py-3"
                  style={controlStyle}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-base">
                Children
                <input
                  type="number"
                  name="children"
                  min={0}
                  max={partySize}
                  defaultValue={guest?.rsvp?.children ?? 0}
                  className="rounded-lg border px-4 py-3"
                  style={controlStyle}
                />
              </label>
            </div>
          ) : null}

          {mealOptions.length > 0 ? (
            <label className="flex flex-col gap-1.5 text-base">
              What would you like to eat?
              <select
                name="mealChoice"
                defaultValue={guest?.rsvp?.mealChoice ?? ""}
                className="rounded-lg border px-4 py-3"
                style={controlStyle}
              >
                <option value="">No preference</option>
                {mealOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {collectDietary ? (
            <label className="flex flex-col gap-1.5 text-base">
              Anything we should know? (allergies, access)
              <input
                type="text"
                name="dietaryNotes"
                maxLength={1000}
                defaultValue={guest?.rsvp?.dietaryNotes ?? ""}
                className="rounded-lg border px-4 py-3"
                style={controlStyle}
              />
            </label>
          ) : null}
        </>
      ) : (
        <input type="hidden" name="partySize" value={1} />
      )}

      {collectMessage ? (
        <label className="flex flex-col gap-1.5 text-base">
          A note for the hosts
          <textarea
            name="message"
            rows={3}
            maxLength={2000}
            defaultValue={guest?.rsvp?.message ?? ""}
            className="rounded-lg border px-4 py-3"
            style={controlStyle}
          />
        </label>
      ) : null}

      {previewMode ? (
        <p className="text-center text-sm opacity-80">
          This preview does not send or change RSVP replies.
        </p>
      ) : null}

      {!previewMode ? <TurnstileWidget action="rsvp" /> : null}

      {state.message ? (
        <p role="alert" className="text-base" style={{ color: palette.accent }}>
          {state.message}
        </p>
      ) : null}

      <SubmitButton
        palette={palette}
        hasReplied={guest?.rsvp !== null && guest?.rsvp !== undefined}
        previewMode={previewMode}
        waitingForKey={!guest && !token && !idempotencyKey}
      />
    </form>
  );
}

function SubmitButton({
  palette,
  hasReplied,
  previewMode,
  waitingForKey,
}: {
  palette: ThemePalette;
  hasReplied: boolean;
  previewMode: boolean;
  waitingForKey: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || previewMode || waitingForKey}
      className="rounded-full px-6 py-3.5 text-base font-medium disabled:opacity-60"
      style={{ backgroundColor: palette.accent, color: palette.background }}
    >
      {previewMode ? "Preview only" : pending ? "Sending" : hasReplied ? "Update my reply" : "Send my reply"}
    </button>
  );
}
