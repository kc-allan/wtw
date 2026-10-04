"use client";

import Link from "next/link";
import { EVENT_TYPES, ALL_EVENT_TYPE_KEYS, type EventTypeKey } from "@wtw/shared";

/** Which celebration's designs are showing. Kept in the URL so it is linkable. */
export function TypeTabs({ active }: { active: EventTypeKey }) {
  return (
    <div className="flex flex-wrap justify-center gap-3" role="group" aria-label="Celebration">
      {ALL_EVENT_TYPE_KEYS.map((key) => {
        const isActive = key === active;
        return (
          <Link
            key={key}
            href={`/templates?type=${key}`}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-full px-6 py-2.5 text-base whitespace-nowrap transition-colors ${
              isActive ? "bg-forest text-bright" : "bg-white text-ink hover:bg-ivory"
            }`}
          >
            {EVENT_TYPES[key].plural}
          </Link>
        );
      })}
    </div>
  );
}
