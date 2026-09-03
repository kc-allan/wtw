"use client";

import { useState, useTransition } from "react";
import { Button } from "@/app/_components/ui";
import { publishEvent } from "@/lib/event-actions";
import { SITE_ORIGIN } from "@/lib/site";

export function PublishPanel({
  eventId,
  slug,
  blocked,
}: {
  eventId: string;
  slug: string;
  blocked: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mt-8 border-t border-rule/50 pt-6">
      <p className="text-base text-ink/70">Your guests will open</p>
      <p className="mt-1 text-base break-all text-forest">
        {SITE_ORIGIN}/e/{slug}
      </p>

      {error ? (
        <p role="alert" className="mt-4 text-sm text-ember">
          {error}
        </p>
      ) : null}

      <Button
        type="button"
        disabled={blocked || pending}
        className="mt-6"
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              await publishEvent(eventId);
            } catch (thrown) {
              // A redirect throws by design; only real failures land here.
              if (thrown instanceof Error && thrown.message.includes("NEXT_REDIRECT")) {
                throw thrown;
              }
              setError("We could not publish that just yet. Try again.");
            }
          });
        }}
      >
        {pending ? "Publishing…" : "Publish event"}
      </Button>

      {blocked ? (
        <p className="mt-3 text-sm text-ink/70">
          Finish the items above first.
        </p>
      ) : null}
    </div>
  );
}
