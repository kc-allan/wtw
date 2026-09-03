import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/app/_components/ui";

export const metadata: Metadata = { title: "Plan & billing — Worth the Wait" };

/**
 * Payments are not built yet, so this states the plan honestly rather than
 * showing an invoice history that does not exist.
 */
export default function BillingPage() {
  return (
    <main className="mx-auto w-full max-w-[720px] flex-1 px-6 py-10">
      <h1 className="font-serif text-section font-semibold text-black">Plan &amp; billing</h1>

      <div className="mt-8 rounded-2xl bg-white p-8">
        <p className="text-base text-ink/70">Current plan</p>
        <p className="mt-1 font-serif text-xl font-semibold text-black">Free</p>
        <p className="mt-3 text-base text-ink/80">
          One event, three starter templates and RSVPs for up to 30 guests. Upgrading is
          per celebration, not a subscription.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/pricing" variant="ghost">
            Compare plans
          </ButtonLink>
        </div>
      </div>

      <p className="mt-6 text-base text-ink/70">
        Card and M-Pesa payments are not switched on yet. To upgrade in the meantime,{" "}
        <Link href="/about#contact" className="underline underline-offset-4">
          talk to us
        </Link>
        .
      </p>
    </main>
  );
}
