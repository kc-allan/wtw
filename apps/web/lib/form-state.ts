import { ApiError } from "./api";

export interface FormState {
  message?: string;
  fieldErrors?: Record<string, string>;
}

/**
 * Turns an API failure into something a form can render: field-level messages
 * where the API sent them, one banner message where it did not. Anything that
 * is not an ApiError is rethrown — including Next's redirect signal, which
 * must never be swallowed here.
 */
export function toFormState(error: unknown, fallback: string): FormState {
  if (!(error instanceof ApiError)) {
    throw error;
  }

  const fieldErrors: Record<string, string> = {};
  for (const { path, message } of error.fieldErrors) {
    if (path && !fieldErrors[path]) fieldErrors[path] = message;
  }

  return {
    message: error.fieldErrors.length > 0 ? undefined : (error.message ?? fallback),
    fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
  };
}

export function optionalNumber(value: FormDataEntryValue | null): number | undefined {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return undefined;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function optionalText(value: FormDataEntryValue | null): string | undefined {
  const text = typeof value === "string" ? value.trim() : "";
  return text || undefined;
}
