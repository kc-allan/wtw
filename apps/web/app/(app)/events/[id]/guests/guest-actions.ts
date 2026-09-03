"use server";

import { revalidatePath } from "next/cache";
import { CeremonyKey, isCeremonyKey } from "@wtw/shared";
import { api } from "@/lib/api";
import { toFormState, type FormState } from "@/lib/form-state";

/**
 * Splits a pasted list into guests. One per line, with an optional group after
 * a comma — the shape people already have in a notes app or a spreadsheet
 * column, so a host is not made to retype 180 names into a form.
 */
function parseGuestLines(raw: string) {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [namePart, groupPart] = line.split(",").map((part) => part.trim());
      const [firstName, ...rest] = namePart.split(/\s+/);
      return {
        firstName,
        ...(rest.length > 0 ? { lastName: rest.join(" ") } : {}),
        ...(groupPart ? { groupLabel: groupPart } : {}),
      };
    })
    .filter((guest) => guest.firstName);
}

export async function addGuests(
  eventId: string,
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const raw = formData.get("guests");
  const guests = parseGuestLines(typeof raw === "string" ? raw : "");

  if (guests.length === 0) {
    return { message: "Add at least one name" };
  }
  if (guests.length > 500) {
    return { message: "Add up to 500 guests at a time" };
  }

  try {
    await api(`/events/${eventId}/guests/bulk`, { method: "POST", body: { guests } });
  } catch (error) {
    return toFormState(error, "We could not add those guests");
  }

  revalidatePath(`/events/${eventId}/guests`);
  return {};
}

/**
 * Sets which ceremonies one guest is asked to. An empty list means all of
 * them, which is what a guest starts out as.
 */
export async function setGuestCeremonies(
  eventId: string,
  guestId: string,
  keys: CeremonyKey[],
): Promise<{ ok: boolean; message?: string }> {
  try {
    await api(`/events/${eventId}/guests/${guestId}`, {
      method: "PATCH",
      body: { ceremonyKeys: keys.filter(isCeremonyKey) },
    });
  } catch {
    return { ok: false, message: "We could not save that" };
  }

  revalidatePath(`/events/${eventId}/guests`);
  return { ok: true };
}
