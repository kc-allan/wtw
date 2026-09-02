"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

/**
 * Four soft shapes that turn slowly behind the steps. Figma exports the loop
 * with its transform tracks collapsed into the final 0.04% of the timeline;
 * what reads on the canvas is the steady rotation, so that is what runs here —
 * each shape keeps its own designed rate and offset.
 */
const shapes = [
  { src: "/decor/shape-1.svg", width: 544.432, height: 601.768, left: 312, top: 392, from: 0, to: 119.163, duration: 30 },
  { src: "/decor/shape-2.svg", width: 614.645, height: 570.533, left: 453, top: 0, from: 0, to: 102.274, duration: 35 },
  { src: "/decor/shape-3.svg", width: 584.325, height: 622.497, left: 0, top: 481, from: 0, to: 75.063, duration: 48 },
  { src: "/decor/shape-4.svg", width: 656.957, height: 590.358, left: 453, top: 792, from: 0, to: 81.632, duration: 44 },
];

export function DriftingShapes() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute top-[386px] bottom-0 left-[-492px] hidden h-[1927px] lg:block"
    >
      <div className="sticky top-0 h-[1382.358px] w-[1109.957px]">
        {shapes.map((shape) => (
          <motion.div
            key={shape.src}
            className="absolute"
            style={{
              left: shape.left,
              top: shape.top,
              width: shape.width,
              height: shape.height,
            }}
            initial={{ rotate: shape.from }}
            animate={
              prefersReducedMotion
                ? { rotate: shape.from }
                : { rotate: [shape.from, shape.to] }
            }
            transition={
              prefersReducedMotion
                ? undefined
                : {
                    duration: shape.duration,
                    ease: "linear",
                    repeat: Infinity,
                    repeatType: "mirror",
                  }
            }
          >
            <Image
              src={shape.src}
              alt=""
              width={shape.width}
              height={shape.height}
              unoptimized
              className="size-full"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
