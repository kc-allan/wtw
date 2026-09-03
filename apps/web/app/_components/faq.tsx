import { faqs } from "@/app/_data/landing";
import { Accordion } from "./accordion";

export function Faq() {
  return (
    <section
      aria-labelledby="faq-heading"
      className="mt-[27px] flex w-full flex-col items-center gap-2.5 px-6 py-10"
    >
      <header className="flex w-full max-w-[810px] flex-col items-center gap-4 px-2 text-center">
        <p className="w-full text-sm font-semibold tracking-[0.02em] text-ember">
          FAQs
        </p>
        <h2
          id="faq-heading"
          className="w-full text-section font-semibold text-black"
        >
          Good to know
        </h2>
      </header>

      <Accordion items={faqs} className="max-w-[1160px]" />
    </section>
  );
}
