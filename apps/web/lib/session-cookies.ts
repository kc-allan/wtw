/**
 * Cookie names only. Kept free of `next/headers` so the proxy, which runs
 * before that API exists, can import them.
 */
export const ACCESS_COOKIE = "wtw_access";
export const REFRESH_COOKIE = "wtw_refresh";

/** Matches JWT_ACCESS_TTL and JWT_REFRESH_TTL on the API. */
export const ACCESS_MAX_AGE = 15 * 60;
export const REFRESH_MAX_AGE = 30 * 24 * 60 * 60;

/**
 * httpOnly means no script on the page can read a token, so an XSS bug cannot
 * walk away with the account. `lax` still lets the cookie ride along when
 * someone follows a link back into the app.
 */
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
} as const;
