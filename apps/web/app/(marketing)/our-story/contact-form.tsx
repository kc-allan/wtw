"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { EVENT_TYPES, ALL_EVENT_TYPE_KEYS } from "@wtw/shared";
import { Button, Field, Input, Select, Textarea } from "@/app/_components/ui";
import { sendEnquiry, type ContactFormState } from "./actions";

const INITIAL: ContactFormState = { status: "idle" };

export function ContactForm() {
  const [state, action] = useActionState(sendEnquiry, INITIAL);

  if (state.status === "sent") {
    return (
      <div
        role="status"
        className="mx-auto w-full max-w-190 rounded-2xl border border-rule p-8 text-center"
      >
        <h3 className="font-serif text-xl font-semibold text-black">Thank you</h3>
        <p className="mt-2 text-base text-ink/80">
          We have your message and will come back to you on the details you left.
        </p>
      </div>
    );
  }

  return (
    <form
      action={action}
      className="mx-auto flex w-full max-w-190 flex-col gap-5 rounded-2xl border-2 border-rule p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" htmlFor="contact-name" error={state.fieldErrors?.name}>
          <Input
            id="contact-name"
            name="name"
            required
            autoComplete="name"
            placeholder="e.g., Amina Wanjiku"
            aria-describedby={state.fieldErrors?.name ? "contact-name-error" : undefined}
          />
        </Field>

        <Field label="Phone or email" htmlFor="contact-contact" error={state.fieldErrors?.contact}>
          <Input
            id="contact-contact"
            name="contact"
            required
            placeholder="e.g., 0712XXXXX23"
            aria-describedby={state.fieldErrors?.contact ? "contact-contact-error" : undefined}
          />
        </Field>
      </div>

      <Field label="What are you planning" htmlFor="contact-planning">
        <Select id="contact-planning" name="planning" defaultValue="">
          <option value="">e.g., Wedding</option>
          {ALL_EVENT_TYPE_KEYS.map((key) => (
            <option key={key} value={key}>
              {EVENT_TYPES[key].name}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Tell us more" htmlFor="contact-message" error={state.fieldErrors?.message}>
        <Textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          placeholder="e.g., When is it and how can we help"
          aria-describedby={state.fieldErrors?.message ? "contact-message-error" : undefined}
        />
      </Field>

      {state.message ? (
        <p role="alert" className="text-sm text-ember">
          {state.message}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}

/** Split out so `useFormStatus` reads this form's own pending state. */
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Sending…" : "Send message"}
    </Button>
  );
}
