import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms | Worth the Wait",
  description: "Beta terms for Worth the Wait hosts and guests.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-[900px] px-6 py-14">
      <p className="text-base text-ember">Terms</p>
      <h1 className="mt-2 font-serif text-section font-semibold text-black">
        Beta terms for hosts and guests
      </h1>
      <p className="mt-4 text-base text-ink/70">
        These terms describe the current beta. Paid plans, professional accounts and checkout are not part of this beta release.
      </p>

      <div className="mt-10 grid gap-8 text-base text-ink/80">
        <Section title="Using the beta">
          You can create and share celebrations while the beta is open. Some features may change as we improve the product. Keep a copy of any information you cannot afford to lose.
        </Section>
        <Section title="Host responsibility">
          Hosts are responsible for the event details, guest information, registry instructions, links and photos they add. Only publish information guests should be able to see.
        </Section>
        <Section title="Gift registry">
          Gift items, external registry links and cash instructions are shown on behalf of the host. Worth the Wait does not process gift payments in beta.
        </Section>
        <Section title="Sharing">
          WhatsApp, SMS and email actions open the host's own apps. Worth the Wait records links and replies, but it does not guarantee that a message was delivered by those apps.
        </Section>
        <Section title="Support">
          If something fails, contact us from the Our Story page with the event title, account email and what you were trying to do.
        </Section>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-6">
      <h2 className="font-serif text-2xl text-black">{title}</h2>
      <p className="mt-3 leading-7">{children}</p>
    </section>
  );
}
