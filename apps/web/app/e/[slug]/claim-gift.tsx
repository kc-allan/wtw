"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import type { RegistryItem, ThemePalette } from "@/lib/types";
import type { FormState } from "@/lib/form-state";
import { claimGift } from "./registry-actions";
import { TurnstileWidget } from "@/app/_components/turnstile-widget";

const INITIAL: FormState = {};

/**
 * Taking one gift off the list. The form stays closed until a guest wants it,
 * so a page of gifts is a page of gifts rather than a page of forms.
 */
export function ClaimGift({
  slug,
  token,
  item,
  remaining,
  palette,
}: {
  slug: string;
  token?: string;
  item: RegistryItem;
  remaining: number;
  palette: ThemePalette;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(
    claimGift.bind(null, slug, token ?? "", item.id),
    INITIAL,
  );

  if (remaining === 0) {
    return (
      <p className="text-sm" style={{ color: palette.muted }}>
        Someone has this one.
      </p>
    );
  }

  if (state.message === "claimed") {
    return (
      <p role="status" className="text-sm" style={{ color: palette.ink }}>
        Thank you — we have put your name against it.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-pointer rounded-full border px-5 py-2 text-base transition-opacity hover:opacity-80"
        style={{ borderColor: palette.ink, color: palette.ink }}
      >
        I&rsquo;ll bring this
      </button>
    );
  }

  const controlStyle = { borderColor: palette.accent, color: palette.ink };

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm" style={{ color: palette.muted }}>
        Your name
        <input
          name="guestName"
          required
          maxLength={120}
          className="rounded-lg border bg-transparent px-3 py-2 text-base"
          style={controlStyle}
        />
      </label>

      {remaining > 1 ? (
        <label className="flex flex-col gap-1 text-sm" style={{ color: palette.muted }}>
          How many
          <input
            type="number"
            name="quantity"
            min={1}
            max={remaining}
            defaultValue={1}
            className="rounded-lg border bg-transparent px-3 py-2 text-base"
            style={controlStyle}
          />
        </label>
      ) : (
        <input type="hidden" name="quantity" value={1} />
      )}

      {state.message && state.message !== "claimed" ? (
        <p role="alert" className="text-sm text-ember">
          {state.message}
        </p>
      ) : null}

      <div className="flex gap-2">
        <SubmitButton palette={palette} />
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="cursor-pointer rounded-full px-4 py-2 text-base"
          style={{ color: palette.muted }}
        >
          Cancel
        </button>
      </div>
      <TurnstileWidget action="registry_claim" />
    </form>
  );
}

function SubmitButton({ palette }: { palette: ThemePalette }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="cursor-pointer rounded-full px-5 py-2 text-base disabled:opacity-60"
      style={{ backgroundColor: palette.ink, color: palette.surface }}
    >
      {pending ? "One moment…" : "Confirm"}
    </button>
  );
}
