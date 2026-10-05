import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy | Worth the Wait",
  description: "How Worth the Wait handles beta event, guest and support information.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-[900px] px-6 py-14">
      <p className="text-base text-ember">Privacy</p>
      <h1 className="mt-2 font-serif text-section font-semibold text-black">
        How we handle your celebration information
      </h1>
      <p className="mt-4 text-base text-ink/70">
        Worth the Wait is in beta. We collect the information needed to create invitations, manage guests, collect replies and answer support requests.
      </p>

      <div className="mt-10 grid gap-8 text-base text-ink/80">
        <Section title="Information hosts add">
          Event details, names shown on the invitation, guest lists, registry details, photos and RSVP settings are stored so the event can be edited, previewed and shared.
        </Section>
        <Section title="Information guests add">
          Guests may add their name, contact details, RSVP reply, party size, meal choice, message, gift claim or game response when those features are enabled by the host.
        </Section>
        <Section title="Who can open an event">
          Draft events are visible only to the host. Published unlisted events open for anyone with the link. Private events require a personal invitation link or access code where enabled.
        </Section>
        <Section title="Support and contact">
          Contact requests are used to reply to the sender and understand the request. Do not send passwords, payment card details or private identity documents through the contact form.
        </Section>
        <Section title="Retention and deletion">
          Hosts can unpublish an event to stop guest access while they edit or withdraw it. For deletion requests during beta, contact support through the Our Story page with the event title and account email.
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
