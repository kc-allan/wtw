"use client";

import Image from "next/image";
import { useId, useState } from "react";

export type AccordionItem = { question: string; answer: string };

/**
 * One-at-a-time disclosure list. Used for the landing FAQ and the pricing
 * questions, which are the same control with different surroundings.
 */
export function Accordion({
  items,
  defaultOpen = 0,
  className = "",
}: {
  items: AccordionItem[];
  /** Index open on first render; `null` starts fully collapsed. */
  defaultOpen?: number | null;
  className?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpen);
  const baseId = useId();

  return (
    <div className={`flex w-full flex-col gap-4 ${className}`}>
      {items.map((item, index) => {
        const isOpen = index === openIndex;
        const panelId = `${baseId}-panel-${index}`;
        const buttonId = `${baseId}-button-${index}`;

        return (
          <div key={item.question} className="flex flex-col gap-4">
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
                  {item.question}
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
              {item.answer}
            </div>

            <span aria-hidden className="h-px w-full bg-rule" />
          </div>
        );
      })}
    </div>
  );
}
