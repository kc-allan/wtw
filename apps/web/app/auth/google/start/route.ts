import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import {
  GOOGLE_STATE_COOKIE,
  GOOGLE_STATE_COOKIE_OPTIONS,
  googleAuthUrl,
  googleClientId,
} from "@/lib/google-oauth";
import { safeNext } from "@/lib/safe-next";

/** Starts the hand-off to Google, remembering where to come back to. */
export async function GET(request: NextRequest) {
  const clientId = await googleClientId();
  if (!clientId) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const state = randomBytes(16).toString("hex");
  const next = safeNext(request.nextUrl.searchParams.get("next"));

  (await cookies()).set(
    GOOGLE_STATE_COOKIE,
    JSON.stringify({ state, next }),
    GOOGLE_STATE_COOKIE_OPTIONS,
  );

  return NextResponse.redirect(googleAuthUrl(clientId, state));
}
