import type { Metadata } from "next";
import { EVENT_TYPES, ALL_EVENT_TYPE_KEYS, EventTypeKey } from "@wtw/shared";
import { api } from "@/lib/api";
import { viewerPlan } from "@/lib/viewer-plan";
import type { Theme } from "@/lib/types";
import { ButtonLink, PageHeading } from "@/app/_components/ui";
import { celebrationLead, collections } from "@/app/_data/invitation-copy";
import { InvitationBrowser, type BrowseSection, type SampleContent } from "./invitation-browser";
import { TypeTabs } from "./type-tabs";
import { hasDesignedTemplate } from "@/app/_data/templates";

export const metadata: Metadata = {
  title: "Invitations — Worth the Wait",
  description:
    "Beautiful digital invitations for every celebration. Choose a design, preview it with your own details, and make it yours.",
};

/** What a card reads before the visitor types their own details in. */
const SAMPLE: Record<string, SampleContent> = {
  wedding: { name: "Amina & Brian", dateLabel: "14. 02. 2027" },
  birthday: { name: "Riuwa", age: "6", dateLabel: "09. 05. 2027" },
  baby_shower: { name: "Baby Nia", dateLabel: "21. 03. 2027" },
  graduation: { name: "Wanjiru", dateLabel: "12. 11. 2027" },
  anniversary: { name: "Grace & Daniel", dateLabel: "06. 08. 2027" },
  bridal_shower: { name: "Nia", dateLabel: "18. 09. 2027" },
  corporate: { name: "End of Year", dateLabel: "05. 12. 2027" },
};

export default async function InvitationsPage({ searchParams }: PageProps<"/invitations">) {
  const query = await searchParams;
  const requested = typeof query.type === "string" ? query.type : EventTypeKey.WEDDING;
  const eventType = ALL_EVENT_TYPE_KEYS.includes(requested as EventTypeKey)
    ? (requested as EventTypeKey)
    : EventTypeKey.WEDDING;

  const [designs, plan] = await Promise.all([
    api<Theme[]>(`/themes?eventType=${eventType}`, {
      auth: false,
      revalidate: 3600,
    }).catch(() => [] as Theme[]),
    // Decides which designs this reader may actually use.
    viewerPlan(),
  ]);

  // Sections come from the collections, which decide both the order and which
  // of the catalogue's groups are gathered together. Anything seeded into a
  // group no collection claims still gets a section, so nothing goes missing.
  const byGroup = new Map<string, Theme[]>();
  for (const design of designs) {
    byGroup.set(design.group, [...(byGroup.get(design.group) ?? []), design]);
  }

  const sections: BrowseSection[] = [];
  const claimed = new Set<string>();

  for (const collection of collections[eventType] ?? []) {
    const gathered = collection.groups.flatMap((group) => {
      claimed.add(group);
      return byGroup.get(group) ?? [];
    });
    if (gathered.length > 0) {
      sections.push({
        collection,
        designs: gathered.sort(
          (first, second) => Number(hasDesignedTemplate(second.key)) - Number(hasDesignedTemplate(first.key)),
        ),
      });
    }
  }

  for (const [group, entries] of byGroup) {
    if (!claimed.has(group)) {
      sections.push({
        collection: { title: group, intro: "", groups: [group] },
        designs: entries.sort(
          (first, second) => Number(hasDesignedTemplate(second.key)) - Number(hasDesignedTemplate(first.key)),
        ),
      });
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-335 flex-col gap-10 px-6 py-12">
      <PageHeading
        eyebrow="Invitations"
        title="Invitations made for your celebration"
        lead={celebrationLead[eventType]}
      />

      <TypeTabs active={eventType} />

      {designs.length === 0 ? (
        <p className="text-center text-base text-ink/70">
          Designs for {EVENT_TYPES[eventType].plural.toLowerCase()} are on the way.
        </p>
      ) : (
        <InvitationBrowser
          eventTypeKey={eventType}
          sections={sections}
          sample={SAMPLE[eventType] ?? { name: "Your celebration", dateLabel: "14. 02. 2027" }}
          viewerPlan={plan}
        />
      )}

      <div className="flex flex-col items-center gap-3 text-center">
        <h2 className="font-serif text-section font-semibold text-black">
          Found your favourite? Make it yours.
        </h2>
        <p className="max-w-140 text-base tracking-[0.02em] text-ink/70">
          Choose your design, add your details and create an invitation made for your
          celebration.
        </p>
        <ButtonLink href="/create" className="mt-2">
          Create Your Invitation
        </ButtonLink>
      </div>
    </section>
  );
}
