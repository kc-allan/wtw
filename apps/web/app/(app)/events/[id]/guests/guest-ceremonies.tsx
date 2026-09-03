"use client";

import { useState, useTransition } from "react";
import { CEREMONIES, CeremonyKey } from "@wtw/shared";
import type { Ceremony } from "@/lib/types";
import { setGuestCeremonies } from "./guest-actions";

/**
 * Which ceremonies one guest is asked to. Nothing ticked means all of them,
 * which is the state every guest starts in — a couple who invites everyone to
 * everything never has to open this.
 */
export function GuestCeremonies({
  eventId,
  guestId,
  guestName,
  ceremonies,
  selected,
}: {
  eventId: string;
  guestId: string;
  guestName: string;
  ceremonies: Ceremony[];
  selected: CeremonyKey[];
}) {
  const [keys, setKeys] = useState<CeremonyKey[]>(selected);
  const [pending, startTransition] = useTransition();

  const label =
    keys.length === 0
      ? "All ceremonies"
      : keys.length === 1
        ? CEREMONIES[keys[0]].name
        : `${keys.length} ceremonies`;

  function toggle(key: CeremonyKey, checked: boolean) {
    const next = checked ? [...keys, key] : keys.filter((existing) => existing !== key);
    setKeys(next);
    startTransition(async () => {
      await setGuestCeremonies(eventId, guestId, next);
    });
  }

  return (
    <details className="group relative">
      <summary className="cursor-pointer list-none text-base text-ink underline decoration-rule underline-offset-4">
        {pending ? "Saving…" : label}
      </summary>

      <div className="absolute top-full right-0 z-10 mt-2 w-[240px] rounded-xl border border-rule/60 bg-white p-4 shadow-lg">
        <fieldset>
          <legend className="text-sm text-ink/60">{guestName} is asked to</legend>

          <div className="mt-3 flex flex-col gap-2">
            {ceremonies.map((ceremony) => (
              <label key={ceremony.id} className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={keys.includes(ceremony.key)}
                  onChange={(nativeEvent) => toggle(ceremony.key, nativeEvent.target.checked)}
                  className="h-4 w-4 accent-forest"
                />
                <span className="text-base text-ink">{ceremony.name}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <p className="mt-3 text-sm text-ink/60">
          Leave every box clear to ask them to all of them.
        </p>
      </div>
    </details>
  );
}
