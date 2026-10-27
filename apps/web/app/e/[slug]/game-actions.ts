"use server";

import { revalidatePath } from "next/cache";
import { api } from "@/lib/api";
import { toFormState, type FormState } from "@/lib/form-state";

export interface GameState extends FormState {
  status?: "sent";
}

function textValue(formData: FormData, name: string): string | undefined {
  const value = formData.get(name);
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function accessQuery(token: string): string {
  const query = new URLSearchParams();
  if (token) query.set("t", token);
  return query.toString() ? `?${query}` : "";
}

function quizPayload(formData: FormData): { answers: Record<string, string> } {
  const answers: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("answer:") && typeof value === "string" && value.trim()) {
      answers[key.slice("answer:".length)] = value.trim();
    }
  }
  return { answers };
}

function payloadFor(kind: string, formData: FormData): unknown {
  if (kind === "date") {
    return { guess: textValue(formData, "guess") };
  }

  if (kind === "weight") {
    const kilograms = Number(formData.get("kilograms"));
    return { grams: Number.isFinite(kilograms) ? Math.round(kilograms * 1000) : undefined };
  }

  if (kind === "quiz") {
    return quizPayload(formData);
  }

  if (kind === "predictions") {
    const lengthCm = Number(formData.get("lengthCm"));
    return {
      eyeColour: textValue(formData, "eyeColour"),
      hairColour: textValue(formData, "hairColour"),
      looksLike: textValue(formData, "looksLike"),
      arrivesEarlyOrLate: textValue(formData, "arrivesEarlyOrLate"),
      ...(Number.isFinite(lengthCm) ? { lengthCm } : {}),
      note: textValue(formData, "note"),
    };
  }

  return { text: textValue(formData, "text") };
}

export async function submitGame(
  slug: string,
  token: string,
  gameId: string,
  kind: string,
  _state: GameState,
  formData: FormData,
): Promise<GameState> {
  const guestName = textValue(formData, "guestName");

  try {
    await api(`/e/${slug}/games/${gameId}${accessQuery(token)}`, {
      method: "POST",
      auth: false,
      turnstileToken: String(formData.get("cf-turnstile-response") ?? ""),
      body: {
        ...(guestName ? { guestName } : {}),
        payload: payloadFor(kind, formData),
      },
    });
    revalidatePath(`/e/${slug}`);
    return { status: "sent" };
  } catch (error) {
    return toFormState(error, "We could not save that answer");
  }
}
