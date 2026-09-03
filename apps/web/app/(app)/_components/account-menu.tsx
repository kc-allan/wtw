"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "@/lib/auth-actions";
import type { CurrentUser } from "@/lib/types";

/** First letters of the first two words, as the design's avatar shows. */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function AccountMenu({ user }: { user: CurrentUser | null }) {
  const [open, setOpen] = useState(false);

  if (!user) {
    return null;
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className="grid size-11 place-items-center rounded-full bg-mint text-base font-medium text-forest outline-offset-2"
      >
        <span aria-hidden>{initials(user.name)}</span>
        <span className="sr-only">Account menu for {user.name}</span>
      </button>

      {open ? (
        <>
          {/* Click-away target; the menu is small enough not to need a trap. */}
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />

          <div
            role="menu"
            className="absolute end-0 z-50 mt-2 w-56 rounded-xl border border-rule bg-white p-2 shadow-lg"
          >
            <p className="px-3 py-2 text-sm text-muted">{user.email}</p>

            <Link
              role="menuitem"
              href="/account/billing"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-base text-ink hover:bg-canvas"
            >
              Plan &amp; billing
            </Link>

            <form action={signOut}>
              <button
                role="menuitem"
                type="submit"
                className="w-full rounded-lg px-3 py-2 text-start text-base text-ember hover:bg-canvas"
              >
                Sign out
              </button>
            </form>
          </div>
        </>
      ) : null}
    </div>
  );
}
