import { cookies } from "next/headers";

const COOKIE_PREFIX = "wtw_turnstile_";

export function turnstileActionFor(method: string, path: string): string | null {
  const cleanPath = path.split("?")[0].replace(/^\/api\/v\d+/, "");
  if (cleanPath === "/auth/register" && method === "POST") return "register";
  if (cleanPath === "/auth/login" && method === "POST") return "login";
  if (cleanPath === "/contact" && method === "POST") return "contact";
  if (cleanPath === "/events" && method === "POST") return "event_create";
  if (/^\/events\/[^/]+$/.test(cleanPath) && method === "PATCH") return "event_update";
  if (/^\/events\/[^/]+\/publish$/.test(cleanPath) && method === "POST") return "event_publish";
  if (/^\/events\/[^/]+\/unpublish$/.test(cleanPath) && method === "POST") return "event_unpublish";
  if (/^\/events\/[^/]+\/modules\/[^/]+$/.test(cleanPath) && method === "PATCH") return "event_module";
  if (/^\/events\/[^/]+\/ceremonies$/.test(cleanPath) && method === "PUT") return "ceremonies";
  if (/^\/events\/[^/]+\/ceremonies\/[^/]+$/.test(cleanPath) && method === "PATCH") return "ceremony_update";
  if (/^\/events\/[^/]+\/guests(?:\/bulk)?$/.test(cleanPath) && method === "POST") return "guest_add";
  if (/^\/events\/[^/]+\/guests\/[^/]+$/.test(cleanPath) && method === "PATCH") return "guest_update";
  if (/^\/events\/[^/]+\/guests\/[^/]+$/.test(cleanPath) && method === "DELETE") return "guest_delete";
  if (/^\/events\/[^/]+\/invitations\/(?:issue|send)$/.test(cleanPath) && method === "POST") return "invitation";
  if (/^\/events\/[^/]+\/invitations\/[^/]+$/.test(cleanPath) && method === "DELETE") return "invitation";
  if (/^\/events\/[^/]+\/games$/.test(cleanPath) && method === "POST") return "game_add";
  if (/^\/events\/[^/]+\/games\/[^/]+$/.test(cleanPath) && method === "PATCH") return "game_update";
  if (/^\/events\/[^/]+\/games\/[^/]+$/.test(cleanPath) && method === "DELETE") return "game_update";
  if (/^\/events\/[^/]+\/registry$/.test(cleanPath) && method === "POST") return "registry_update";
  if (/^\/events\/[^/]+\/registry\/[^/]+$/.test(cleanPath) && ["PATCH", "DELETE"].includes(method)) return "registry_update";
  if (/^\/events\/[^/]+\/media$/.test(cleanPath) && method === "POST") return "media_upload";
  if (/^\/events\/[^/]+\/media\/[^/]+$/.test(cleanPath) && method === "PATCH") return "media_update";
  if (/^\/events\/[^/]+\/media\/[^/]+$/.test(cleanPath) && method === "DELETE") return "media_update";
  if (/^\/e\/[^/]+\/rsvp$/.test(cleanPath) && method === "POST") return "rsvp";
  if (/^\/e\/[^/]+\/guest-list$/.test(cleanPath) && method === "POST") return "guest_join";
  if (/^\/e\/[^/]+\/registry\/[^/]+\/claim$/.test(cleanPath) && method === "POST") return "registry_claim";
  if (/^\/e\/[^/]+\/games\/[^/]+$/.test(cleanPath) && method === "POST") return "game_submit";
  return null;
}

function cookieName(action: string): string {
  return `${COOKIE_PREFIX}${action}`;
}

export async function readTurnstileToken(action: string): Promise<string | undefined> {
  return (await cookies()).get(cookieName(action))?.value;
}

export async function clearTurnstileToken(action: string): Promise<void> {
  const jar = await cookies();
  jar.delete(cookieName(action));
}
