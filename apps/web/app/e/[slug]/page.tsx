import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventModuleKey } from "@wtw/shared";
import { api, ApiError } from "@/lib/api";
import type { GalleryPhoto, PublicEvent, RegistryForGuests } from "@/lib/types";
import { EventPageView } from "./event-page-view";

async function load(slug: string, token?: string, code?: string) {
  const query = new URLSearchParams();
  if (token) query.set("t", token);
  if (code) query.set("code", code);

  return api<PublicEvent>(`/e/${slug}${query.toString() ? `?${query}` : ""}`, {
    auth: false,
    // Guests hit this the moment a host shares the link, so it must reflect
    // edits quickly without hammering the API on every open.
    revalidate: 30,
  });
}

export async function generateMetadata({
  params,
}: PageProps<"/e/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const data = await load(slug).catch(() => null);

  if (!data) {
    return { title: "Event — Worth the Wait" };
  }

  return {
    title: data.event.title,
    description: data.event.tagline ?? data.event.description ?? undefined,
    // A private event should not be indexable even if the link leaks.
    robots: data.event.visibility === "public" ? undefined : { index: false, follow: false },
  };
}

export default async function PublicEventPage({ params, searchParams }: PageProps<"/e/[slug]">) {
  const { slug } = await params;
  const query = await searchParams;

  const token = typeof query.t === "string" ? query.t : undefined;
  const code = typeof query.code === "string" ? query.code : undefined;

  let data: PublicEvent;
  try {
    data = await load(slug, token, code);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 403) {
        return <PrivateNotice />;
      }
      if (error.status === 404) {
        notFound();
      }
      return <UnavailableNotice />;
    }
    return <UnavailableNotice />;
  }

  const { event, ceremonies, modules, guest } = data;
  const enabledKeys = new Set(modules.map((module) => module.key));

  const access = new URLSearchParams();
  if (token) access.set("t", token);
  if (code) access.set("code", code);
  const suffix = access.toString() ? `?${access}` : "";

  const [registry, photos] = await Promise.all([
    enabledKeys.has(EventModuleKey.REGISTRY)
      ? api<RegistryForGuests>(`/e/${slug}/registry${suffix}`, {
          auth: false,
          revalidate: 30,
        }).catch(() => null)
      : null,
    enabledKeys.has(EventModuleKey.GALLERY)
      ? api<GalleryPhoto[]>(`/e/${slug}/gallery${suffix}`, {
          auth: false,
          revalidate: 30,
        }).catch(() => [] as GalleryPhoto[])
      : null,
  ]);
  return (
    <EventPageView
      slug={slug}
      token={token}
      event={event}
      ceremonies={ceremonies}
      modules={modules}
      guest={guest}
      registry={registry}
      photos={photos}
    />
  );
}

function PrivateNotice() {
  return (
    <Notice
      title="This one is private"
      body="Open the personal invitation link the hosts sent you."
    />
  );
}

function UnavailableNotice() {
  return (
    <Notice
      title="We could not load this invitation"
      body="Please try again. If the link was just shared, wait a moment and reopen it."
    />
  );
}

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-canvas px-6">
      <div className="max-w-[420px] text-center">
        <h1 className="font-serif text-section font-semibold text-black">{title}</h1>
        <p className="mt-3 text-base text-ink/70">{body}</p>
      </div>
    </main>
  );
}
