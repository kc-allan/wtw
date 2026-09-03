"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/app/_data/landing";
import { MobileNav } from "./mobile-nav";
import { Wordmark } from "./wordmark";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="relative z-40 w-full border-b border-rule/40">
      <div className="mx-auto w-full max-w-[1392px] px-3 py-4">
        <div className="flex items-center justify-between gap-6">
          <Wordmark className="min-w-0 flex-1" />

          <div className="hidden items-center gap-8 lg:flex">
            <nav aria-label="Main">
              <ul className="flex items-center gap-[15px]">
                {navLinks.map((link) => {
                  const isCurrent =
                    link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        aria-current={isCurrent ? "page" : undefined}
                        className={`flex items-center justify-center px-3 py-2 text-base font-medium whitespace-nowrap ${
                          isCurrent
                            ? "text-ember underline decoration-[1.2px] underline-offset-4"
                            : "text-black"
                        }`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/sign-in"
                className="flex items-center justify-center rounded-[10px] border border-forest px-3 py-2 text-base font-medium whitespace-nowrap text-forest"
              >
                Sign in
              </Link>
              <Link
                href="/create"
                className="flex items-center justify-center rounded-[10px] bg-forest px-3 py-2 text-base font-medium whitespace-nowrap text-bright"
              >
                Create your event
              </Link>
            </div>
          </div>

          <MobileNav />
        </div>
      </div>
    </header>
  );
}
