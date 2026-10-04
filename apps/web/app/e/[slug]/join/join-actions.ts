"use server";

import { api } from "@/lib/api";
import { optionalText, toFormState, type FormState } from "@/lib/form-state";

/** Puts someone on a host's guest list from the link they were sent. */
export async function joinGuestList(
  slug: string,
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const firstName = optionalText(formData.get("firstName"));
  if (!firstName) {
    return { message: "Tell us your first name" };
  }

  try {
    await api(`/e/${slug}/guest-list`, {
      method: "POST",
      auth: false,
      body: {
        firstName,
        lastName: optionalText(formData.get("lastName")),
        email: optionalText(formData.get("email")),
        phone: optionalText(formData.get("phone")),
      },
    });
  } catch (error) {
    return toFormState(error, "We could not add you to that list");
  }

  // Read by the form to swap itself for a thank you.
  return { message: "added" };
}
