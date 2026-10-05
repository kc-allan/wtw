"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { CeremonyKey, EventTypeKey, HostRole, isCeremonyKey, isHostRole } from "@wtw/shared";
import { api } from "./api";
import {
  clearDraft,
  draftEventTitle,
  draftHostNames,
  patchDraft,
  readDraft,
  writeDraft,
} from "./create-draft";
import { stepAfter } from "./create-flow";
import { optionalNumber, optionalText, toFormState, type FormState } from "./form-state";
import { readAccessToken } from "./session";
import { OTHER_CITY } from "./cities";
import type { EventDetail } from "./types";

const DEFAULT_TIMEZONE = "Africa/Nairobi";

function combineDateTime(date: FormDataEntryValue | null, time: FormDataEntryValue | null) {
  const dateText = optionalText(date);
  if (!dateText) return undefined;
  const timeText = optionalText(time) ?? "12:00";
  return `${dateText}T${timeText}:00`;
}

/**
 * Each step saves its own answer and hands over to whichever step comes next
 * for this event type, so the order lives in one place rather than in four
 * separate redirects.
 */
async function continueAfter(stepId: string, typeKey: EventTypeKey): Promise<never> {
  const signedIn = (await readAccessToken()) !== undefined;
  const next = stepAfter(typeKey, signedIn, stepId);
  if (next) redirect(next.href);
  return createEventFromDraft();
}

export async function saveEventBasics(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const typeKey = formData.get("typeKey");
  if (typeof typeKey !== "string" || !Object.values<string>(EventTypeKey).includes(typeKey)) {
    return { message: "Choose what you are celebrating" };
  }

  const fullName = optionalText(formData.get("fullName"));
  if (!fullName) {
    return { fieldErrors: { fullName: "Tell us your name" } };
  }

  // A host who ticked "we're still deciding" keeps no date at all, rather than
  // one we invented for them.
  const undecided = formData.get("dateUndecided") !== null;
  const startsAt = undecided
    ? undefined
    : combineDateTime(formData.get("startsAtDate"), formData.get("startsAtTime"));
  if (!undecided && !startsAt) {
    return { fieldErrors: { startsAtDate: "Pick a date, or say you are still deciding" } };
  }

  const city = optionalText(formData.get("city"));

  await writeDraft({
    typeKey: typeKey as EventTypeKey,
    fullName,
    partnerName: optionalText(formData.get("partnerName")),
    startsAt,
    timezone: optionalText(formData.get("timezone")) ?? DEFAULT_TIMEZONE,
    expectedGuests: optionalNumber(formData.get("expectedGuests")),
    city: city === OTHER_CITY ? optionalText(formData.get("otherCity")) : city,
    themeKey: optionalText(formData.get("themeKey")),
  });

  return continueAfter("type", typeKey as EventTypeKey);
}

/** Each card on the role step is its own submit, so choosing one moves on. */
export async function saveHostRole(formData: FormData): Promise<void> {
  const role = formData.get("hostRole");
  if (typeof role !== "string" || !isHostRole(role)) redirect("/create/who");

  const draft = await patchDraft({ hostRole: role as HostRole });
  if (!draft) redirect("/create");

  await continueAfter("role", draft.typeKey);
}

export async function saveCeremonies(formData: FormData): Promise<void> {
  const draft = await readDraft();
  if (!draft) redirect("/create");

  const ceremonies = formData
    .getAll("ceremonies")
    .filter((value): value is string => typeof value === "string")
    .filter(isCeremonyKey) as CeremonyKey[];

  await patchDraft({ ceremonies });
  await continueAfter("ceremonies", draft.typeKey);
}

/**
 * The end of the flow: everything gathered so far becomes a real event, and
 * the draft is dropped so a second visit starts clean.
 */
export async function createEventFromDraft(): Promise<never> {
  const draft = await readDraft();
  if (!draft) redirect("/create");

  let event: EventDetail;
  try {
    event = await api<EventDetail>("/events", {
      method: "POST",
      body: {
        typeKey: draft.typeKey,
        title: draftEventTitle(draft),
        ...(draft.startsAt ? { startsAt: draft.startsAt } : {}),
        timezone: draft.timezone ?? DEFAULT_TIMEZONE,
        hostNames: draftHostNames(draft),
        expectedGuests: draft.expectedGuests,
        city: draft.city,
        hostRole: draft.hostRole,
        ceremonies: draft.ceremonies ?? [],
        ...(draft.themeKey ? { themeKey: draft.themeKey } : {}),
      },
    });
  } catch {
    // The account exists by now, so the half-made event is the only casualty.
    redirect("/create?error=1");
  }

  await clearDraft();
  revalidatePath("/events");
  redirect(`/events/${event.id}`);
}
