import type { Metadata } from "next";
import { ButtonLink } from "@/app/_components/ui";

export const metadata: Metadata = { title: "Plan & billing — Worth the Wait" };

/**
 * Payments are not part of the beta, so this states the current access
 * plainly rather than showing an invoice history that does not exist.
 */
export default function BillingPage() {
  return (
    <main className="mx-auto w-full max-w-[720px] flex-1 px-6 py-10">
      <h1 className="font-serif text-section font-semibold text-black">Plan &amp; billing</h1>

      <div className="mt-8 rounded-2xl bg-white p-8">
        <p className="text-base text-ink/70">Current plan</p>
        <p className="mt-1 font-serif text-xl font-semibold text-black">Free beta</p>
        <p className="mt-3 text-base text-ink/80">
          You can create, publish and collect RSVPs while the beta is open. Paid
          plans and professional accounts come later.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/plans" variant="ghost">
            View beta access
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
