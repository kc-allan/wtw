"use client";

import Link from "next/link";
import { useState } from "react";

/**
 * The share sheet. Nothing is sent from the server: the host chooses the
 * channel and their own device opens it, which is how people actually share an
 * invitation here. It means no provider account is needed to go live.
 */
export function SharePanel({
  eventId,
  url,
  title,
  dateLabel,
  visibility,
}: {
  eventId: string;
  url: string;
  title: string;
  dateLabel: string;
  visibility: string;
}) {
  const [copied, setCopied] = useState(false);

  const message = `You're invited to ${title} on ${dateLabel}. Details and RSVP: ${url}`;
  const isPrivate = visibility === "private";
  const accessNote = isPrivate
    ? "This event is private. Use personal invitation links from the guest list so each guest can open it."
    : "This shared link lets guests type their name and reply once. Use the guest list when you want a private link for a specific guest.";

  const channels = [
    {
      key: "whatsapp",
      label: "Share on WhatsApp",
      hint: "Choose who to send it to in WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(message)}`,
      icon: <WhatsappIcon />,
    },
    {
      key: "sms",
      label: "Share by SMS",
      hint: "Opens a message you can review before sending",
      href: `sms:?&body=${encodeURIComponent(message)}`,
      icon: <SmsIcon />,
    },
    {
      key: "email",
      label: "Share by email",
      hint: "Opens a draft you can edit before sending",
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(message)}`,
      icon: <MailIcon />,
    },
  ];

  return (
    <div className="min-w-0 rounded-2xl bg-white p-6 sm:p-8">
      <h2 className="font-serif text-xl text-ink/70">Share your invitation</h2>

      <p className="mt-5 text-base text-ink/80">Your event link</p>
      <div className="mt-2 flex items-center justify-between gap-4 rounded-lg bg-sand/50 px-4 py-3">
        <span className="min-w-0 truncate text-base text-ink">{url}</span>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 2000);
            } catch {
              // Clipboard access can be refused; the link is selectable anyway.
              setCopied(false);
            }
          }}
          className="shrink-0 text-base font-medium text-gold"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p aria-live="polite" className="sr-only">
        {copied ? "Link copied to clipboard" : ""}
      </p>

      {isPrivate ? null : (
        <ul className="mt-6 flex flex-col gap-3">
          {channels.map((channel) => (
            <li key={channel.key}>
              <a
                href={channel.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-4 rounded-lg border border-rule px-4 py-3 transition-colors hover:bg-ivory"
              >
                {channel.icon}
                <span>
                  <span className="block text-base font-medium text-ink">{channel.label}</span>
                  <span className="block text-base text-ink/60">{channel.hint}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 rounded-lg bg-ivory px-4 py-3 text-sm text-ink/70">
        {accessNote}
      </p>

      <Link
        href={`/events/${eventId}/guests`}
        className="mt-8 flex w-full items-center justify-center rounded-full bg-forest px-6 py-3.5 text-base font-medium text-bright"
      >
        {isPrivate ? "Create personal links" : "Go to guest list"}
      </Link>
    </div>
  );
}

const ICON_BOX = "grid size-8 shrink-0 place-items-center rounded-lg";

function WhatsappIcon() {
  return (
    <span className={`${ICON_BOX} bg-[#25D366]/15 text-[#128C4A]`} aria-hidden>
      <svg viewBox="0 0 24 24" className="size-5" fill="currentColor">
        <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm5.1 14.2c-.2.6-1.2 1.2-1.7 1.2-.5.1-1 .1-1.6-.1a12 12 0 0 1-5.9-5.2c-.4-.7-.7-1.5-.7-2.3 0-.8.4-1.3.7-1.6.2-.2.4-.3.6-.3h.5c.2 0 .4 0 .5.4l.7 1.7c.1.2 0 .4-.1.5l-.3.4c-.1.2-.3.3-.1.6.3.5.7 1 1.2 1.4.5.4 1 .7 1.5.9.2.1.4.1.5-.1l.6-.7c.2-.2.3-.2.5-.1l1.6.8c.2.1.4.2.4.3 0 .1 0 .6-.2 1.1Z" />
      </svg>
    </span>
  );
}

function SmsIcon() {
  return (
    <span className={`${ICON_BOX} bg-forest/10 text-forest`} aria-hidden>
      <svg viewBox="0 0 24 24" className="size-5" fill="currentColor">
        <path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
      </svg>
    </span>
  );
}

function MailIcon() {
  return (
    <span className={`${ICON_BOX} bg-[#1A73E8]/12 text-[#1A73E8]`} aria-hidden>
      <svg viewBox="0 0 24 24" className="size-5" fill="currentColor">
        <path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm9 8 8-5H4Z" />
      </svg>
    </span>
  );
}
