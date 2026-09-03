/**
 * The public origin guests see, shown in share links and previews. Safe to
 * import from client components — it holds no secrets, unlike `API_URL`.
 */
export const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "http://localhost:3000";
