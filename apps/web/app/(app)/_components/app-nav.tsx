"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { label: "My events", href: "/events" },
  { label: "Guests", href: "/guests" },
  { label: "Invitations", href: "/invitations" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="hidden sm:block">
      <ul className="flex items-center gap-6">
        {LINKS.map((link) => {
          // `/events` would otherwise light up for every event sub-page.
          const isCurrent =
            link.href === "/events" ? pathname === "/events" : pathname.startsWith(link.href);


          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isCurrent ? "page" : undefined}
                className={`text-base font-medium whitespace-nowrap ${
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
  );
}
