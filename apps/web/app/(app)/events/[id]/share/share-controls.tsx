"use client";

import { useActionState, useState, useTransition } from "react";
import { EventVisibility } from "@wtw/shared";
import { Button } from "@/app/_components/ui";
import { TurnstileWidget } from "@/app/_components/turnstile-widget";
import { type FormState } from "@/lib/form-state";
import { unpublishEvent, updateEventVisibility } from "@/lib/event-actions";

const INITIAL: FormState = {};

const VISIBILITY_COPY: Record<EventVisibility, string> = {
  [EventVisibility.PRIVATE]: "Only personal invitation links can open it. The shared event link asks guests to use their invite.",
  [EventVisibility.PUBLIC]: "Anyone with the link can open it, and search engines may list it.",
};

export function ShareControls({
  eventId,
  visibility,
  visibilityReviewPending,
}: {
  eventId: string;
  visibility: EventVisibility;
  visibilityReviewPending: boolean;
}) {
  const [selected, setSelected] = useState(visibility);
  const [state, action, pending] = useActionState(
    updateEventVisibility.bind(null, eventId),
    INITIAL,
  );
  const [unpublishPending, startUnpublish] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="rounded-2xl bg-white p-6 sm:p-8">
      {visibilityReviewPending ? (
        <p className="mb-5 rounded-xl bg-ivory px-4 py-3 text-base text-ink/80" role="status">
          This event is now private. Review who can open it below. You can make it public if you want anyone with the link to view and RSVP.
        </p>
      ) : null}
      <h2 className="font-serif text-xl text-ink/70">Who can open it</h2>
      <p className="mt-3 text-base text-ink/70">{VISIBILITY_COPY[selected]}</p>

      <form action={action} className="mt-5 flex flex-col gap-4">
        <TurnstileWidget action="event_update" />
        <fieldset className="flex flex-col gap-3">
          <legend className="sr-only">Visibility</legend>
          {Object.values(EventVisibility).map((value) => (
            <label key={value} className="flex cursor-pointer gap-3 rounded-xl border border-rule px-4 py-3 text-base text-ink">
              <input
                type="radio"
                name="visibility"
                value={value}
                checked={selected === value}
                onChange={() => setSelected(value)}
                className="mt-1 size-4 accent-forest"
              />
              <span>
                <span className="block font-medium capitalize">{value}</span>
                <span className="block text-sm text-ink/60">{VISIBILITY_COPY[value]}</span>
              </span>
            </label>
          ))}
        </fieldset>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={pending} variant="ghost">
            {pending ? "Saving" : "Save visibility"}
          </Button>
          {state.message ? (
            <p role="status" className={`text-sm ${state.message === "Saved" ? "text-success" : "text-ember"}`}>
              {state.message}
            </p>
          ) : null}
        </div>
      </form>

      <div className="mt-8 border-t border-rule/50 pt-6">
        <TurnstileWidget action="event_unpublish" />
        <h3 className="text-base font-semibold text-black">Pause sharing</h3>
        <p className="mt-2 text-base text-ink/70">
          Unpublish if you need to withdraw the invitation while you make changes. You can publish it again later.
        </p>
        {error ? <p role="alert" className="mt-3 text-sm text-ember">{error}</p> : null}
        <Button
          type="button"
          variant="quiet"
          disabled={unpublishPending}
          className="mt-4"
          onClick={() => {
            setError(null);
            startUnpublish(async () => {
              try {
                await unpublishEvent(eventId);
              } catch (thrown) {
                if (thrown instanceof Error && thrown.message.includes("NEXT_REDIRECT")) {
                  throw thrown;
                }
                setError("We could not unpublish that just now. Try again.");
              }
            });
          }}
        >
          {unpublishPending ? "Unpublishing" : "Unpublish event"}
        </Button>
      </div>
    </div>
  );
}
