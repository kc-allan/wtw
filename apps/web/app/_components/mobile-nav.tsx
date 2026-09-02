"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { navLinks } from "@/app/_data/landing";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex size-11 items-center justify-center rounded-[10px] border border-forest text-forest"
      >
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        <span aria-hidden className="relative block h-3.5 w-5">
          <span
            className={`absolute inset-x-0 top-0 h-px bg-current transition-transform ${
              open ? "translate-y-[6.5px] rotate-45" : ""
            }`}
          />
          <span
            className={`absolute inset-x-0 top-[6.5px] h-px bg-current transition-opacity ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`absolute inset-x-0 bottom-0 h-px bg-current transition-transform ${
              open ? "-translate-y-[6.5px] -rotate-45" : ""
            }`}
          />
        </span>
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute inset-x-0 top-full z-50 mt-2 border-y border-rule bg-canvas px-6 py-6"
      >
        <nav aria-label="Main">
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const isCurrent = link.href === "/";
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isCurrent ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={`block py-2 text-base font-medium ${
                      isCurrent ? "text-ember" : "text-black"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="mt-4 flex flex-col gap-3">
          <Link
            href="/sign-in"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center rounded-[10px] border border-forest px-3 py-2 text-base font-medium text-forest"
          >
            Sign in
          </Link>
          <Link
            href="/create"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center rounded-[10px] bg-forest px-3 py-2 text-base font-medium text-bright"
          >
            Create your event
          </Link>
        </div>
      </div>
    </div>
  );
}
