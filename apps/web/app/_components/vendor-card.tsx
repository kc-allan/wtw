import Link from "next/link";
import { EVENT_TYPES } from "@wtw/shared";
import { formatMoney } from "@/lib/money";
import type { VendorSummary } from "@/lib/types";

export function VendorCard({ vendor }: { vendor: VendorSummary }) {
  const place = [vendor.city, vendor.county].filter(Boolean)[0];

  return (
    <li className="overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/vendors/${vendor.slug}`} className="block">
        <div className="relative">
          {vendor.coverImageUrl ? (
            /* Vendors supply their own artwork, from hosts we do not control. */
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={vendor.coverImageUrl}
              alt=""
              className="h-45 w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div aria-hidden className="h-45 w-full bg-forest" />
          )}

          {/* Everyone listed has been through review; that is what the mark means. */}
          <span className="absolute bottom-3 left-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm text-ink">
            <CheckMark />
            Verified
          </span>
        </div>

        <div className="p-5">
          <h3 className="text-lg font-semibold text-black">{vendor.name}</h3>
          {place ? <p className="mt-0.5 text-base text-muted">{place}</p> : null}

          {vendor.priceFrom !== null ? (
            <p className="mt-3 text-base text-black">
              <span className="font-semibold">
                {formatMoney(vendor.priceFrom, vendor.currency)}
              </span>{" "}
              <span className="text-muted">to start</span>
            </p>
          ) : (
            <p className="mt-3 text-base text-muted">Ask for a quote</p>
          )}

          {vendor.eventTypes.length > 0 ? (
            <ul className="mt-4 flex flex-wrap gap-2">
              {vendor.eventTypes.slice(0, 3).map((key) => (
                <li
                  key={key}
                  className="rounded-full bg-canvas px-3 py-1 text-sm text-ink/80"
                >
                  {EVENT_TYPES[key].plural}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Link>
    </li>
  );
}

function CheckMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-forest" fill="none" aria-hidden>
      <path
        d="m5 12.5 4.5 4.5L19 7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
