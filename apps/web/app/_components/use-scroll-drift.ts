"use client";

import { useRef } from "react";
import {
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";

/**
 * Nudges a horizontal strip sideways as its section travels up the viewport.
 *
 * The drift is a transform, so it never touches layout or the scroll range —
 * vertical scrolling is untouched and the strip stays natively scrollable, with
 * the reader's own position and the drift simply adding together. Leave room
 * for `distance` at the end of the track (`pe-*`) so the tail never runs dry.
 */
export function useScrollDrift(distance: number) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const smoothed = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 26,
    restDelta: 0.001,
  });

  const drift = useTransform(smoothed, [0, 1], [0, -distance]);

  return { ref, x: prefersReducedMotion ? 0 : drift };
}
