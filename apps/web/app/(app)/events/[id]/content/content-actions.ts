"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { EventModuleKey, GAMES, GameKey } from "@wtw/shared";
import { api, ApiError } from "@/lib/api";
import { API_URL } from "@/lib/env";
import { optionalNumber, optionalText } from "@/lib/form-state";
import { readAccessToken } from "@/lib/session";
import { clearTurnstileToken, readTurnstileToken } from "@/lib/turnstile";
import { dateTimeLocalToUtcIso } from "@/lib/zoned-datetime";

function values(formData: FormData, name: string): string[] {
  return formData
    .getAll(name)
    .map((value) => (typeof value === "string" ? value.trim() : ""));
}

function nullable(value: FormDataEntryValue | null): string | undefined {
  return optionalText(value);
}

function presentRows<T>(rows: T[], keep: (row: T) => boolean): T[] {
  return rows.filter(keep);
}

async function saveModule(
  eventId: string,
  key: EventModuleKey,
  config: Record<string, unknown>,
  saved: string,
): Promise<never> {
  await api(`/events/${eventId}/modules/${key}`, {
    method: "PATCH",
    body: { enabled: true, config },
  });
  revalidatePath(`/events/${eventId}`, "layout");
  redirect(`/events/${eventId}/content?saved=${saved}`);
}

export async function saveStory(eventId: string, formData: FormData): Promise<never> {
  const titles = values(formData, "storyTitle");
  const bodies = values(formData, "storyBody");
  const dates = values(formData, "storyDate");
  const sections = presentRows(
    titles.map((title, index) => ({
      title,
      body: bodies[index] ?? "",
      ...(dates[index] ? { date: dates[index] } : {}),
    })),
    (entry) => entry.title.length > 0 && entry.body.length > 0,
  );

  return saveModule(eventId, EventModuleKey.OUR_STORY, { sections }, "story");
}

export async function saveTimeline(eventId: string, formData: FormData): Promise<never> {
  const startsAt = values(formData, "timelineStartsAt");
  const titles = values(formData, "timelineTitle");
  const descriptions = values(formData, "timelineDescription");
  const locations = values(formData, "timelineLocation");
  const timeZone = optionalText(formData.get("timezone")) ?? "Africa/Nairobi";
  const entries = presentRows(
    startsAt.map((start, index) => ({
      startsAt: start ? dateTimeLocalToUtcIso(start, timeZone) ?? start : "",
      title: titles[index] ?? "",
      ...(descriptions[index] ? { description: descriptions[index] } : {}),
      ...(locations[index] ? { location: locations[index] } : {}),
    })),
    (entry) => entry.startsAt.length > 0 && entry.title.length > 0,
  );

  return saveModule(eventId, EventModuleKey.TIMELINE, { entries }, "schedule");
}

export async function savePracticalInfo(eventId: string, formData: FormData): Promise<never> {
  const section = optionalText(formData.get("section"));

  if (section === "faq") {
    const questions = values(formData, "faqQuestion");
    const answers = values(formData, "faqAnswer");
    const items = presentRows(
      questions.map((question, index) => ({ question, answer: answers[index] ?? "" })),
      (entry) => entry.question.length > 0 && entry.answer.length > 0,
    );
    return saveModule(eventId, EventModuleKey.FAQ, { items }, "faq");
  }

  if (section === "dress") {
    const palette = values(formData, "dressPalette")
      .join(",")
      .split(",")
      .map((color) => color.trim())
      .filter(Boolean);
    return saveModule(
      eventId,
      EventModuleKey.DRESS_CODE,
      {
        title: nullable(formData.get("dressTitle")),
        description: nullable(formData.get("dressDescription")),
        palette,
      },
      "dress",
    );
  }

  const names = values(formData, "stayName");
  const addresses = values(formData, "stayAddress");
  const urls = values(formData, "stayUrl");
  const notes = values(formData, "stayNote");
  const options = presentRows(
    names.map((name, index) => ({
      name,
      ...(addresses[index] ? { address: addresses[index] } : {}),
      ...(urls[index] ? { bookingUrl: urls[index] } : {}),
      ...(notes[index] ? { note: notes[index] } : {}),
    })),
    (entry) => entry.name.length > 0,
  );

  return saveModule(eventId, EventModuleKey.ACCOMMODATION, { options }, "accommodation");
}

