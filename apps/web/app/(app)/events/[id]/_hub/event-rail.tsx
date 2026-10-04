import Link from "next/link";
import type { ReactNode } from "react";

export interface RailSection {
  id: string;
  label: string;
  /** The live state of that part of the event, e.g. "0 Guests", "Not sent". */
  status?: string;
  /** Rendered under the entry while it is the open one. */
  children?: ReactNode;
}

/**
 * The spine of an event. Everything a host can do sits here with its current
 * state beside it, so the first screen answers "where did I get to" before it
 * asks anything.
 */
export function EventRail({
  eventId,
  sections,
  current,
}: {
  eventId: string;
  sections: RailSection[];
  current: string;
}) {
  return (
    <nav aria-label="This event" className="w-full">
      <h1 className="text-2xl font-semibold text-black sm:text-3xl">
        Choose what you want to do first
      </h1>
      <p className="mt-3 max-w-[420px] text-base text-ink/70">
        There&rsquo;s no right order. Everything saves as you go, so you can leave
        anything half-done and come back to it.
      </p>

      <ul className="mt-8 flex flex-col">
        {sections.map((section, index) => {
          const open = section.id === current;

          return (
            <li
              key={section.id}
              className={
                !open && index > 0 ? "border-t border-rule/50" : undefined
              }
            >
              <Link
                href={`/events/${eventId}?section=${section.id}`}
                aria-current={open ? "page" : undefined}
                className={`flex items-center justify-between gap-4 rounded-xl px-5 py-4 transition-colors ${
                  open ? "bg-forest text-bright" : "text-black hover:bg-ivory"
                }`}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="truncate text-base">{section.label}</span>
                  {section.status ? (
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-sm ${
                        open ? "bg-bright/15 text-bright/80" : "bg-canvas text-ink/60"
                      }`}
                    >
                      {section.status}
                    </span>
                  ) : null}
                </span>

                <Chevron open={open} />
              </Link>

              {open && section.children ? (
                <div className="px-2 pb-2">{section.children}</div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 shrink-0 ${open ? "rotate-90" : ""}`}
      fill="none"
      aria-hidden
    >
      <path
        d="m9 5 7 7-7 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
