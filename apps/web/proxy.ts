import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE,
  SESSION_COOKIE_OPTIONS,
} from "@/lib/session-cookies";

const API_URL = process.env.API_URL ?? "http://localhost:4100/api/v1";

/**
 * Keeps the session alive without the browser ever holding a token. The access
 * cookie is short-lived, so when it expires this quietly spends the refresh
 * cookie for a new pair and lets the request continue — the page render behind
 * it never has to think about expiry. Server Components cannot set cookies,
 * which is exactly why the refresh happens out here.
 */
export async function proxy(request: NextRequest) {
  if (request.cookies.get(ACCESS_COOKIE)) {
    return NextResponse.next();
  }

  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) {
    return redirectToSignIn(request);
  }

  const refreshed = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  }).catch(() => null);

  if (!refreshed?.ok) {
    // The refresh token is spent or revoked; make them sign in again.
    const response = redirectToSignIn(request);
    response.cookies.delete(ACCESS_COOKIE);
    response.cookies.delete(REFRESH_COOKIE);
    return response;
  }

  const tokens = (await refreshed.json()) as {
    accessToken: string;
    refreshToken: string;
  };

  // The render below reads the request cookies, not the response's, so the new
  // token has to be put back where it will actually be looked for.
  request.cookies.set(ACCESS_COOKIE, tokens.accessToken);
  const response = NextResponse.next({ request });

  response.cookies.set(ACCESS_COOKIE, tokens.accessToken, {
    ...SESSION_COOKIE_OPTIONS,
    maxAge: ACCESS_MAX_AGE,
  });
  response.cookies.set(REFRESH_COOKIE, tokens.refreshToken, {
    ...SESSION_COOKIE_OPTIONS,
    maxAge: REFRESH_MAX_AGE,
  });

  return response;
}

function redirectToSignIn(request: NextRequest) {
  const signIn = new URL("/sign-in", request.url);
  signIn.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(signIn);
}

export const config = {
  // Only the host-facing area needs a session; marketing pages and the guest
  // event pages must stay reachable signed out.
  matcher: ["/events/:path*", "/account/:path*"],
};
