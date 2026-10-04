import type { Metadata } from "next";
import { PageHeading } from "@/app/_components/ui";
import { aboutCards, aboutIntro } from "@/app/_data/marketing";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "About — Worth the Wait",
  description:
    "We grew up around these celebrations, so we built something that works the way they really happen.",
};

export default function AboutPage() {
  return (
    <>
      <section className="mx-auto flex w-full max-w-335 flex-col gap-12 px-6 py-12">
        <PageHeading eyebrow="About us" title="We know how we celebrate here." lead={aboutIntro} />

        <ul className="grid gap-6 md:grid-cols-3">
          {aboutCards.map((card) => (
            <li key={card.title} className="flex flex-col rounded-2xl bg-bright p-6">
              {/* <span aria-hidden className="grid size-10 place-items-center rounded-lg bg-canvas text-xl">
                {card.emoji}
              </span> */}
              <h2 className="mt-6 text-base font-semibold text-black">{card.title}</h2>
              <p className="mt-2 text-base tracking-[0.02em] text-ink/80">{card.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="contact" className="mx-auto flex w-full max-w-[1340px] scroll-mt-24 flex-col gap-8 px-6 pb-16">
        <PageHeading
          eyebrow="Get in touch"
          title="We'd love to hear from you"
          lead="Planning something? Curious about the beta? Just want to say hi? Drop a line."
        />
        <ContactForm />
      </section>
    </>
  );
}
