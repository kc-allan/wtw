"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button, Field, Textarea } from "@/app/_components/ui";
import { TurnstileWidget } from "@/app/_components/turnstile-widget";
import type { FormState } from "@/lib/form-state";
import { addGuests } from "./guest-actions";

const INITIAL: FormState = {};

export function AddGuests({ eventId }: { eventId: string }) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const action = addGuests.bind(null, eventId);
  const [state, formAction] = useActionState(action, INITIAL);

  // `showModal` gives the focus trap, Escape handling and inert background
  // that a hand-rolled overlay would have to reimplement.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)} className="px-5 py-2.5">
        Add guests
      </Button>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        aria-labelledby="add-guests-title"
        className="m-auto w-[min(560px,calc(100vw-2rem))] rounded-2xl bg-white p-8 backdrop:bg-black/40"
      >
        <h2 id="add-guests-title" className="font-serif text-xl font-semibold text-black">
          Add guests
        </h2>
        <p className="mt-1 text-base text-ink/70">
          One per line. Add a group after a comma, like{" "}
          <span className="whitespace-nowrap">Amina Wanjiku, Bride&rsquo;s family</span>.
        </p>

        <form
          action={(formData) => {
            formAction(formData);
            setOpen(false);
          }}
          className="mt-5 flex flex-col gap-4"
        >
          <TurnstileWidget action="guest_add" />
          <Field label="Guests" htmlFor="guests">
            <Textarea
              id="guests"
              name="guests"
              rows={8}
              required
              placeholder={"Amina Wanjiku, Bride's family\nBrian Otieno, Groom's family\nKip Kirui, Friends"}
              className="bg-white"
            />
          </Field>

          {state.message ? (
            <p role="alert" className="text-sm text-ember">
              {state.message}
            </p>
          ) : null}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="quiet" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <SubmitButton />
          </div>
        </form>
      </dialog>
    </>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Adding…" : "Add guests"}
    </Button>
  );
}
