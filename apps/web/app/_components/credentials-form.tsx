"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Field, Input, Select } from "@/app/_components/ui";
import { TurnstileWidget } from "@/app/_components/turnstile-widget";
import type { FormState } from "@/lib/form-state";

const INITIAL: FormState = {};

/**
 * The countries the first hosts and their guests are in. Kenya leads because
 * it is where the platform starts; the list grows as the reach does.
 */
const DIALLING_CODES = ["+254", "+255", "+256", "+250", "+251", "+234", "+27", "+44", "+1"];

export type CredentialsMode = "register" | "login";

/**
 * Signing up and signing in are the same card with a different field set, so
 * they share the layout, the error handling and the pending state.
 */
export function CredentialsForm({
  mode,
  action,
  submitLabel,
  next,
  googleHref,
  footer,
}: {
  mode: CredentialsMode;
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  next: string;
  /** Absent when this deployment has no Google credentials configured. */
  googleHref?: string;
  footer: { prompt: string; label: string; href: string };
}) {
  const [state, formAction] = useActionState(action, INITIAL);

  return (
    <div className="w-full max-w-[594px] rounded-2xl bg-white p-6 sm:p-8">
      <h2 className="text-xl font-semibold text-black">Enter your details</h2>
      <span aria-hidden className="mt-4 block h-px w-full bg-rule/60" />

      <form action={formAction} className="mt-5 flex flex-col gap-5">
        <input type="hidden" name="next" value={next} />
        <TurnstileWidget action={mode === "register" ? "register" : "login"} />

        {mode === "register" ? (
          <>
            <Field label="Email" htmlFor="email" error={state.fieldErrors?.email}>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="e.g., Aminawanjiku@protonmail.com"
                className="bg-white"
              />
            </Field>

            <Field
              label="Phone Number"
              htmlFor="phone"
              error={state.fieldErrors?.phone}
            >
              <div className="grid grid-cols-[104px_minmax(0,1fr)] gap-3">
                <Select
                  name="diallingCode"
                  defaultValue="+254"
                  aria-label="Country dialling code"
                  className="bg-white"
                >
                  {DIALLING_CODES.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </Select>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel-national"
                  placeholder="7638392033"
                  className="bg-white"
                />
              </div>
            </Field>
          </>
        ) : (
          <Field
            label="Email/ Phone Number"
            htmlFor="identifier"
            error={state.fieldErrors?.identifier}
          >
            <Input
              id="identifier"
              name="identifier"
              autoComplete="username"
              required
              placeholder="e.g., Amina Wanjiku"
              className="bg-white"
            />
          </Field>
        )}

        <Field label="Password" htmlFor="password" error={state.fieldErrors?.password}>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            required
            placeholder="•••••••••••"
            className="bg-white"
          />
        </Field>

        {state.message ? (
          <p role="alert" className="text-sm text-ember">
            {state.message}
          </p>
        ) : null}

        <SubmitButton label={submitLabel} />
      </form>

      {googleHref ? (
        <>
          <p className="mt-6 flex items-center gap-4 text-sm text-muted">
            <span aria-hidden className="h-px flex-1 bg-rule/60" />
            Or
            <span aria-hidden className="h-px flex-1 bg-rule/60" />
          </p>

          <a
            href={googleHref}
            className="mx-auto mt-6 flex w-full max-w-[410px] items-center justify-center gap-3 rounded-full border border-rule bg-white px-6 py-3 text-base font-medium text-black transition-colors hover:bg-ivory"
          >
            <GoogleMark />
            Continue with Google
          </a>
        </>
      ) : null}

      <p className="mt-6 text-center text-base text-ink/80">
        {footer.prompt}{" "}
        <Link href={footer.href} className="text-ember underline underline-offset-4">
          {footer.label}
        </Link>
      </p>
    </div>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-forest px-6 py-4 text-base font-medium text-bright transition-colors hover:bg-forest-deep disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "One moment…" : label}
    </button>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5 shrink-0" aria-hidden>
      <path
        fill="#4285F4"
        d="M45.1 24.5c0-1.6-.1-3.2-.4-4.7H24v8.9h11.8c-.5 2.7-2 5.1-4.4 6.6v5.5h7.1c4.1-3.8 6.6-9.4 6.6-16.3Z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.9 0 10.9-2 14.5-5.3l-7.1-5.5c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.5-3.8-12.2-9H4.5v5.7C8.1 41.2 15.5 46 24 46Z"
      />
      <path
        fill="#FBBC05"
        d="M11.8 28.3a13.2 13.2 0 0 1 0-8.6v-5.7H4.5a22 22 0 0 0 0 20l7.3-5.7Z"
      />
      <path
        fill="#EA4335"
        d="M24 9.5c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 2.9 29.9 1 24 1 15.5 1 8.1 5.8 4.5 12.9l7.3 5.7c1.7-5.2 6.5-9.1 12.2-9.1Z"
      />
    </svg>
  );
}
