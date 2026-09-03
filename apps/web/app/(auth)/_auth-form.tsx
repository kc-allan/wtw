"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button, Field, Input } from "@/app/_components/ui";
import type { FormState } from "@/lib/form-state";

const INITIAL: FormState = {};

/**
 * Sign in and sign up are the same form with a different field set, so they
 * share the layout, the error handling and the pending state.
 */
export function AuthForm({
  action,
  title,
  lead,
  submitLabel,
  next,
  showName = false,
  footer,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  title: string;
  lead: string;
  submitLabel: string;
  next: string;
  showName?: boolean;
  footer: { prompt: string; label: string; href: string };
}) {
  const [state, formAction] = useActionState(action, INITIAL);

  return (
    <div className="w-full max-w-[460px]">
      <h1 className="font-serif text-section font-semibold text-black">{title}</h1>
      <p className="mt-2 text-base tracking-[0.02em] text-ink/80">{lead}</p>

      <form action={formAction} className="mt-8 flex flex-col gap-5">
        <input type="hidden" name="next" value={next} />

        {showName ? (
          <Field label="Your name" htmlFor="name" error={state.fieldErrors?.name}>
            <Input
              id="name"
              name="name"
              required
              autoComplete="name"
              placeholder="Amina Wanjiku"
              aria-describedby={state.fieldErrors?.name ? "name-error" : undefined}
            />
          </Field>
        ) : null}

        <Field label="Email" htmlFor="email" error={state.fieldErrors?.email}>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
          />
        </Field>

        {showName ? (
          <Field
            label="Phone"
            htmlFor="phone"
            hint="Optional. Useful when guests reply by SMS."
            error={state.fieldErrors?.phone}
          >
            <Input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="0712 345 678"
              aria-describedby={state.fieldErrors?.phone ? "phone-error" : undefined}
            />
          </Field>
        ) : null}

        <Field
          label="Password"
          htmlFor="password"
          hint={showName ? "At least 10 characters, with a capital and a number." : undefined}
          error={state.fieldErrors?.password}
        >
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete={showName ? "new-password" : "current-password"}
            aria-describedby={state.fieldErrors?.password ? "password-error" : undefined}
          />
        </Field>

        {state.message ? (
          <p role="alert" className="text-sm text-ember">
            {state.message}
          </p>
        ) : null}

        <SubmitButton label={submitLabel} />
      </form>

      <p className="mt-6 text-base text-ink/80">
        {footer.prompt}{" "}
        <Link href={footer.href} className="font-medium text-forest underline underline-offset-4">
          {footer.label}
        </Link>
      </p>
    </div>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "One moment…" : label}
    </Button>
  );
}
