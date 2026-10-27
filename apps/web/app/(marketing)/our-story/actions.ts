"use server";

import { api, ApiError } from "@/lib/api";

export interface ContactFormState {
  status: "idle" | "sent" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
}

export async function sendEnquiry(
  _state: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  try {
    await api("/contact", {
      method: "POST",
      auth: false,
      turnstileToken: String(formData.get("cf-turnstile-response") ?? ""),
      body: {
        name: formData.get("name"),
        contact: formData.get("contact"),
        planning: formData.get("planning") || undefined,
        message: formData.get("message"),
      },
    });
  } catch (error) {
    if (!(error instanceof ApiError)) {
      throw error;
    }

    const fieldErrors: Record<string, string> = {};
    for (const { path, message } of error.fieldErrors) {
      if (path && !fieldErrors[path]) fieldErrors[path] = message;
    }

    return {
      status: "error",
      message: error.fieldErrors.length > 0 ? undefined : error.message,
      fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
    };
  }

  return { status: "sent" };
}
