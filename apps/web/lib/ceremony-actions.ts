"use server";

import { revalidatePath } from "next/cache";
import { CeremonyKey, isCeremonyKey } from "@wtw/shared";
import { api } from "./api";
import { optionalText, toFormState, type FormState } from "./form-state";
import type { Ceremony } from "./types";

/** Adds or removes ceremonies from the whole set, keeping the ones held on to. */
export async function setCeremonies(
  eventId: string,
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const keys = formData
    .getAll("ceremonies")
    .filter((value): value is string => typeof value === "string")
    .filter(isCeremonyKey) as CeremonyKey[];

  try {
    await api<Ceremony[]>(`/events/${eventId}/ceremonies`, {
      method: "PUT",
      body: { keys },
    });
  } catch (error) {
    return toFormState(error, "We could not save those ceremonies");
  }

  revalidatePath(`/events/${eventId}`, "layout");
  return {};
}

export async function saveCeremonyDetails(
  eventId: string,
  ceremonyId: string,
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const startsAt = optionalText(formData.get("startsAt"));

  try {
    await api<Ceremony>(`/events/${eventId}/ceremonies/${ceremonyId}`, {
      method: "PATCH",
      body: {
        name: optionalText(formData.get("name")),
        // An emptied field clears the value rather than leaving the old one.
        startsAt: startsAt ?? null,
        venueName: optionalText(formData.get("venueName")) ?? null,
        city: optionalText(formData.get("city")) ?? null,
        dressCode: optionalText(formData.get("dressCode")) ?? null,
        description: optionalText(formData.get("description")) ?? null,
      },
    });
  } catch (error) {
    return toFormState(error, "We could not save that ceremony");
  }

  revalidatePath(`/events/${eventId}`, "layout");
  return { message: "Saved" };
}

/** Each ceremony picks from the same catalogue the event itself picks from. */
export async function chooseCeremonyTheme(
  eventId: string,
  ceremonyId: string,
  themeKey: string | null,
): Promise<void> {
  await api(`/events/${eventId}/ceremonies/${ceremonyId}`, {
    method: "PATCH",
    body: { themeKey },
  });
  revalidatePath(`/events/${eventId}`, "layout");
}
