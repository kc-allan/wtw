import type { Metadata } from "next";
import { EVENT_TYPES, ALL_EVENT_TYPE_KEYS, EventTypeKey } from "@wtw/shared";
import { api } from "@/lib/api";
import type { Theme } from "@/lib/types";
import { ButtonLink, PageHeading } from "@/app/_components/ui";
import { InvitationCard } from "@/app/_components/invitation-card";
import { TypeTabs } from "./type-tabs";

export const metadata: Metadata = {
  title: "Templates — Worth the Wait",
  description:
    "Browse every design, by celebration and by style. Preview one with your own names before you commit.",
};

/** Sample names so a browsing visitor sees a filled-in card, not a blank. */
const SAMPLE: Record<string, string[]> = {
  wedding: ["Amina & Brian"],
  birthday: ["Riuwa turns 6"],
  baby_shower: ["Baby Achieng'"],
  graduation: ["Wanjiru"],
  anniversary: ["Grace & Daniel"],
  bridal_shower: ["Nia"],
  corporate: ["End of Year"],
};

export default async function TemplatesPage({ searchParams }: PageProps<"/templates">) {
  const query = await searchParams;
  const requested = typeof query.type === "string" ? query.type : EventTypeKey.WEDDING;
  const eventType = ALL_EVENT_TYPE_KEYS.includes(requested as EventTypeKey)
    ? (requested as EventTypeKey)
    : EventTypeKey.WEDDING;

  const themes = await api<Theme[]>(`/themes?eventType=${eventType}`, {
    auth: false,
    revalidate: 3600,
  }).catch(() => [] as Theme[]);

  // Grouped the way the picker does, so browsing here matches building later.
  const groups = new Map<string, Theme[]>();
  for (const theme of themes) {
    groups.set(theme.group, [...(groups.get(theme.group) ?? []), theme]);
  }

  return (
    <section className="mx-auto flex w-full max-w-[1340px] flex-col gap-10 px-6 py-12">
      <PageHeading
        eyebrow="Templates"
        title="What are you celebrating?"
        lead="Choose your event, then browse the designs made for it. Every one previews with your own names once you start."
      />

      <TypeTabs active={eventType} />

      {themes.length === 0 ? (
        <p className="text-center text-base text-ink/70">
          Designs for {EVENT_TYPES[eventType].plural.toLowerCase()} are on the way.
        </p>
      ) : null}

      {[...groups.entries()].map(([group, entries]) => (
        <div key={group}>
          <h2 className="font-serif text-xl font-semibold text-black">{group}</h2>

          <ul className="mt-5 grid gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-4">
            {entries.map((theme) => (
              <li key={theme.key}>
                <InvitationCard
                  themeKey={theme.key}
                  group={theme.group}
                  eventTypeKey={eventType}
                  palette={theme.palette}
                  content={{
                    names: SAMPLE[eventType] ?? ["Your celebration"],
                    themeName: theme.name,
                    dateLabel: "14. 02. 2027",
                  }}
                  className="aspect-[266/356]"
                />
                <p className="mt-3 flex items-center gap-2 text-base text-black">
                  {theme.name}
                  {theme.isPremium ? (
                    <span className="rounded-full bg-sand px-2 py-0.5 text-xs text-clay">
                      Premium
                    </span>
                  ) : null}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="flex justify-center">
        <ButtonLink href="/create">Start with one of these</ButtonLink>
      </div>
    </section>
  );
}
