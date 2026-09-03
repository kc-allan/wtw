import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/**
 * The button shapes the design uses. `primary` is the dark green pill, `ghost`
 * the outlined one, `plain` a bare text action.
 */
const BUTTON_VARIANTS = {
  primary: "bg-forest text-bright hover:bg-forest-deep",
  ghost: "border border-forest text-forest hover:bg-forest/5",
  quiet: "border border-rule text-forest hover:bg-ivory",
  plain: "text-forest hover:underline",
} as const;

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-medium whitespace-nowrap transition-colors outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

export type ButtonVariant = keyof typeof BUTTON_VARIANTS;

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant }) {
  return (
    <button
      {...props}
      className={`${BUTTON_BASE} ${BUTTON_VARIANTS[variant]} ${className}`}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: ButtonVariant }) {
  return (
    <Link
      {...props}
      className={`${BUTTON_BASE} ${BUTTON_VARIANTS[variant]} ${className}`}
    />
  );
}

/** The cream panel most content sits on. */
export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`rounded-2xl bg-ivory p-6 ${className}`}>{children}</div>
  );
}

/** Centred eyebrow + heading + lead, as every marketing page opens. */
export function PageHeading({
  eyebrow,
  title,
  lead,
  id,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  id?: string;
  className?: string;
}) {
  return (
    <header className={`flex flex-col items-center gap-2 text-center ${className}`}>
      {eyebrow ? (
        <p className="text-base tracking-[0.02em] text-gold">{eyebrow}</p>
      ) : null}
      <h1 id={id} className="font-serif text-section font-semibold text-black">
        {title}
      </h1>
      {lead ? (
        <p className="max-w-[640px] text-base tracking-[0.02em] text-ink/70">{lead}</p>
      ) : null}
    </header>
  );
}

/** A labelled form control. The label is always rendered, never a placeholder. */
export function Field({
  label,
  htmlFor,
  error,
  hint,
  className = "",
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="text-base tracking-[0.02em] text-ink/80">
        {label}
      </label>
      {children}
      {hint && !error ? <p className="text-sm text-muted">{hint}</p> : null}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-sm text-ember">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const CONTROL =
  "w-full rounded-lg border border-rule bg-ivory px-4 py-3 text-base text-ink outline-offset-2 placeholder:text-muted focus:border-forest";

export function Input({ className = "", ...props }: ComponentProps<"input">) {
  return <input {...props} className={`${CONTROL} ${className}`} />;
}

export function Textarea({ className = "", ...props }: ComponentProps<"textarea">) {
  return <textarea {...props} className={`${CONTROL} resize-y ${className}`} />;
}

export function Select({ className = "", ...props }: ComponentProps<"select">) {
  return <select {...props} className={`${CONTROL} ${className}`} />;
}
