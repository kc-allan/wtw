import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { BackToEvent } from "../_hub/back-to-event";
import type { EventDetail, Theme } from "@/lib/types";
import { TemplatePicker } from "./template-picker";

export const metadata: Metadata = { title: "Choose a design — Worth the Wait" };

export default async function TemplateStepPage({ params }: PageProps<"/events/[id]/template">) {
  const { id } = await params;

  const event = await api<EventDetail>(`/events/${id}`).catch(() => null);
  if (!event) {
    notFound();
  }

  // Only the themes this event type can actually use; a birthday must never be
  // offered a wedding template.
  const themes = await api<Theme[]>(`/themes?eventType=${event.typeKey}`, {
    auth: false,
    revalidate: 3600,
  }).catch(() => [] as Theme[]);

  return (
    <main className="w-full px-6 py-8 lg:px-10">
      <BackToEvent eventId={id} />

      <h1 className="mt-8 font-serif text-section font-semibold text-black">Choose a design</h1>
      <p className="mt-1 text-base tracking-[0.02em] text-ink/70">
        Previewed with your names already in place.
      </p>

      <TemplatePicker event={event} themes={themes} />
    </main>
  );
}
