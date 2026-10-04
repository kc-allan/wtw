"use server";

import { revalidatePath } from "next/cache";
import { RsvpStatus } from "@wtw/shared";
import { api } from "@/lib/api";
import { toFormState, type FormState } from "@/lib/form-state";

export interface RsvpState extends FormState {
  status?: "sent";
}

export async function submitRsvp(
  slug: string,
  token: string,
  _state: RsvpState,
  formData: FormData,
): Promise<RsvpState> {
  const status = formData.get("status");
  if (typeof status !== "string" || !Object.values(RsvpStatus).includes(status as RsvpStatus)) {
    return { message: "Let us know whether you can make it" };
  }

  const attending = status === RsvpStatus.ATTENDING;
  const partySize = Number(formData.get("partySize"));
  const adults = Number(formData.get("adults"));
  const children = Number(formData.get("children"));
  const hasBreakdown =
    formData.get("adults") !== null &&
    formData.get("children") !== null &&
    Number.isFinite(adults) &&
    Number.isFinite(children);

  try {
    await api(`/e/${slug}/rsvp?t=${encodeURIComponent(token)}`, {
      method: "POST",
      auth: false,
      body: {
        status,
        // Only meaningful for a yes; the API zeroes it for anything else.
        partySize: attending && Number.isFinite(partySize) ? partySize : 1,
        ...(attending && hasBreakdown ? { adults, children } : {}),
        ...(formData.get("mealChoice") ? { mealChoice: formData.get("mealChoice") } : {}),
        ...(formData.get("dietaryNotes") ? { dietaryNotes: formData.get("dietaryNotes") } : {}),
        ...(formData.get("message") ? { message: formData.get("message") } : {}),
      },
    });
  } catch (error) {
    return toFormState(error, "We could not record that reply");
  }

  revalidatePath(`/e/${slug}`);
  return { status: "sent" };
}
