import { cookies } from "next/headers";
import { CeremonyKey, EVENT_TYPES, EventTypeKey, HostRole } from "@wtw/shared";

/**
 * What someone has told us before they have an account. It lives in an
 * httpOnly cookie rather than the database so an unfinished visit leaves
 * nothing behind: no orphan rows to expire, and no way to fill the events
 * table from outside. The trade is that a draft stays on one device.
 *
 * Nothing here is trusted on the way back in — it is re-validated on read and
 * again by the API, which owns every rule about what an event may contain.
 */
export interface CreateDraft {
  typeKey: EventTypeKey;
  /** The host's own name; it names their account as well as the event. */
  fullName: string;
  /** The other half of a couple, for the types that come in pairs. */
  partnerName?: string;
  /** Absent when the host said they are still deciding. */
  startsAt?: string;
  expectedGuests?: number;
  city?: string;
  hostRole?: HostRole;
  ceremonies?: CeremonyKey[];
  /** Carried from a template card on the marketing site, when that is the way in. */
  themeKey?: string;
}

const DRAFT_COOKIE = "wtw_draft";

/** Long enough to survive a distracted afternoon, short enough to be forgotten. */
const DRAFT_MAX_AGE = 24 * 60 * 60;

const DRAFT_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: DRAFT_MAX_AGE,
} as const;

function isEnumValue<T extends Record<string, string>>(
  values: T,
  value: unknown,
): value is T[keyof T] {
  return typeof value === "string" && Object.values<string>(values).includes(value);
}

const text = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() !== "" ? value : undefined;

function parse(raw: string): CreateDraft | null {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof value !== "object" || value === null) return null;

  const draft = value as Record<string, unknown>;
  const fullName = text(draft.fullName);
  if (!isEnumValue(EventTypeKey, draft.typeKey) || !fullName) return null;

  const ceremonies = Array.isArray(draft.ceremonies)
    ? draft.ceremonies.filter((key): key is CeremonyKey => isEnumValue(CeremonyKey, key))
    : undefined;

  return {
    typeKey: draft.typeKey,
    fullName,
    partnerName: text(draft.partnerName),
    startsAt: text(draft.startsAt),
    expectedGuests: typeof draft.expectedGuests === "number" ? draft.expectedGuests : undefined,
    city: text(draft.city),
    hostRole: isEnumValue(HostRole, draft.hostRole) ? draft.hostRole : undefined,
    ceremonies,
    themeKey: text(draft.themeKey),
  };
}

/**
 * Whose celebration it is, in the order they were given. The event page and
 * every invitation read from this.
 */
export function draftHostNames(draft: CreateDraft): string[] {
  return [draft.fullName, draft.partnerName].filter((name): name is string => Boolean(name));
}

/**
 * What the event is called. The form never asks — the design collects names
 * instead — so a couple becomes "Amina & Jayde" and everyone else gets their
 * own celebration named after them. The host can rename it afterwards.
 */
export function draftEventTitle(draft: CreateDraft): string {
  const names = draftHostNames(draft);
  if (names.length > 1) {
    return names.join(" & ");
  }
  return `${draft.fullName}'s ${EVENT_TYPES[draft.typeKey].name}`;
}

export async function readDraft(): Promise<CreateDraft | null> {
  const raw = (await cookies()).get(DRAFT_COOKIE)?.value;
  return raw ? parse(raw) : null;
}

/** Only callable from a route handler or server action, never a page render. */
export async function writeDraft(draft: CreateDraft): Promise<void> {
  (await cookies()).set(DRAFT_COOKIE, JSON.stringify(draft), DRAFT_COOKIE_OPTIONS);
}

/** Merges into the draft in place, for the steps that add one answer each. */
export async function patchDraft(patch: Partial<CreateDraft>): Promise<CreateDraft | null> {
  const current = await readDraft();
  if (!current) return null;
  const next = { ...current, ...patch };
  await writeDraft(next);
  return next;
}

export async function clearDraft(): Promise<void> {
  (await cookies()).delete(DRAFT_COOKIE);
}
