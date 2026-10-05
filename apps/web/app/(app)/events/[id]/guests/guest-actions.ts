"use server";

import { revalidatePath } from "next/cache";
import { CeremonyKey, InvitationChannel, isCeremonyKey } from "@wtw/shared";
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

export async function updateGuest(
  eventId: string,
  guestId: string,
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const firstName = text(formData.get("firstName"));
  if (!firstName) {
    return { fieldErrors: { firstName: "Add a first name" } };
  }

  try {
    await api(`/events/${eventId}/guests/${guestId}`, {
      method: "PATCH",
      body: {
        firstName,
        lastName: nullableText(formData.get("lastName")),
        email: nullableText(formData.get("email")),
        phone: nullableText(formData.get("phone")),
        groupLabel: nullableText(formData.get("groupLabel")),
        maxPartySize: Number(formData.get("maxPartySize")) || 1,
        notes: nullableText(formData.get("notes")),
      },
    });
  } catch (error) {
    return toFormState(error, "We could not save that guest");
  }

  revalidatePath(`/events/${eventId}/guests`);
  return {};
}

export async function removeGuest(eventId: string, guestId: string): Promise<void> {
  await api(`/events/${eventId}/guests/${guestId}`, { method: "DELETE" });
  revalidatePath(`/events/${eventId}/guests`);
}

export async function createGuestInvitationLink(
  eventId: string,
  guestId: string,
  regenerate: boolean,
): Promise<{ ok: boolean; link?: string; message?: string }> {
  try {
    const issued = await api<{ guestId: string; link: string | null }[]>(
      `/events/${eventId}/invitations/issue`,
      {
        method: "POST",
        body: {
          guestIds: [guestId],
          channel: InvitationChannel.LINK,
          regenerate,
        },
      },
    );
    const link = issued.find((entry) => entry.guestId === guestId)?.link;
    revalidatePath(`/events/${eventId}/guests`);
    if (!link) {
      return {
        ok: false,
        message: "This guest already has a private link. Replace it to create a new one.",
      };
    }
    return { ok: true, link };
  } catch {
    return { ok: false, message: "We could not create that link" };
  }
}

function text(value: FormDataEntryValue | null): string | undefined {
  const cleaned = typeof value === "string" ? value.trim() : "";
  return cleaned || undefined;
}

function nullableText(value: FormDataEntryValue | null): string | null {
  const cleaned = typeof value === "string" ? value.trim() : "";
  return cleaned || null;
}
