"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { faqs } from "@/app/_data/landing";

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();

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

      <div className="flex w-full max-w-[1160px] flex-col gap-4">
        {faqs.map((faq, index) => {
          const isOpen = index === openIndex;
          const panelId = `${baseId}-panel-${index}`;
          const buttonId = `${baseId}-button-${index}`;

          return (
            <div key={faq.question} className="flex flex-col gap-4">
              <h3>
                <button
                  type="button"
                  id={buttonId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-start justify-between gap-4 text-left"
                >
                  <span
                    className={`min-w-0 flex-1 text-xl tracking-[0.02em] text-black ${
                      isOpen ? "font-semibold" : "font-normal"
                    }`}
                  >
                    {faq.question}
                  </span>
                  <Image
                    src={isOpen ? "/icons/minus.svg" : "/icons/plus.svg"}
                    alt=""
                    width={24}
                    height={24}
                    unoptimized
                    className="size-6 shrink-0"
                  />
                </button>
              </h3>

              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                hidden={!isOpen}
                className="-mt-[5px] text-base tracking-[0.02em] text-black"
              >
                {faq.answer}
              </div>

              <span aria-hidden className="h-px w-full bg-rule" />
            </div>
          );
        })}
      </div>
    </section>
  );
}