export async function saveRsvpSettings(eventId: string, formData: FormData): Promise<never> {
  const mealOptions = values(formData, "mealOptions")
    .join("\n")
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean);

  return saveModule(
    eventId,
    EventModuleKey.RSVP,
    {
      deadline: optionalText(formData.get("deadline"))
        ? dateTimeLocalToUtcIso(
            optionalText(formData.get("deadline")) as string,
            optionalText(formData.get("timezone")) ?? "Africa/Nairobi",
          )
        : undefined,
      allowPlusOnes: formData.get("allowPlusOnes") !== null,
      maxPartySize: optionalNumber(formData.get("maxPartySize")) ?? 1,
      allowMaybe: formData.get("allowMaybe") !== null,
      collectDietary: formData.get("collectDietary") !== null,
      collectMessage: formData.get("collectMessage") !== null,
      collectHeadcountBreakdown: formData.get("collectHeadcountBreakdown") !== null,
      mealOptions,
    },
    "rsvp",
  );
}

export async function saveRegistrySettings(eventId: string, formData: FormData): Promise<never> {
  const methodKinds = values(formData, "cashKind");
  const methodLabels = values(formData, "cashLabel");
  const methodDetails = values(formData, "cashDetail");
  const cashGiftMethods = presentRows(
    methodLabels.map((label, index) => ({
      kind: methodKinds[index] || "bank",
      label,
      ...(methodDetails[index] ? { detail: methodDetails[index] } : {}),
    })),
    (entry) => entry.label.length > 0,
  );

  const externalLabels = values(formData, "externalLabel");
  const externalUrls = values(formData, "externalUrl");
  const externalRegistries = presentRows(
    externalLabels.map((label, index) => ({ label, url: externalUrls[index] ?? "" })),
    (entry) => entry.label.length > 0 && entry.url.length > 0,
  );

  return saveModule(
    eventId,
    EventModuleKey.REGISTRY,
    {
      currency: optionalText(formData.get("currency")) ?? "KES",
      allowCashGifts: formData.get("allowCashGifts") !== null,
      cashGiftNote: nullable(formData.get("cashGiftNote")),
      cashGiftMethods,
      externalRegistries,
      hideClaimedItems: formData.get("hideClaimedItems") !== null,
    },
    "registry",
  );
}

export async function addRegistryItem(eventId: string, formData: FormData): Promise<never> {
  const name = optionalText(formData.get("name"));
  if (!name) redirect(`/events/${eventId}/content?saved=registry`);

  const priceMajor = optionalNumber(formData.get("price"));
  await api(`/events/${eventId}/registry`, {
    method: "POST",
    body: {
      name,
      description: nullable(formData.get("description")),
      imageUrl: nullable(formData.get("imageUrl")),
      externalUrl: nullable(formData.get("externalUrl")),
      quantity: optionalNumber(formData.get("quantity")) ?? 1,
      ...(priceMajor !== undefined ? { price: Math.round(priceMajor * 100) } : {}),
    },
  });
  revalidatePath(`/events/${eventId}`, "layout");
  redirect(`/events/${eventId}/content?saved=registry`);
}

export async function deleteRegistryItem(eventId: string, itemId: string): Promise<never> {
  await api(`/events/${eventId}/registry/${itemId}`, { method: "DELETE" });
  revalidatePath(`/events/${eventId}`, "layout");
  redirect(`/events/${eventId}/content?saved=registry`);
}

