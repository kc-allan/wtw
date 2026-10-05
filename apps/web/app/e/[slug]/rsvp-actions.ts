"use server";

import { revalidatePath } from "next/cache";
import { RsvpStatus } from "@wtw/shared";
import { api } from "@/lib/api";
import { SITE_ORIGIN } from "@/lib/site";
import { toFormState, type FormState } from "@/lib/form-state";

export interface RsvpState extends FormState {
  status?: "sent";
  returnUrl?: string;
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

  const firstName = formData.get("firstName");
  if (!token && (typeof firstName !== "string" || firstName.trim() === "")) {
    return { fieldErrors: { firstName: "Tell us your name so the hosts know who's attending" } };
  }

  try {
    const result = await api<{ returnToken?: string }>(
      `/e/${slug}/rsvp${token ? `?t=${encodeURIComponent(token)}` : ""}`,
      {
        method: "POST",
        auth: false,
        body: {
          status,
          ...(typeof firstName === "string" && firstName.trim()
            ? { firstName: firstName.trim() }
            : {}),
          ...(formData.get("lastName") ? { lastName: formData.get("lastName") } : {}),
          ...(formData.get("email") ? { email: formData.get("email") } : {}),
          ...(formData.get("phone") ? { phone: formData.get("phone") } : {}),
          // Only meaningful for a yes; the API zeroes it for anything else.
          partySize: attending && Number.isFinite(partySize) ? partySize : 1,
          ...(attending && hasBreakdown ? { adults, children } : {}),
          ...(formData.get("mealChoice") ? { mealChoice: formData.get("mealChoice") } : {}),
          ...(formData.get("dietaryNotes") ? { dietaryNotes: formData.get("dietaryNotes") } : {}),
          ...(formData.get("message") ? { message: formData.get("message") } : {}),
        },
      },
    );
    revalidatePath(`/e/${slug}`);
    if (result.returnToken) {
      return {
        status: "sent",
        returnUrl: `${SITE_ORIGIN}/e/${slug}?t=${encodeURIComponent(result.returnToken)}`,
      };
    }
  } catch (error) {
    return toFormState(error, "We could not record that reply");
  }

  return { status: "sent" };
}
