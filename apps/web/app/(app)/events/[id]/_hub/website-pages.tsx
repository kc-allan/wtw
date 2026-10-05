import Link from "next/link";
import type { EventModuleKey } from "@wtw/shared";

export interface WebsitePage {
  /** Anchor on the public page, which is also how it is opened. */
  anchor: string;
  label: string;
  moduleKey?: EventModuleKey;
}

/**
 * The pages a host's website is made of, each opening on the live site. The
 * list is the event's own enabled sections rather than a fixed menu, so it
 * never offers a page the visitor would not see.
 */
export function WebsitePages({
  pages,
  href,
  editHref,
}: {
  pages: WebsitePage[];
  /** The live page once published, the host's own preview before that. */
  href: string;
  editHref: string;
}) {
  return (
    <ul className="mt-2 overflow-hidden rounded-xl bg-white">
      {pages.map((page, index) => (
        <li key={page.anchor} className={index > 0 ? "border-t border-rule/40" : undefined}>
          <a
            href={`${href}#${page.anchor}`}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center justify-between gap-3 px-4 py-3 text-base text-ink transition-colors hover:bg-ivory"
          >
            {page.label}
            <OpenIcon />
          </a>
        </li>
      ))}
      <li className="border-t border-rule/40">
        <Link
          href={editHref}
          className="flex items-center justify-between gap-3 px-4 py-3 text-base text-forest transition-colors hover:bg-ivory"
        >
          Edit the content
          <OpenIcon />
        </Link>
      </li>
    </ul>
  );
}

function OpenIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 opacity-60" fill="none" aria-hidden>
      <path
        d="M14 4h6v6M20 4l-8 8M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
