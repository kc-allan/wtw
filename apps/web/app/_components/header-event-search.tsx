"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { findEvent } from "@/lib/find-event-actions";
import type { FormState } from "@/lib/form-state";

const INITIAL: FormState = {};

export function HeaderEventSearch({ open, onOpenChange }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction] = useActionState(findEvent, INITIAL);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;

    inputRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  return (
    <div className={`shrink-0 transition-[width] duration-300 ease-out motion-reduce:transition-none ${open
      ? "fixed top-[88px] left-3 z-50 w-[calc(100vw-24px)] lg:static lg:w-[min(48vw,560px)]"
      : "w-11"}`}>
      {open ? (
        <form action={formAction} className="flex min-w-0 items-center gap-2 rounded-lg border border-forest bg-white p-1.5 shadow-sm">
          <label htmlFor="header-event-lookup" className="sr-only">Invitation link or code</label>
          <input
            ref={inputRef}
            id="header-event-lookup"
            name="lookup"
            required
            autoComplete="off"
            placeholder="Paste an invitation link or enter its code"
            className="min-w-0 flex-1 bg-transparent px-3 py-2 text-base text-ink outline-none placeholder:text-muted/80"
          />
          <SearchSubmit />
          <button type="button" onClick={() => onOpenChange(false)} aria-label="Close invitation lookup"
            className="flex size-10 shrink-0 items-center justify-center rounded-md text-ink hover:bg-ivory focus-visible:outline-2 focus-visible:outline-forest">
            <CloseIcon />
          </button>
          {state.message ? <p role="alert" className="absolute top-full left-0 mt-2 w-full rounded bg-white px-3 py-2 text-sm text-ember shadow">{state.message}</p> : null}
        </form>
      ) : (
        <button type="button" onClick={() => onOpenChange(true)} aria-label="Find an invitation" title="Find an invitation"
          className="flex size-11 items-center justify-center rounded-lg text-forest transition-colors hover:bg-ivory focus-visible:outline-2 focus-visible:outline-forest">
          <SearchIcon />
        </button>
      )}
    </div>
  );
}

function SearchSubmit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-label="Open invitation" title="Open invitation"
      className="flex size-10 shrink-0 items-center justify-center rounded-md bg-forest text-bright transition-colors hover:bg-forest-deep disabled:opacity-60">
      <SearchIcon />
    </button>
  );
}

function SearchIcon() {
  return <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
    <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.8" />
    <path d="m16 16 4.2 4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>;
}

function CloseIcon() {
  return <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
    <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>;
}
