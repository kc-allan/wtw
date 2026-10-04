"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { findEvent } from "@/lib/find-event-actions";
import type { FormState } from "@/lib/form-state";

const INITIAL: FormState = {};

/**
 * A way back in for a guest who has lost their invitation. It resolves the
 * link or code they were sent; it does not search, so nobody's celebration
 * becomes findable by name.
 */
export function FindEvent() {
  const [state, formAction] = useActionState(findEvent, INITIAL);

  return (
    <section aria-labelledby="find-event" className="w-full px-6 py-10">
      <div className="mx-auto w-full max-w-[720px] text-center">
        <h2 id="find-event" className="text-2xl font-semibold text-ink">
          Been invited to something?
        </h2>
        <p className="mt-2 text-base text-ink/70">
          Paste the link you were sent, or type the code from it, and we&rsquo;ll take
          you straight there.
        </p>

        <form action={formAction} className="mx-auto mt-6 flex w-full max-w-[560px] gap-3">
          <label htmlFor="lookup" className="sr-only">
            Your invitation link or code
          </label>
          <input
            id="lookup"
            name="lookup"
            required
            placeholder="e.g., amina-and-brian"
            className="min-w-0 flex-1 rounded-full bg-white px-6 py-3.5 text-base text-ink outline-none placeholder:text-muted"
          />
          <SubmitButton />
        </form>

        {state.message ? (
          <p role="alert" className="mt-3 text-sm text-ember">
            {state.message}
          </p>
        ) : null}
      </div>
    </section>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="shrink-0 cursor-pointer rounded-full bg-forest px-7 py-3.5 text-base font-medium text-bright transition-colors hover:bg-forest-deep disabled:opacity-60"
    >
      {pending ? "Looking…" : "Find it"}
    </button>
  );
}
