import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { api } from "@/lib/api";
import { BackToEvent } from "../_hub/back-to-event";
import type { EventDetail, Theme } from "@/lib/types";
import { CustomizeEditor } from "./customize-editor";

export const metadata: Metadata = { title: "Make it yours | Worth the Wait" };

export default async function CustomizeStepPage({ params }: PageProps<"/events/[id]/customize">) {
  const { id } = await params;

  const event = await api<EventDetail>(`/events/${id}`).catch(() => null);
  if (!event) {
    notFound();
  }

  // Customising before a design is chosen would leave nothing to preview.
  if (!event.theme) {
    redirect(`/events/${id}/template`);
  }

  const themes = await api<Theme[]>(`/themes?eventType=${event.typeKey}`, {
    auth: false,
    revalidate: 3600,
  }).catch(() => [] as Theme[]);

  return (
    <main className="w-full px-6 py-8 lg:px-10">
      <BackToEvent eventId={id} />
      <CustomizeEditor event={event} themes={themes} />
    </main>
  );
}
