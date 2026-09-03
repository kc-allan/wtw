import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CreateStepKey, typeAsksCreateStep } from "@wtw/shared";
import { api } from "@/lib/api";
import type { EventDetail, Theme } from "@/lib/types";
import { CeremonyEditor } from "./ceremony-editor";

export const metadata: Metadata = { title: "Ceremonies — Worth the Wait" };

export default async function CeremoniesPage({ params }: PageProps<"/events/[id]/ceremonies">) {
  const { id } = await params;

  const event = await api<EventDetail>(`/events/${id}`).catch(() => null);
  if (!event) notFound();
  // Only the types whose setup asks for ceremonies have any to edit.
  if (!typeAsksCreateStep(event.typeKey, CreateStepKey.CEREMONIES)) {
    redirect(`/events/${id}/customize`);
  }

  const themes = await api<Theme[]>(`/themes?eventType=${event.typeKey}`, {
    auth: false,
    revalidate: 3600,
  }).catch(() => [] as Theme[]);

  return (
    <main className="w-full px-6 py-8 lg:px-10">
      <h1 className="font-serif text-section font-semibold text-black">Your ceremonies</h1>
      <p className="mt-1 max-w-[640px] text-base tracking-[0.02em] text-ink/70">
        Each one keeps its own date, place and design. Guests see only the ceremonies
        they are asked to.
      </p>

      <CeremonyEditor event={event} themes={themes} />
    </main>
  );
}
