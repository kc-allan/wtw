import { EventModuleKey, EventTypeKey } from "@wtw/shared";
import type { EventDetail, EventModuleView, PublicEvent } from "@/lib/types";

export interface PageSectionLink {
  id: string;
  label: string;
  moduleKey?: EventModuleKey;
}

interface SectionInput {
  event: Pick<PublicEvent["event"], "description" | "startsAt" | "venueName" | "venueAddress" | "city" | "typeKey">;
  modules: EventModuleView[];
  ceremoniesCount: number;
  hasGallery: boolean;
  hasRegistry: boolean;
}

function read<T>(config: Record<string, unknown>, key: string): T | undefined {
  return config[key] as T | undefined;
}

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function hasModuleContent(
  module: EventModuleView,
  event: SectionInput["event"],
): boolean {
  switch (module.key) {
    case EventModuleKey.EVENT_DETAILS:
      return hasText(event.description) || hasText(read<string>(module.config, "description")) || hasText(read<string>(module.config, "hostedByLabel"));
    case EventModuleKey.COUNTDOWN: {
      const target = read<string>(module.config, "targetAt") ?? event.startsAt;
      const hideWhenPassed = read<boolean>(module.config, "hideWhenPassed") ?? true;
      return Boolean(target) && (!hideWhenPassed || new Date(target as string).getTime() >= Date.now());
    }
    case EventModuleKey.OUR_STORY:
      return (read<unknown[]>(module.config, "sections") ?? []).length > 0;
    case EventModuleKey.TIMELINE:
      return (read<unknown[]>(module.config, "entries") ?? []).length > 0;
    case EventModuleKey.VENUE_MAP: {
      const venues = read<unknown[]>(module.config, "venues") ?? [];
      return venues.length > 0 || hasText(event.venueName) || hasText(event.venueAddress) || hasText(event.city);
    }
    case EventModuleKey.DRESS_CODE:
      return hasText(read<string>(module.config, "title")) || hasText(read<string>(module.config, "description")) || (read<unknown[]>(module.config, "palette") ?? []).length > 0;
    case EventModuleKey.ACCOMMODATION:
      return (read<unknown[]>(module.config, "options") ?? []).length > 0;
    case EventModuleKey.FAQ:
      return (read<unknown[]>(module.config, "items") ?? []).length > 0;
    default:
      return false;
  }
}

const MODULE_SECTION_LABELS: Partial<Record<EventModuleKey, string>> = {
  [EventModuleKey.EVENT_DETAILS]: "Details",
  [EventModuleKey.OUR_STORY]: "Our Story",
  [EventModuleKey.TIMELINE]: "The day",
  [EventModuleKey.VENUE_MAP]: "Getting there",
  [EventModuleKey.DRESS_CODE]: "What to wear",
  [EventModuleKey.ACCOMMODATION]: "Staying over",
  [EventModuleKey.FAQ]: "Good to know",
  [EventModuleKey.COUNTDOWN]: "Countdown",
};

export function publicPageSections({
  event,
  modules,
  ceremoniesCount,
  hasGallery,
  hasRegistry,
}: SectionInput): PageSectionLink[] {
  const enabled = modules.filter((module) => module.enabled).sort((a, b) => a.position - b.position);
  const links: PageSectionLink[] = [{ id: "top", label: "Home" }];

  for (const module of enabled) {
    const label = MODULE_SECTION_LABELS[module.key];
    if (label && hasModuleContent(module, event)) {
      links.push({ id: module.key, label, moduleKey: module.key });
    }
  }

  if (enabled.some((module) => module.key === EventModuleKey.RSVP)) {
    links.push({ id: "rsvp", label: "RSVP", moduleKey: EventModuleKey.RSVP });
  }

  if (hasGallery) {
    links.push({ id: "moments", label: "Moments", moduleKey: EventModuleKey.GALLERY });
  }

  if (ceremoniesCount > 0) {
    links.push({ id: "ceremonies", label: "Venues" });
  }

  if (hasRegistry) {
    links.push({ id: "registry", label: "Registry", moduleKey: EventModuleKey.REGISTRY });
  }

  return links;
}

export function eventSurfaceLabel(event: Pick<EventDetail, "typeKey" | "modules">): "Invitation" | "Wedding website" {
  const websiteEnabled = event.modules.some((module) => module.key === EventModuleKey.WEBSITE && module.enabled);
  return event.typeKey === EventTypeKey.WEDDING && websiteEnabled ? "Wedding website" : "Invitation";
}
