"use server";

import { revalidatePath } from "next/cache";
import { api } from "@/lib/api";
import { toFormState, type FormState } from "@/lib/form-state";

/**
 * Puts a guest's name against one gift. The API re-checks what is left as it
 * writes, so two guests reaching for the last one cannot both succeed.
 */
export async function claimGift(
  slug: string,
  token: string,
  itemId: string,
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const guestName = formData.get("guestName");
  if (typeof guestName !== "string" || guestName.trim() === "") {
    return { message: "Add your name so the hosts know who to thank" };
  }

  const quantity = Number(formData.get("quantity"));

  try {
    await api(`/e/${slug}/registry/${itemId}/claim?t=${encodeURIComponent(token)}`, {
      method: "POST",
      auth: false,
      body: {
        guestName: guestName.trim(),
        quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
      },
    });
  } catch (error) {
    return toFormState(error, "We could not put your name against that");
  }

  revalidatePath(`/e/${slug}`);
  // Read by the form to swap itself for a thank you.
  return { message: "claimed" };
}
