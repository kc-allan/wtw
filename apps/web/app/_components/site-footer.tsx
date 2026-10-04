import Image from "next/image";
import Link from "next/link";
import { footerColumns, legalLinks } from "@/app/_data/landing";
import { Wordmark } from "./wordmark";

export function SiteFooter() {
  return (
    <footer className="w-full bg-forest px-6 py-10">
      <div className="mx-auto flex w-full max-w-336 flex-col gap-18 px-6">
        <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-end md:gap-6">
          <div className="flex w-full max-w-114 flex-col gap-5">
            <Wordmark tone="light" className="w-37" />
            <p className="text-base tracking-[0.02em] text-chalk">
              Africa&rsquo;s digital platform for celebration. Create. Invite.
              Manage. Celebrate.
            </p>
          </div>

          <div className="flex flex-wrap gap-10 md:gap-6">
            {footerColumns.map((column) => (
              <div
                key={column.heading}
                className="flex w-30 flex-col gap-5 text-base tracking-[0.02em] text-chalk"
              >
                <h2 className="font-semibold">{column.heading}</h2>
                <ul className="flex flex-col gap-4">
                  {column.links.map((link) => (
                    <li className="" key={link.href}>
                      <Link href={link.href}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <span aria-hidden className="h-px w-full bg-rule-inverse" />

        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Image
              src="/icons/copyright.svg"
              alt=""
              width={24}
              height={24}
              unoptimized
              className="size-6"
            />
            <p className="flex flex-wrap items-center gap-4 text-base tracking-[0.02em] text-chalk">
              <span>2026 Worth The Wait.</span>
              <span>Nairobi, Kenya.</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-base tracking-[0.02em] text-chalk">
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
            <span>M-Pesa &amp; Card accepted</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
