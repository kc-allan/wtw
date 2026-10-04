"use server";

import { redirect } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { eventLookupHref, parseEventLookup } from "@/lib/find-event";
import type { FormState } from "@/lib/form-state";

export async function findEvent(_state: FormState, formData: FormData): Promise<FormState> {
  const raw = formData.get("lookup");
  const lookup = parseEventLookup(typeof raw === "string" ? raw : "");

  if (!lookup) {
    return { message: "Paste the link you were sent, or type the code from it." };
  }

  try {
    await api(`/e/${lookup.slug}`, { auth: false, revalidate: 30 });
  } catch (error) {
    // A private event is still an event — it will ask them for their link.
    const isPrivate = error instanceof ApiError && error.status === 403;
    if (!isPrivate) {
      return { message: "We could not find that one. Check the link and try again." };
    }
  }

  redirect(eventLookupHref(lookup));
}
