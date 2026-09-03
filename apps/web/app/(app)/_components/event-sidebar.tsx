"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type Item = { label: string; href: string; icon: ReactNode; disabled?: boolean };
type Group = { heading: string; items: Item[] };

/**
 * The working sidebar, shown while a host is inside an event. Steps that need
 * an event that does not exist yet are rendered disabled rather than hidden,
 * so the shape of the job stays visible from the first screen.
 */
export function EventSidebar({
  eventId,
  hasCeremonies = false,
}: {
  eventId?: string;
  hasCeremonies?: boolean;
}) {
  const pathname = usePathname();
  const base = eventId ? `/events/${eventId}` : null;

  const groups: Group[] = [
    {
      heading: "Planning",
      items: [
        { label: "My events", href: "/events", icon: <CalendarIcon /> },
        { label: "Create events", href: "/create", icon: <PlusIcon /> },
        {
          label: "Guest lists",
          href: base ? `${base}/guests` : "/guests",
          icon: <ListIcon />,
        },
      ],
    },
    {
      heading: "Design",
      items: [
        {
          label: "Template",
          href: base ? `${base}/template` : "#",
          icon: <LayoutIcon />,
          disabled: !base,
        },
        {
          label: "Editor",
          href: base ? `${base}/customize` : "#",
          icon: <PenIcon />,
          disabled: !base,
        },
        // Only the event types made up of several gatherings have these.
        ...(hasCeremonies && base
          ? [{ label: "Ceremonies", href: `${base}/ceremonies`, icon: <RingsIcon /> }]
          : []),
      ],
    },
    {
      heading: "Account",
      items: [
        { label: "Plan & billing", href: "/account/billing", icon: <CircleIcon /> },
        { label: "Back to site", href: "/", icon: <BackIcon /> },
      ],
    },
  ];

  return (
    <nav
      aria-label="Event"
      className="w-full shrink-0 border-b border-rule/50 bg-ivory px-4 py-6 lg:w-[236px] lg:border-e lg:border-b-0"
    >
      <div className="flex flex-col gap-8">
        {groups.map((group) => (
          <div key={group.heading}>
            <h2 className="px-3 text-sm tracking-[0.08em] text-muted uppercase">
              {group.heading}
            </h2>

            <ul className="mt-3 flex flex-col gap-1">
              {group.items.map((item) => {
                const isCurrent = !item.disabled && pathname === item.href;

                if (item.disabled) {
                  return (
                    <li key={item.label}>
                      <span
                        aria-disabled
                        title="Available once the event exists"
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-base text-muted"
                      >
                        {item.icon}
                        {item.label}
                      </span>
                    </li>
                  );
                }

                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      aria-current={isCurrent ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-base ${
                        isCurrent
                          ? "bg-forest font-medium text-bright"
                          : "text-ink hover:bg-canvas"
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}

const ICON = "size-[18px] shrink-0";
const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function CalendarIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className={ICON}>
      <rect x="2.5" y="4" width="15" height="13" rx="2" {...STROKE} />
      <path d="M2.5 8h15M6.5 2.5v3M13.5 2.5v3" {...STROKE} />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className={ICON}>
      <path d="M10 4v12M4 10h12" {...STROKE} />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className={ICON}>
      <path d="M7 5.5h10M7 10h10M7 14.5h10M3 5.5h.01M3 10h.01M3 14.5h.01" {...STROKE} />
    </svg>
  );
}

function LayoutIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className={ICON}>
      <rect x="2.5" y="3.5" width="15" height="13" rx="2" {...STROKE} />
      <path d="M2.5 8h15M8 8v8.5" {...STROKE} />
    </svg>
  );
}

function RingsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <circle cx="9" cy="15" r="6" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="15" cy="15" r="6" stroke="currentColor" strokeWidth="1.6" />
      <path d="m12 3 2 3h-4l2-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function PenIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className={ICON}>
      <path d="m13.5 3.5 3 3L7 16H4v-3z" {...STROKE} />
    </svg>
  );
}

function CircleIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className={ICON}>
      <circle cx="10" cy="10" r="7.5" {...STROKE} />
      <path d="m7 11 3-3 3 3" {...STROKE} />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className={ICON}>
      <path d="M8 5 3.5 9.5 8 14M3.5 9.5H13a4 4 0 0 1 0 8" {...STROKE} />
    </svg>
  );
}
