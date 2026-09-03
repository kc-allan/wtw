import { EventSidebar } from "../../_components/event-sidebar";

/** Everything inside a single event works alongside the design sidebar. */
export default async function EventLayout({ children, params }: LayoutProps<"/events/[id]">) {
  const { id } = await params;

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <EventSidebar eventId={id} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
