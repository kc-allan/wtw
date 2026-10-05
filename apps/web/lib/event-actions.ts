"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { EventModuleKey, EventTypeKey, EventVisibility } from "@wtw/shared";
import { api, ApiError } from "./api";
import { optionalNumber, optionalText, toFormState, type FormState } from "./form-state";
import type { EventDetail } from "./types";

function nullableText(value: FormDataEntryValue | null): string | null {
  const text = typeof value === "string" ? value.trim() : "";
  return text || null;
}

function nullableDateTime(formData: FormData): string | null {
  if (formData.get("dateUndecided") !== null) return null;
  const date = optionalText(formData.get("startsAtDate"));
  if (!date) return null;
  const time = optionalText(formData.get("startsAtTime")) ?? "12:00";
  return `${date}T${time}:00`;
}

export async function createEvent(_state: FormState, formData: FormData): Promise<FormState> {
  const typeKey = formData.get("typeKey");
  if (typeof typeKey !== "string" || !Object.values(EventTypeKey).includes(typeKey as EventTypeKey)) {
    return { message: "Choose what you are celebrating" };
  }

  let event: EventDetail;
  try {
    event = await api<EventDetail>("/events", {
      method: "POST",
      body: {
        typeKey,
        title: formData.get("title"),
        startsAt: formData.get("startsAt"),
        expectedGuests: optionalNumber(formData.get("expectedGuests")),
        city: optionalText(formData.get("city")),
      },
    });
  } catch (error) {
    return toFormState(error, "We could not create that event");
  }

  revalidatePath("/events");
  redirect(`/events/${event.id}/template`);
}

export async function chooseTheme(eventId: string, themeKey: string): Promise<void> {
  await api(`/events/${eventId}`, { method: "PATCH", body: { themeKey } });
  revalidatePath(`/events/${eventId}`, "layout");
  redirect(`/events/${eventId}/customize`);
}

export async function saveEventDetails(
  eventId: string,
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const hostNames = [formData.get("partner1"), formData.get("partner2")]
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter(Boolean);

  try {
    await api(`/events/${eventId}`, {
      method: "PATCH",
      body: {
        ...(hostNames.length > 0 ? { hostNames } : {}),
        ...(optionalText(formData.get("title")) ? { title: formData.get("title") } : {}),
        ...(optionalText(formData.get("themeKey")) ? { themeKey: formData.get("themeKey") } : {}),
        startsAt: nullableDateTime(formData),
        timezone: optionalText(formData.get("timezone")) ?? "Africa/Nairobi",
        venueName: nullableText(formData.get("venueName")),
        venueAddress: nullableText(formData.get("venueAddress")),
        city: nullableText(formData.get("city")),
        description: nullableText(formData.get("description")),
      },
    });
  } catch (error) {
    return toFormState(error, "We could not save those changes");
  }

  revalidatePath(`/events/${eventId}`, "layout");
  return { message: "Saved" };
}

/** Switches one website section on or off from the customize panel. */
export async function toggleModule(
  eventId: string,
  moduleKey: EventModuleKey,
  enabled: boolean,
): Promise<{ ok: boolean; message?: string }> {
  try {
    await api(`/events/${eventId}/modules/${moduleKey}`, {
      method: "PATCH",
      body: { enabled },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, message: error.message };
    }
    throw error;
  }

  revalidatePath(`/events/${eventId}`, "layout");
  return { ok: true };
}

export async function publishEvent(eventId: string): Promise<void> {
  await api(`/events/${eventId}/publish`, { method: "POST" });
  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`, "layout");
  redirect(`/events/${eventId}/share`);
}

export async function unpublishEvent(eventId: string): Promise<void> {
  await api(`/events/${eventId}/unpublish`, { method: "POST" });
  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`, "layout");
  redirect(`/events/${eventId}`);
}

export async function updateEventVisibility(
  eventId: string,
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const visibility = formData.get("visibility");
  if (typeof visibility !== "string" || !Object.values(EventVisibility).includes(visibility as EventVisibility)) {
    return { message: "Choose who can open the link" };
  }

  try {
    await api(`/events/${eventId}`, {
      method: "PATCH",
      body: { visibility },
    });
  } catch (error) {
    return toFormState(error, "We could not save that setting");
  }

  revalidatePath(`/events/${eventId}`, "layout");
  return { message: "Saved" };
}

/** Opens or closes the link that lets guests add themselves to the list. */
export async function setGuestListForm(
  eventId: string,
  enabled: boolean,
): Promise<{ ok: boolean; message?: string }> {
  try {
    await api(`/events/${eventId}`, {
      method: "PATCH",
      body: { guestListFormEnabled: enabled },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, message: error.message };
    }
    throw error;
  }

  revalidatePath(`/events/${eventId}`, "layout");
  return { ok: true };
}
