"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { ThemePalette } from "@/lib/types";
import type { FormState } from "@/lib/form-state";
import { joinGuestList } from "./join-actions";
import { TurnstileWidget } from "@/app/_components/turnstile-widget";

const INITIAL: FormState = {};

export function JoinForm({ slug, palette }: { slug: string; palette: ThemePalette }) {
  const [state, formAction] = useActionState(joinGuestList.bind(null, slug), INITIAL);

  if (state.message === "added") {
    return (
      <p role="status" className="mt-8 text-center text-base">
        Thank you — you&rsquo;re on the list. Watch for your invitation.
      </p>
    );
  }

  const controlStyle = {
    backgroundColor: palette.surface,
    color: palette.ink,
    borderColor: `${palette.ink}33`,
  };

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-base">
        First name
        <input
          name="firstName"
          required
          maxLength={80}
          className="w-full min-w-0 rounded-lg border px-4 py-3"
          style={controlStyle}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-base">
        Last name
        <input
          name="lastName"
          maxLength={80}
          className="w-full min-w-0 rounded-lg border px-4 py-3"
          style={controlStyle}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-base">
        Phone number
        <input
          name="phone"
          type="tel"
          inputMode="tel"
          className="w-full min-w-0 rounded-lg border px-4 py-3"
          style={controlStyle}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-base">
        Email
        <input
          name="email"
          type="email"
          className="w-full min-w-0 rounded-lg border px-4 py-3"
          style={controlStyle}
        />
      </label>

      {state.message && state.message !== "added" ? (
        <p role="alert" className="text-sm text-ember">
          {state.message}
        </p>
      ) : null}

      <SubmitButton palette={palette} />
      <TurnstileWidget action="guest_join" />
    </form>
  );
}

function SubmitButton({ palette }: { palette: ThemePalette }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 cursor-pointer rounded-full px-6 py-3.5 text-base font-medium disabled:opacity-60"
      style={{ backgroundColor: palette.ink, color: palette.surface }}
    >
      {pending ? "One moment…" : "Add me to the list"}
    </button>
  );
}
