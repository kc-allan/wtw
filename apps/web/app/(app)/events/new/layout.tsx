import { EventSidebar } from "../../_components/event-sidebar";

/**
 * Step one has no event yet, so the sidebar renders with its design entries
 * disabled rather than being absent and then appearing mid-flow.
 */
export default function NewEventLayout({ children }: LayoutProps<"/events/new">) {
  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <EventSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
