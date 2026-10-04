"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Fragment, useRef, useState } from "react";
import { categories, templatesByCategory } from "@/app/_data/landing";
import { TemplateCard } from "./template-card";
import { useScrollDrift } from "./use-scroll-drift";

/**
 * The set repeats so cards bleed past both edges, the way the band reads in
 * the design.
 */
const REPEATS = 2;

/** How far the strip coasts sideways over the band's trip up the viewport. */
const DRIFT = 220;

export function TemplateShowcase() {
  const [activeCategory, setActiveCategory] = useState(categories[0].id);
  const stripRef = useRef<HTMLDivElement>(null);
  const { ref: bandRef, x } = useScrollDrift(DRIFT);

  const templates = templatesByCategory[activeCategory] ?? [];
  const cards = Array.from({ length: REPEATS }, (_, pass) =>
    templates.map((template) => ({
      ...template,
      key: `${pass}-${template.id}`,
    })),
  ).flat();

  const selectCategory = (id: string) => {
    setActiveCategory(id);
    stripRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  };

  return (
    <section aria-labelledby="templates-heading" className="w-full pt-[17px]">
      <h2
        id="templates-heading"
        className="px-6 text-center font-serif text-section font-semibold text-black"
      >
        What are you celebrating?
      </h2>

      <div className="relative z-20 mt-4 flex justify-center px-6">
        <div className="flex flex-wrap items-center justify-center gap-3 rounded-[40px] bg-white px-6 py-[17px] sm:px-12 lg:px-20">
          {categories.map((category, index) => {
            const isActive = category.id === activeCategory;
            return (
              <Fragment key={category.id}>
                {index > 0 && (
                  /* The row only sits on one line from lg up, where the
                     separators still read correctly. */
                  <span
                    aria-hidden
                    className="hidden h-[25px] w-px bg-chalk lg:block"
                  />
                )}
                <button
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => selectCategory(category.id)}
                  className={`flex items-center rounded-[30px] px-4 py-3 text-base font-medium tracking-[0.02em] whitespace-nowrap ${
                    isActive ? "bg-forest-deep text-bright" : "text-black"
                  }`}
                >
                  {category.label}
                </button>
              </Fragment>
            );
          })}
        </div>
      </div>

      {/* The band: two page-coloured ellipses trim the card strip into a curve. */}
      <div ref={bandRef} className="relative mt-2 h-[699px] overflow-hidden">
        <div
          ref={stripRef}
          className="scrollbar-none absolute inset-x-0 top-[22px] overflow-x-auto overscroll-x-contain pb-4"
          tabIndex={0}
          role="group"
          aria-label="Template previews, scroll horizontally"
        >
          <motion.div
            style={{ x }}
            className="flex snap-x snap-mandatory gap-20 px-6 pe-[220px] lg:ps-0"
          >
            {cards.map(({ key, ...template }) => (
              <div key={key} className="snap-start">
                <TemplateCard template={template} />
              </div>
            ))}
          </motion.div>
        </div>

        <span
          aria-hidden
          className="pointer-events-none absolute top-0 left-1/2 h-[84px] w-[127%] -translate-x-1/2 rounded-[50%] bg-canvas"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute top-[615px] left-1/2 h-[84px] w-[127%] -translate-x-1/2 rounded-[50%] bg-canvas"
        />

        <p className="pointer-events-none absolute top-[17px] right-0 z-10 flex items-center px-4 py-3 text-base font-medium tracking-[0.02em] text-forest">
          Scroll
          <Image
            src="/icons/arrow-right.svg"
            alt=""
            width={24}
            height={24}
            unoptimized
            className="size-6"
          />
        </p>
      </div>
    </section>
  );
}
