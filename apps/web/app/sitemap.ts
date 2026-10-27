import type { MetadataRoute } from "next";
import { api } from "@/lib/api";
import { SITE_ORIGIN } from "@/lib/site";

interface SitemapEvent {
  slug: string;
  updatedAt: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const events = await api<SitemapEvent[]>("/e/sitemap", {
    auth: false,
    revalidate: 3600,
  }).catch(() => []);

  return events.map((event) => ({
    url: `${SITE_ORIGIN}/e/${event.slug}`,
    lastModified: new Date(event.updatedAt),
  }));
}
