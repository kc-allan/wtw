import type { ReactNode } from "react";

/**
 * The two-column shape the later steps share: the question on the left, and
 * what is being made from the answers on the right.
 */
export function StepColumns({ children, aside }: { children: ReactNode; aside: ReactNode }) {
  return (
    <div className="mt-10 grid items-start gap-10 lg:grid-cols-2 xl:grid-cols-[minmax(0,754px)_510px] xl:justify-between xl:gap-16">
      <div className="min-w-0">{children}</div>
      <div className="min-w-0">{aside}</div>
    </div>
  );
}
