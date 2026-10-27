/**
 * What someone types when they are trying to get back to an invitation: the
 * whole link they were sent, or just the code from it. Only the parts we
 * recognise are kept, and the destination is always built from them — never
 * the text itself — so a crafted link cannot send anyone off this site.
 */
export interface EventLookup {
  slug: string;
  token?: string;
}

const SLUG = /^[a-z0-9][a-z0-9-]{1,59}$/;

export function parseEventLookup(raw: string): EventLookup | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null;

  const fromLink = trimmed.includes("/e/") ? fromEventLink(trimmed) : null;
  if (fromLink) return fromLink;

  // Otherwise it is the code on its own, however they happened to type it.
  const slug = trimmed.toLowerCase().replace(/\s+/g, "-");
  return SLUG.test(slug) ? { slug } : null;
}

function fromEventLink(value: string): EventLookup | null {
  const after = value.slice(value.indexOf("/e/") + 3);
  const slug = after.split(/[/?#]/)[0]?.toLowerCase() ?? "";
  if (!SLUG.test(slug)) return null;

  const queryAt = after.indexOf("?");
  if (queryAt === -1) return { slug };

  const params = new URLSearchParams(after.slice(queryAt + 1).split("#")[0]);
  return {
    slug,
    token: params.get("t") ?? undefined,
  };
}

/** The address on this site that a lookup resolves to. */
export function eventLookupHref({ slug, token }: EventLookup): string {
  const params = new URLSearchParams();
  if (token) params.set("t", token);
  const query = params.toString();
  return `/e/${slug}${query ? `?${query}` : ""}`;
}
