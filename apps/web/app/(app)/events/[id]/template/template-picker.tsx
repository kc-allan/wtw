"use client";

import { useMemo, useState, useTransition } from "react";
import { InvitationCard, nameLines } from "@/app/_components/invitation-card";
import { hasDesignedTemplate } from "@/app/_data/templates";
import { chooseTheme } from "@/lib/event-actions";
import { formatEventDate } from "@/lib/event-display";
import type { EventDetail, Theme } from "@/lib/types";

const ALL = "All styles";

export function TemplatePicker({ event, themes }: { event: EventDetail; themes: Theme[] }) {
  const [group, setGroup] = useState(ALL);
  const [pending, startTransition] = useTransition();
  const [choosing, setChoosing] = useState<string | null>(null);

  const groups = useMemo(
    () => [ALL, ...Array.from(new Set(themes.map((theme) => theme.group)))],
    [themes],
  );

  const visible = group === ALL ? themes : themes.filter((theme) => theme.group === group);

  const names = nameLines(event.hostNames, event.title);
  const dateLabel = formatEventDate(event.startsAt, event.timezone, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).replaceAll("/", ". ");

  return (
    <div className="mt-8">
      <div className="flex flex-wrap gap-3" role="group" aria-label="Filter by style">
        {groups.map((name) => {
          const isActive = name === group;
          return (
            <button
              key={name}
              type="button"
              aria-pressed={isActive}
              onClick={() => setGroup(name)}
              className={`rounded-full px-6 py-2.5 text-base whitespace-nowrap transition-colors ${
                isActive ? "bg-forest text-bright" : "bg-white text-ink hover:bg-ivory"
              }`}
            >
              {name}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="mt-10 text-base text-ink/70">
          No designs for this style yet. Try another one.
        </p>
      ) : null}

      <ul className="mt-8 grid gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-4">
        {visible.map((theme) => {
          const isChosen = event.theme?.key === theme.key;
          const isBusy = choosing === theme.key && pending;

          return (
            <li key={theme.key}>
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  setChoosing(theme.key);
                  startTransition(async () => {
                    await chooseTheme(event.id, theme.key);
                  });
                }}
                className={`group w-full text-start outline-offset-4 disabled:cursor-wait ${
                  isChosen ? "" : ""
                }`}
                aria-current={isChosen ? "true" : undefined}
              >
                <InvitationCard
                  themeKey={theme.key}
                  group={theme.group}
                  eventTypeKey={event.typeKey}
                  palette={theme.palette}
                  content={{ names, themeName: theme.name, dateLabel }}
                  className={`aspect-[266/356] transition-[outline] ${
                    isChosen
                      ? "outline outline-2 outline-offset-2 outline-forest"
                      : "group-hover:outline group-hover:outline-2 group-hover:outline-offset-2 group-hover:outline-rule"
                  } ${isBusy ? "opacity-70" : ""}`}
                />

                <p className="mt-3 flex items-center gap-2 text-base text-black">
                  {theme.name}
                  {theme.isPremium ? (
                    <span className="rounded-full bg-sand px-2 py-0.5 text-xs text-clay">
                      Premium
                    </span>
                  ) : null}
                </p>
                <p className="text-base text-ink/60">
                  {theme.group}
                  {/* Honest about which sets have artwork of their own. */}
                  {hasDesignedTemplate(theme.key) ? "" : " · standard layout"}
                </p>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
