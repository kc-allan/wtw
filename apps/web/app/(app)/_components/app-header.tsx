import Link from "next/link";
import { Wordmark } from "@/app/_components/wordmark";
import type { CurrentUser } from "@/lib/types";
import { AppNav } from "./app-nav";
import { AccountMenu } from "./account-menu";

/**
 * The signed-in bar. Always present across the host area, so it carries the
 * one action a host takes most — starting another event.
 */
export function AppHeader({ user }: { user: CurrentUser | null }) {
  return (
    <header className="w-full border-b border-rule/50 bg-ivory">
      <div className="mx-auto flex w-full max-w-[1392px] items-center justify-between gap-6 px-6 py-4">
        <Link href="/events" aria-label="Worth the Wait — my events">
          <Wordmark href={null} />
        </Link>

        <div className="flex items-center gap-4 sm:gap-8">
          <AppNav />

          <div className="flex items-center gap-3">
            <Link
              href="/create"
              aria-label="New event"
              className="inline-flex items-center gap-2 rounded-full bg-forest px-4 py-2.5 text-base font-medium whitespace-nowrap text-bright transition-colors hover:bg-forest-deep sm:px-5"
            >
              <span aria-hidden className="text-lg leading-none">
                +
              </span>
              <span className="hidden sm:inline">New event</span>
            </Link>

            <AccountMenu user={user} />
          </div>
        </div>
      </div>
    </header>
  );
}
