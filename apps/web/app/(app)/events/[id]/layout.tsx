import { CreateStepKey, typeAsksCreateStep } from "@wtw/shared";
import { api } from "@/lib/api";
import type { EventDetail } from "@/lib/types";
import { EventSidebar } from "../../_components/event-sidebar";

/** Everything inside a single event works alongside the design sidebar. */
export default async function EventLayout({ children, params }: LayoutProps<"/events/[id]">) {
  const { id } = await params;

  // The sidebar offers ceremonies only to the types that have them, so it
  // needs to know which event this is before it can be drawn.
  const event = await api<EventDetail>(`/events/${id}`).catch(() => null);

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <EventSidebar
        eventId={id}
        hasCeremonies={
          event !== null && typeAsksCreateStep(event.typeKey, CreateStepKey.CEREMONIES)
        }
      />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
