"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { PLANS, PLAN_WITH_PREMIUM_DESIGNS, PlanKey, planIncludesPremiumDesigns } from "@wtw/shared";
import type { Theme } from "@/lib/types";
import { InvitationCard, nameLines } from "@/app/_components/invitation-card";
import { designCopy, type Collection } from "@/app/_data/invitation-copy";
import { invitationDesign } from "@/lib/invitation-designs";

export interface BrowseSection {
  collection: Collection;
  designs: Theme[];
}

/** What a card shows before anyone has typed anything of their own. */
export interface SampleContent {
  /** Placeholder for the name field, and the name the cards start with. */
  name: string;
  /** Birthdays pair a name with an age; everything else leaves this out. */
  age?: string;
  dateLabel: string;
}

export function InvitationBrowser({
  eventTypeKey,
  sections,
  sample,
  viewerPlan,
}: {
  eventTypeKey: string;
  sections: BrowseSection[];
  sample: SampleContent;
  /** Decides which designs this reader may actually use. */
  viewerPlan: PlanKey;
}) {
  const hasPremium = planIncludesPremiumDesigns(viewerPlan);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const nameFieldId = useId();
  const ageFieldId = useId();

  const names = previewNames(sample, name, age);

  return (
    <>
      <div className="flex flex-col items-center rounded-2xl px-6">
        {/* <p className="text-base tracking-[0.02em] text-ink/70">
          See every design with your own details on it.
        </p> */}
        <div className="flex w-full max-w-130 flex-wrap items-end justify-center gap-3">
          <div className="flex min-w-50 flex-1 flex-col gap-1.5">
            <label htmlFor={nameFieldId} className="text-sm text-center font-medium text-black">
              Who is celebrating?
            </label>
            <input
              id={nameFieldId}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={sample.name}
              autoComplete="off"
              className="w-full rounded-full border border-rule bg-white px-5 py-3 text-base text-ink outline-offset-2 placeholder:text-ink/40"
            />
          </div>

          {sample.age ? (
            <div className="flex w-27 flex-col gap-1.5">
              <label htmlFor={ageFieldId} className="text-sm font-medium text-black">
                Turning
              </label>
              <input
                id={ageFieldId}
                value={age}
                onChange={(event) => setAge(event.target.value.replace(/\D/g, "").slice(0, 3))}
                placeholder={sample.age}
                inputMode="numeric"
                autoComplete="off"
                className="w-full rounded-full border border-rule bg-white px-5 py-3 text-base text-ink outline-offset-2 placeholder:text-ink/40"
              />
            </div>
          ) : null}
        </div>
      </div>

      {sections.map((section) => (
        <BrowseCollection
          key={section.collection.title}
          section={section}
          eventTypeKey={eventTypeKey}
          names={names}
          dateLabel={sample.dateLabel}
          hasPremium={hasPremium}
        />
      ))}
    </>
  );
}

