"use client";

import { useState, useTransition } from "react";
import { setGuestListForm } from "@/lib/event-actions";

const ACTION =
  "block w-full rounded-full border border-forest px-5 py-3 text-center text-base text-forest transition-colors hover:bg-forest/5 disabled:opacity-60";

/**
 * The link a host shares so guests can add themselves. It stays closed until
 * they open it, because the address is as public as the event's own.
 */
export function CollectAddresses({
  eventId,
  href,
  enabled,
  published,
}: {
  eventId: string;
  href: string;
  enabled: boolean;
  published: boolean;
}) {
  const [isOpen, setIsOpen] = useState(enabled);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!published) {
    return (
      <span className="block w-full rounded-full border border-rule px-5 py-3 text-center text-base text-muted">
        Publish first
      </span>
    );
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await setGuestListForm(eventId, true);
            if (result.ok) setIsOpen(true);
          })
        }
        className={`${ACTION} cursor-pointer`}
      >
        {pending ? "One moment…" : "Open the form"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(href);
          setCopied(true);
        } catch {
          // Clipboard access can be refused; the link is on screen either way.
          setCopied(false);
        }
      }}
      className={`${ACTION} cursor-pointer`}
    >
      {copied ? "Link copied" : "Copy form link"}
    </button>
  );
}
