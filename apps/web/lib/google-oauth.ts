import { api } from "./api";
import { SITE_URL } from "./env";

/**
 * Where Google sends people back to. It is this app rather than the API, so
 * the authorization code is exchanged from a server action and no session
 * token ever travels in a URL, a browser history entry or a referrer header.
 */
export const GOOGLE_REDIRECT_URI = `${SITE_URL}/auth/google/callback`;

/** Carries the anti-forgery value and where to land, across the round trip. */
export const GOOGLE_STATE_COOKIE = "wtw_oauth";

export const GOOGLE_STATE_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 10 * 60,
} as const;

interface Providers {
  google: boolean;
  googleClientId: string | null;
}

/**
 * Whether this deployment can offer Google at all. The button is hidden until
 * the credentials exist, so nothing half-wired is ever put in front of anyone.
 */
export async function googleClientId(): Promise<string | null> {
  try {
    const providers = await api<Providers>("/auth/providers", { auth: false });
    return providers.google ? providers.googleClientId : null;
  } catch {
    return null;
  }
}

export function googleAuthUrl(clientId: string, state: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
    state,
    // Asks Google to show the chooser rather than silently reusing an account.
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}