function BrowseCollection({
  section,
  eventTypeKey,
  names,
  dateLabel,
  hasPremium,
}: {
  section: BrowseSection;
  eventTypeKey: string;
  names: string[];
  dateLabel: string;
  /** Whether this reader's plan includes the designs kept for paying hosts. */
  hasPremium: boolean;
}) {
  const { collection, designs } = section;
  const [filter, setFilter] = useState(collection.filters?.[0].id ?? "all");

  const activeFilter = collection.filters?.find((option) => option.id === filter);
  const visible = activeFilter?.group
    ? designs.filter((design) => design.group === activeFilter.group)
    : designs;

  return (
    <section className="flex flex-col gap-5">
      <header className="flex flex-col gap-2">
        <h2 className="font-serif text-xl font-semibold text-black">{collection.title}</h2>
        <p className="max-w-160 text-base tracking-[0.02em] text-ink/70">
          {collection.intro}
        </p>
      </header>

      {collection.filters ? (
        <div className="flex flex-wrap gap-2" role="group" aria-label={collection.title}>
          {collection.filters.map((option) => {
            const isActive = option.id === filter;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => setFilter(option.id)}
                className={`rounded-full px-4 py-2 text-base whitespace-nowrap transition-colors ${
                  isActive ? "bg-forest text-bright" : "bg-white text-ink hover:bg-ivory"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      ) : null}

      <ul className="grid gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-4">
        {visible.map((design) => {
          const copy = designCopy[design.key];
          return (
            <li key={design.key} className="flex h-full flex-col">
              <div className="relative">
                {design.isPremium ? <PlanStar plan={PLAN_WITH_PREMIUM_DESIGNS} /> : null}
                <div className={design.isPremium && !hasPremium ? "opacity-55" : undefined}>
              <InvitationCard
                themeKey={design.key}
                group={design.group}
                eventTypeKey={eventTypeKey}
                palette={design.palette}
                content={{ names, themeName: design.name, dateLabel }}
                // The name sits under the card, so the artwork carries the date.
                footer="date"
                className="aspect-266/356"
              />
                </div>
              </div>

              <p className="mt-3 text-base font-medium text-black">{design.name}</p>
              {invitationDesign(design.key) ? <Link href={`/designs/${invitationDesign(design.key)!.kind}`} className="mt-2 text-sm font-medium text-forest underline underline-offset-4">Preview invitation page</Link> : null}

              {copy ? (
                <>
                  <p className="mt-1 text-sm tracking-[0.02em] text-gold">
                    {copy.descriptors.join(" • ")}
                  </p>
                  <p className="mt-1 text-sm tracking-[0.02em] text-ink/70">
                    {copy.description}
                  </p>
                </>
              ) : null}

              {/* Descriptions run to different lengths, so the action is
                  pushed to the foot of the cell and the row stays level. */}
              <div className="mt-auto pt-2">
                {design.isPremium && !hasPremium ? (
                  <p className="flex flex-wrap items-center gap-1.5 text-sm">
                    <LockIcon />
                    <span className="text-ink/70">
                      Included with the {PLANS[PLAN_WITH_PREMIUM_DESIGNS].name} plan
                    </span>
                    <Link
                      href="/plans"
                      className="font-medium text-ember underline underline-offset-4"
                    >
                      Upgrade
                      <span className="sr-only"> to use {design.name}</span>
                    </Link>
                  </p>
                ) : (
                  <Link
                    href={`/create?template=${design.key}`}
                    className="self-start text-sm font-medium text-forest underline underline-offset-4"
                  >
                    Personalise this invitation
                    <span className="sr-only">: {design.name}</span>
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/**
 * The mark on a design kept for paying hosts. Its colour names the plan that
 * includes it, so a catalogue spanning several tiers stays readable at a
 * glance; today every paid design belongs to the same one.
 */
const PLAN_STAR: Record<PlanKey, string> = {
  [PlanKey.FREE]: "text-rule",
  [PlanKey.CELEBRATION]: "text-gold",
  [PlanKey.PROFESSIONAL]: "text-forest",
};

function PlanStar({ plan }: { plan: PlanKey }) {
  return (
    <span
      className="absolute top-3 right-3 z-10 grid size-8 place-items-center rounded-full bg-white/90 shadow-sm"
      title={`Included with the ${PLANS[plan].name} plan`}
    >
      <svg viewBox="0 0 24 24" className={`h-4.5 w-4.5 ${PLAN_STAR[plan]}`} aria-hidden>
        <path
          fill="currentColor"
          d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9L12 3.5Z"
        />
      </svg>
    </span>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 text-ink/60" fill="none" aria-hidden>
      <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 10V7.5a4 4 0 0 1 8 0V10" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

/** What the cards read, once whatever the visitor has typed is folded in. */
function previewNames(sample: SampleContent, name: string, age: string): string[] {
  const typed = name.trim();

  if (sample.age !== undefined) {
    const who = typed || sample.name;
    const turning = age.trim() || sample.age;
    return [`${who} turns ${turning}`];
  }

  const parts = (typed || sample.name)
    .split("&")
    .map((part) => part.trim())
    .filter(Boolean);

  return nameLines(parts, sample.name);
}
