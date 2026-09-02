"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { testimonials } from "@/app/_data/landing";
import { useScrollDrift } from "./use-scroll-drift";

const PAGES = 3;

/** How far the cards coast sideways over the section's trip up the viewport. */
const DRIFT = 160;

export function Testimonials() {
  const stripRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const { ref: sectionRef, x } = useScrollDrift(DRIFT);

  const onScroll = useCallback(() => {
    const strip = stripRef.current;
    if (!strip) return;

    const scrollable = strip.scrollWidth - strip.clientWidth;
    const progress = scrollable > 0 ? strip.scrollLeft / scrollable : 0;
    setPage(Math.round(progress * (PAGES - 1)));
  }, []);

  const goToPage = (index: number) => {
    const strip = stripRef.current;
    if (!strip) return;

    const scrollable = strip.scrollWidth - strip.clientWidth;
    strip.scrollTo({
      left: (scrollable * index) / (PAGES - 1),
      behavior: "smooth",
    });
  };

  return (
    <section
      ref={sectionRef}
      aria-labelledby="testimonials-heading"
      className="mt-[113px] flex w-full flex-col items-center overflow-x-clip bg-sand py-10"
    >
      <div className="flex w-full flex-col items-center gap-6">
        <header className="flex w-full max-w-[520px] flex-col items-center px-6 text-center">
          <p className="w-full text-base text-ember">Reviews</p>
          <h2
            id="testimonials-heading"
            className="w-full text-2xl font-semibold text-black"
          >
            Families who celebrated with us
          </h2>
        </header>

        {/* Full-bleed so the drift is clipped by the viewport edge, not by a
            column boundary; the start padding keeps the first card aligned
            with the 1366px content column at rest. */}
        <div
          ref={stripRef}
          onScroll={onScroll}
          tabIndex={0}
          role="group"
          aria-label="Reviews, scroll horizontally"
          className="scrollbar-none w-full overflow-x-auto overscroll-x-contain"
        >
          <motion.div
            style={{ x }}
            className="flex snap-x snap-mandatory items-stretch gap-4 pe-[160px] ps-[max(1.5rem,calc((100%-1366px)/2))]"
          >
            {testimonials.map((testimonial) => (
              <figure
                key={testimonial.id}
                className="flex w-[503px] max-w-[85vw] shrink-0 snap-start flex-col items-start rounded-[20px] bg-shell px-4 py-8"
              >
                <div className="flex w-full flex-col gap-[21px]">
                  <blockquote className="flex w-full gap-2">
                    <Image
                      src="/icons/quote-left.svg"
                      alt=""
                      width={16}
                      height={16}
                      unoptimized
                      className="mt-1.5 size-4 shrink-0"
                    />
                    <p className="min-w-0 flex-1 text-2xl text-black">
                      {testimonial.quote}
                    </p>
                  </blockquote>

                  <figcaption className="flex w-full items-start gap-[9px]">
                    <span
                      aria-hidden
                      className="size-[39px] shrink-0 rounded-full bg-[#d9d9d9]"
                    />
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <Image
                        src="/icons/rating-stars.svg"
                        alt="Rated 5 out of 5"
                        width={78}
                        height={14}
                        unoptimized
                        className="h-3.5 w-[78px]"
                      />
                      <span className="text-base font-semibold text-black">
                        {testimonial.name}
                      </span>
                      <span className="text-base text-muted">
                        {testimonial.meta}
                      </span>
                    </div>
                  </figcaption>
                </div>
              </figure>
            ))}
          </motion.div>
        </div>

        <div className="flex items-center gap-1">
          {Array.from({ length: PAGES }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goToPage(index)}
              aria-label={`Go to review page ${index + 1}`}
              aria-current={index === page}
              className={`size-2 rounded-full transition-colors ${
                index === page ? "bg-ember" : "bg-[#d9d9d9]"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
