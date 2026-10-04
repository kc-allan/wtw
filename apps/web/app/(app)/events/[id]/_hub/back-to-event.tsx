import Link from "next/link";

/** The way back to the event's own page, from any of its parts. */
export function BackToEvent({ eventId }: { eventId: string }) {
  return (
    <Link
      href={`/events/${eventId}`}
      className="inline-flex items-center gap-2 text-base text-ink transition-opacity hover:opacity-70"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
        <path
          d="M15 5 8 12l7 7"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Back to the event
    </Link>
  );
}
