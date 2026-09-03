import { cookies } from "next/headers";
import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE,
  SESSION_COOKIE_OPTIONS,
} from "./session-cookies";

export { ACCESS_COOKIE, REFRESH_COOKIE } from "./session-cookies";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export async function readAccessToken(): Promise<string | undefined> {
  return (await cookies()).get(ACCESS_COOKIE)?.value;
}

export async function readRefreshToken(): Promise<string | undefined> {
  return (await cookies()).get(REFRESH_COOKIE)?.value;
}

/** Only callable from a route handler or server action, never a page render. */
export async function writeSession(tokens: TokenPair): Promise<void> {
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, tokens.accessToken, {
    ...SESSION_COOKIE_OPTIONS,
    maxAge: ACCESS_MAX_AGE,
  });
  jar.set(REFRESH_COOKIE, tokens.refreshToken, {
    ...SESSION_COOKIE_OPTIONS,
    maxAge: REFRESH_MAX_AGE,
  });
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
}
