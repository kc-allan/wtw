"use server";

import { redirect } from "next/navigation";
import { api } from "./api";
import { toFormState, type FormState } from "./form-state";
import { clearSession, readRefreshToken, writeSession, type TokenPair } from "./session";
import type { CurrentUser } from "./types";

interface AuthResult extends TokenPair {
  user: CurrentUser;
}

/** Keeps `?next=` pointing inside this app, so it cannot become an open redirect. */
function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/events";
}

export async function signIn(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const next = safeNext(formData.get("next"));

  try {
    const result = await api<AuthResult>("/auth/login", {
      method: "POST",
      auth: false,
      body: {
        email: formData.get("email"),
        password: formData.get("password"),
      },
    });
    await writeSession(result);
  } catch (error) {
    return toFormState(error, "That email and password did not match");
  }

  redirect(next);
}

export async function signUp(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const next = safeNext(formData.get("next"));
  const phone = formData.get("phone");

  try {
    const result = await api<AuthResult>("/auth/register", {
      method: "POST",
      auth: false,
      body: {
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
        ...(typeof phone === "string" && phone.trim() ? { phone: phone.trim() } : {}),
      },
    });
    await writeSession(result);
  } catch (error) {
    return toFormState(error, "We could not create that account");
  }

  redirect(next);
}

export async function signOut(): Promise<void> {
  const refreshToken = await readRefreshToken();

  if (refreshToken) {
    // Revokes the token server-side; the cookies go either way.
    await api("/auth/logout", { method: "POST", auth: false, body: { refreshToken } }).catch(
      () => undefined,
    );
  }

  await clearSession();
  redirect("/sign-in");
}
