import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  SESSION_COOKIE_OPTIONS,
} from "@/lib/session-cookies";

const API_URL = process.env.API_URL ?? "http://localhost:4100/api/v1";

/**
 * The setup flow is walked by people who have no account yet, so a missing
 * session there is the normal case rather than a reason to send anyone away.
 */
function sessionIsRequired(pathname: string): boolean {
  return !pathname.startsWith("/create");
}

/**
 * Keeps the session alive without the browser ever holding a token. The access
 * cookie is short-lived, so when it expires this quietly spends the refresh
 * cookie for a new pair and lets the request continue — the page render behind
 * it never has to think about expiry. Server Components cannot set cookies,
 * which is exactly why the refresh happens out here.
 */
export async function proxy(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  if (accessToken && accessTokenExpiry(accessToken) > Date.now() + 60_000) {
    return NextResponse.next();
  }

  const required = sessionIsRequired(request.nextUrl.pathname);
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) {
    const response = required ? redirectToSignIn(request) : NextResponse.next();
    response.cookies.delete(ACCESS_COOKIE);
    response.cookies.delete(REFRESH_COOKIE);
    return response;
  }

  const refreshed = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  }).catch(() => null);

  if (!refreshed?.ok) {
    // The refresh token is spent or revoked; either way it is worth nothing now.
    const response = required ? redirectToSignIn(request) : NextResponse.next();
    response.cookies.delete(ACCESS_COOKIE);
    response.cookies.delete(REFRESH_COOKIE);
    return response;
  }

  const tokens = (await refreshed.json()) as {
    accessToken: string;
    refreshToken: string;
    refreshTokenExpiresAt: number;
  };
  const accessTokenExpiresAt = accessTokenExpiry(tokens.accessToken);
  if (
    accessTokenExpiresAt <= Date.now() ||
    !Number.isFinite(tokens.refreshTokenExpiresAt) ||
    tokens.refreshTokenExpiresAt <= Date.now()
  ) {
    const response = required ? redirectToSignIn(request) : NextResponse.next();
    response.cookies.delete(ACCESS_COOKIE);
    response.cookies.delete(REFRESH_COOKIE);
    return response;
  }

  // The render below reads the request cookies, not the response's, so the new
  // token has to be put back where it will actually be looked for.
  request.cookies.set(ACCESS_COOKIE, tokens.accessToken);
  const response = NextResponse.next({ request });

  response.cookies.set(ACCESS_COOKIE, tokens.accessToken, {
    ...SESSION_COOKIE_OPTIONS,
    maxAge: Math.floor((accessTokenExpiresAt - Date.now()) / 1000),
  });
  response.cookies.set(REFRESH_COOKIE, tokens.refreshToken, {
    ...SESSION_COOKIE_OPTIONS,
    maxAge: Math.floor((tokens.refreshTokenExpiresAt - Date.now()) / 1000),
  });

  return response;
}

function accessTokenExpiry(token: string): number {
  try {
    const payload = token.split(".")[1];
    if (!payload) return 0;
    const encoded = payload.replace(/-/g, "+").replace(/_/g, "/");
    const parsed: unknown = JSON.parse(atob(encoded.padEnd(Math.ceil(encoded.length / 4) * 4, "=")));
    if (
      typeof parsed !== "object" || parsed === null ||
      typeof (parsed as { exp?: unknown }).exp !== "number"
    ) return 0;
    return (parsed as { exp: number }).exp * 1000;
  } catch {
    return 0;
  }
}

function redirectToSignIn(request: NextRequest) {
  const signIn = new URL("/sign-in", request.url);
  signIn.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(signIn);
}

export const config = {
  // The host-facing area needs a session; the setup flow only wants one kept
  // alive if it is already there. Marketing and guest pages are left alone.
  matcher: ["/events/:path*", "/account/:path*", "/create/:path*"],
};