export async function uploadGalleryImage(eventId: string, formData: FormData): Promise<never> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    redirect(`/events/${eventId}/content?saved=gallery`);
  }

  const token = await readAccessToken();
  const turnstileToken = await readTurnstileToken("media_upload");
  const body = new FormData();
  body.set("file", file);

  let response: Response;
  try {
    response = await fetch(`${API_URL}/events/${eventId}/media`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(turnstileToken ? { "X-Turnstile-Token": turnstileToken } : {}),
      },
      body,
    });
  } finally {
    await clearTurnstileToken("media_upload").catch(() => undefined);
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new ApiError(response.status, payload?.message ?? "We could not upload that image");
  }

  await api(`/events/${eventId}/modules/${EventModuleKey.GALLERY}`, {
    method: "PATCH",
    body: { enabled: true },
  });
  revalidatePath(`/events/${eventId}`, "layout");
  redirect(`/events/${eventId}/content?saved=gallery`);
}



export async function updateGalleryImage(eventId: string, imageId: string, formData: FormData): Promise<never> {
  await api(`/events/${eventId}/media/${imageId}`, {
    method: "PATCH",
    body: {
      caption: nullable(formData.get("caption")) ?? null,
      altText: nullable(formData.get("altText")) ?? null,
      position: optionalNumber(formData.get("position")) ?? 0,
      isHidden: formData.get("isHidden") !== null,
    },
  });
  revalidatePath(`/events/${eventId}`, "layout");
  redirect(`/events/${eventId}/content?saved=gallery`);
}

export async function deleteGalleryImage(eventId: string, imageId: string): Promise<never> {
  await api(`/events/${eventId}/media/${imageId}`, { method: "DELETE" });
  revalidatePath(`/events/${eventId}`, "layout");
  redirect(`/events/${eventId}/content?saved=gallery`);
}

function questionsFrom(formData: FormData): { id: string; prompt: string; options: string[]; correctAnswer?: string }[] {
  const prompts = values(formData, "gameQuestionPrompt");
  const options = values(formData, "gameQuestionOptions");
  const answers = values(formData, "gameQuestionAnswer");
  return presentRows(
    prompts.map((prompt, index) => ({
      id: `q${index + 1}`,
      prompt,
      options: (options[index] ?? "")
        .split("\n")
        .map((entry) => entry.trim())
        .filter(Boolean),
      ...(answers[index] ? { correctAnswer: answers[index] } : {}),
    })),
    (entry) => entry.prompt.length > 0,
  );
}

function gameConfig(gameKey: GameKey, formData: FormData): Record<string, unknown> {
  const definition = GAMES[gameKey];
  const prompt = optionalText(formData.get("gamePrompt")) ?? definition.prompt;
  if (definition.responseKind === "quiz") {
    const questions = questionsFrom(formData);
    const defaults = definition.defaultConfig as { questions?: unknown[] } | undefined;
    return {
      prompt,
      questions: questions.length > 0 ? questions : defaults?.questions ?? [],
    };
  }
  return { prompt };
}

export async function addGame(eventId: string, formData: FormData): Promise<never> {
  const raw = optionalText(formData.get("gameKey"));
  if (!raw || !(raw in GAMES)) redirect(`/events/${eventId}/content?saved=games`);
  const gameKey = raw as GameKey;
  await api(`/events/${eventId}/games`, {
    method: "POST",
    body: {
      gameKey,
      config: gameConfig(gameKey, formData),
      position: optionalNumber(formData.get("position")) ?? 0,
    },
  });
  revalidatePath(`/events/${eventId}`, "layout");
  redirect(`/events/${eventId}/content?saved=games`);
}

export async function updateGame(eventId: string, gameInstanceId: string, gameKey: GameKey, formData: FormData): Promise<never> {
  await api(`/events/${eventId}/games/${gameInstanceId}`, {
    method: "PATCH",
    body: {
      enabled: formData.get("enabled") !== null,
      position: optionalNumber(formData.get("position")) ?? 0,
      config: gameConfig(gameKey, formData),
    },
  });
  revalidatePath(`/events/${eventId}`, "layout");
  redirect(`/events/${eventId}/content?saved=games`);
}

export async function deleteGame(eventId: string, gameInstanceId: string): Promise<never> {
  await api(`/events/${eventId}/games/${gameInstanceId}`, { method: "DELETE" });
  revalidatePath(`/events/${eventId}`, "layout");
  redirect(`/events/${eventId}/content?saved=games`);
}
