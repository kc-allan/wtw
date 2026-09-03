/**
 * Keeps a `next=` destination pointing inside this app, so a crafted link
 * cannot turn sign-in into a redirect somewhere else.
 */
export function safeNext(value: unknown, fallback = "/events"): string {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}
