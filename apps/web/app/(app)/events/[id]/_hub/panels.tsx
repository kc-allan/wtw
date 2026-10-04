import Link from "next/link";
import type { ReactNode } from "react";
import { CEREMONIES } from "@wtw/shared";
import type { Ceremony } from "@/lib/types";
import { CollectAddresses } from "./collect-addresses";

/** The shared shape of the right-hand side: a title, a line, then the content. */
export function Panel({
  heading,
  lead,
  children,
}: {
  heading: string;
  lead?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[880px] text-center">
      <h2 className="text-2xl font-semibold text-black">{heading}</h2>
      {lead ? <p className="mx-auto mt-2 max-w-[620px] text-base text-ink/70">{lead}</p> : null}
      {children ? <div className="mt-8">{children}</div> : null}
    </div>
  );
}

/** A card with a mark, a name, an explanation and one action. */
function ChoiceCard({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  action: ReactNode;
}) {
  return (
    <li className="flex flex-col rounded-2xl bg-ivory p-6 text-left">
      <span className="grid size-9 place-items-center rounded-lg bg-blush text-ember">
        {icon}
      </span>
      <h3 className="mt-4 text-base font-semibold text-black">{title}</h3>
      <p className="mt-2 flex-1 text-base text-ink/70">{body}</p>
      <div className="mt-6">{action}</div>
    </li>
  );
}

const CARD_ACTION =
  "block w-full rounded-full border border-forest px-5 py-3 text-center text-base text-forest transition-colors hover:bg-forest/5";

export function GuestListPanel({
  eventId,
  joinHref,
  formOpen,
  published,
}: {
  eventId: string;
  joinHref: string;
  formOpen: boolean;
  published: boolean;
}) {
  return (
    <Panel
      heading="Let's build your guest list"
      lead="Pick whichever is easiest. You can use all three, and add more people any time."
    >
      <ul className="grid gap-6 md:grid-cols-3">
        <ChoiceCard
          icon={<PersonIcon />}
          title="Add guests one by one"
          body="Add people manually, one at a time, no file needed."
          action={
            <Link href={`/events/${eventId}/guests`} className={CARD_ACTION}>
              Add a guest
            </Link>
          }
        />
        <ChoiceCard
          icon={<LinkIcon />}
          title="Collect addresses"
          body="Let guests add themselves. Share a link on WhatsApp and their details come straight to your list."
          action={
            <CollectAddresses
              eventId={eventId}
              href={joinHref}
              enabled={formOpen}
              published={published}
            />
          }
        />
        <ChoiceCard
          icon={<SheetIcon />}
          title="Use a spreadsheet"
          body="Already have your list in Excel? Paste the names in and we'll take it from there."
          action={
            <Link href={`/events/${eventId}/guests`} className={CARD_ACTION}>
              Paste a list
            </Link>
          }
        />
      </ul>
    </Panel>
  );
}

export function CeremoniesPanel({
  eventId,
  ceremonies,
}: {
  eventId: string;
  ceremonies: Ceremony[];
}) {
  return (
    <Panel
      heading={ceremonies.length === 0 ? "Which ceremonies are you having?" : "Your ceremonies"}
      lead="Each one keeps its own date, place and design. Guests see only the ceremonies they are asked to."
    >
      {ceremonies.length > 0 ? (
        <ul className="mx-auto flex max-w-[560px] flex-col gap-3 text-left">
          {ceremonies.map((ceremony) => (
            <li
              key={ceremony.id}
              className="flex items-center justify-between gap-4 rounded-xl bg-ivory px-5 py-4"
            >
              <span className="text-base text-black">{ceremony.name}</span>
              <span className="text-sm text-ink/60">
                {ceremony.startsAt
                  ? new Date(ceremony.startsAt).toLocaleDateString("en-KE", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "No date yet"}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-base text-ink/70">
          {Object.values(CEREMONIES).length} to choose from, from the introductions to the
          send off.
        </p>
      )}

      <Link
        href={`/events/${eventId}/ceremonies`}
        className="mt-8 inline-block rounded-full bg-forest px-8 py-3.5 text-base font-medium text-bright transition-colors hover:bg-forest-deep"
      >
        {ceremonies.length === 0 ? "Choose ceremonies" : "Edit ceremonies"}
      </Link>
    </Panel>
  );
}

export function InvitationsPanel({
  eventId,
  sent,
}: {
  eventId: string;
  sent: number;
}) {
  return (
    <Panel
      heading={sent === 0 ? "Your invitations" : `${sent} invitations sent`}
      lead="Choose a design, then send each guest their own link over WhatsApp, SMS or email."
    >
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href={`/events/${eventId}/template`}
          className="rounded-full bg-forest px-8 py-3.5 text-base font-medium text-bright transition-colors hover:bg-forest-deep"
        >
          Browse the templates
        </Link>
        <Link
          href={`/events/${eventId}/share`}
          className="rounded-full border border-forest px-8 py-3.5 text-base text-forest transition-colors hover:bg-forest/5"
        >
          Send invitations
        </Link>
      </div>
    </Panel>
  );
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path
        d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 1 0-5.7-5.7l-1.3 1.3M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 1 0 5.7 5.7l1.3-1.3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SheetIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 10h16M10 10v10" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
