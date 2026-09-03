"use server";

import { redirect } from "next/navigation";
import { api } from "./api";
import { readDraft } from "./create-draft";
import { toFormState, type FormState } from "./form-state";
import { safeNext } from "./safe-next";
import { clearSession, readRefreshToken, writeSession, type TokenPair } from "./session";
import type { CurrentUser } from "./types";

interface AuthResult extends TokenPair {
  user: CurrentUser;
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
        identifier: formData.get("identifier"),
        password: formData.get("password"),
      },
    });
    await writeSession(result);
  } catch (error) {
    return toFormState(error, "Those details did not match an account");
  }

  redirect(next);
}

export async function signUp(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const next = safeNext(formData.get("next"));
  const number = formData.get("phone");
  const diallingCode = formData.get("diallingCode");
  // Someone signing up mid-flow already told us their name on the first step.
  const draft = await readDraft();

  try {
    const result = await api<AuthResult>("/auth/register", {
      method: "POST",
      auth: false,
      body: {
        email: formData.get("email"),
        password: formData.get("password"),
        ...(draft ? { name: draft.fullName } : {}),
        // The two phone fields are one value; an empty number sends neither.
        ...(typeof number === "string" && number.trim()
          ? {
              phone: {
                diallingCode: typeof diallingCode === "string" ? diallingCode : "+254",
                number: number.trim(),
              },
            }
          : {}),
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
