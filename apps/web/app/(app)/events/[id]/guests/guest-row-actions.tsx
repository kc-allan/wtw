"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { Button, Field, Input, Textarea } from "@/app/_components/ui";
import type { FormState } from "@/lib/form-state";
import type { Guest } from "@/lib/types";
import { createGuestInvitationLink, removeGuest, updateGuest } from "./guest-actions";

const INITIAL: FormState = {};

export function GuestRowActions({ eventId, guest }: { eventId: string; guest: Guest }) {
  const [open, setOpen] = useState(false);
  const [shareState, setShareState] = useState<{ link?: string; message?: string }>({});
  const [pendingShare, startShare] = useTransition();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const action = updateGuest.bind(null, eventId, guest.id);
  const [state, formAction] = useActionState(action, INITIAL);
  const hasPrivateLink = guest.invitation !== null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-rule px-3 py-1.5 text-sm text-forest hover:bg-ivory"
      >
        Edit
      </button>
      <button
        type="button"
        disabled={pendingShare}
        onClick={() => {
          setShareState({});
          startShare(async () => {
            const result = await createGuestInvitationLink(eventId, guest.id, hasPrivateLink);
            setShareState({
              link: result.link,
              message: result.message,
            });
          });
        }}
        className="rounded-full border border-rule px-3 py-1.5 text-sm text-forest hover:bg-ivory disabled:opacity-60"
      >
        {pendingShare ? "Creating..." : hasPrivateLink ? "Replace link" : "Share link"}
      </button>

      {shareState.link ? (
        <p className="basis-full break-all rounded-lg bg-mint px-3 py-2 text-sm text-success">
          {shareState.link}
        </p>
      ) : null}
      {shareState.message ? (
        <p className="basis-full rounded-lg bg-blush px-3 py-2 text-sm text-ember">
          {shareState.message}
        </p>
      ) : null}

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        aria-labelledby={`edit-${guest.id}`}
        className="m-auto w-[min(560px,calc(100vw-2rem))] rounded-2xl bg-white p-8 backdrop:bg-black/40"
      >
        <h2 id={`edit-${guest.id}`} className="font-serif text-xl font-semibold text-black">
          Edit guest
        </h2>

        <form action={formAction} className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="First name" htmlFor={`first-${guest.id}`} error={state.fieldErrors?.firstName}>
            <Input
              id={`first-${guest.id}`}
              name="firstName"
              required
              defaultValue={guest.firstName}
              className="bg-white"
            />
          </Field>
          <Field label="Last name" htmlFor={`last-${guest.id}`}>
            <Input
              id={`last-${guest.id}`}
              name="lastName"
              defaultValue={guest.lastName ?? ""}
              className="bg-white"
            />
          </Field>
          <Field label="Email" htmlFor={`email-${guest.id}`}>
            <Input
              id={`email-${guest.id}`}
              name="email"
              type="email"
              defaultValue={guest.email ?? ""}
              className="bg-white"
            />
          </Field>
          <Field label="Phone" htmlFor={`phone-${guest.id}`}>
            <Input
              id={`phone-${guest.id}`}
              name="phone"
              type="tel"
              defaultValue={guest.phone ?? ""}
              className="bg-white"
            />
          </Field>
          <Field label="Group" htmlFor={`group-${guest.id}`}>
            <Input
              id={`group-${guest.id}`}
              name="groupLabel"
              defaultValue={guest.groupLabel ?? ""}
              className="bg-white"
            />
          </Field>
          <Field label="Party allowance" htmlFor={`party-${guest.id}`}>
            <Input
              id={`party-${guest.id}`}
              name="maxPartySize"
              type="number"
              min={1}
              max={20}
              defaultValue={guest.maxPartySize}
              className="bg-white"
            />
          </Field>
          <Field label="Notes" htmlFor={`notes-${guest.id}`} className="sm:col-span-2">
            <Textarea
              id={`notes-${guest.id}`}
              name="notes"
              rows={3}
              defaultValue={guest.notes ?? ""}
              className="bg-white"
            />
          </Field>

          {state.message ? (
            <p role="alert" className="text-sm text-ember sm:col-span-2">
              {state.message}
            </p>
          ) : null}

          <div className="flex flex-wrap justify-between gap-3 sm:col-span-2">
            <button
              type="button"
              onClick={() => {
                if (!window.confirm("Remove this guest?")) return;
                startShare(async () => {
                  await removeGuest(eventId, guest.id);
                  setOpen(false);
                });
              }}
              className="rounded-full border border-ember px-5 py-2.5 text-base text-ember"
            >
              Remove
            </button>
            <div className="flex gap-3">
              <Button type="button" variant="quiet" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <SaveButton />
            </div>
          </div>
        </form>
      </dialog>
    </div>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save"}</Button>;
}
