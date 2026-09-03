import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { api } from "@/lib/api";
import { GOOGLE_REDIRECT_URI, GOOGLE_STATE_COOKIE } from "@/lib/google-oauth";
import { safeNext } from "@/lib/safe-next";
import { writeSession, type TokenPair } from "@/lib/session";
import type { CurrentUser } from "@/lib/types";

interface AuthResult extends TokenPair {
  user: CurrentUser;
}

function readState(raw: string | undefined): { state: string; next: string } | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null) return null;
    const parsed = value as Record<string, unknown>;
    if (typeof parsed.state !== "string") return null;
    return { state: parsed.state, next: safeNext(parsed.next) };
  } catch {
    return null;
  }
}

/**
 * Google's side of the round trip. The code is exchanged here, on the server,
 * and only the resulting session cookies ever reach the browser.
 */
export async function GET(request: NextRequest) {
  const jar = await cookies();
  const expected = readState(jar.get(GOOGLE_STATE_COOKIE)?.value);
  jar.delete(GOOGLE_STATE_COOKIE);

  const params = request.nextUrl.searchParams;
  const code = params.get("code");
  const state = params.get("state");

  // A reply we did not start, or did not finish, goes no further.
  if (!expected || !code || state !== expected.state) {
    return NextResponse.redirect(new URL("/sign-in?error=google", request.url));
  }

  try {
    const result = await api<AuthResult>("/auth/google", {
      method: "POST",
      auth: false,
      body: { code, redirectUri: GOOGLE_REDIRECT_URI },
    });
    await writeSession(result);
  } catch {
    return NextResponse.redirect(new URL("/sign-in?error=google", request.url));
  }

  return NextResponse.redirect(new URL(expected.next, request.url));
}
