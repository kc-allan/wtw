import type { Metadata } from "next";
import Link from "next/link";
import { VENDOR_CATEGORIES, VendorCategoryKey, isVendorCategoryKey } from "@wtw/shared";
import { api } from "@/lib/api";
import type { Paginated, VendorSummary } from "@/lib/types";
import { VendorCard } from "@/app/_components/vendor-card";

export const metadata: Metadata = {
  title: "Find a vendor — Worth the Wait",
  description:
    "Browse trusted vendors near you, see what they charge, and message them straight on WhatsApp.",
};

const PER_PAGE = 24;

/** Keeps the other filters in place when one of them changes. */
function withParams(
  current: { category?: string; county?: string; q?: string },
  change: Partial<{ category: string | null; county: string | null; q: string | null; page: number }>,
): string {
  const params = new URLSearchParams();
  const next = { ...current, ...change };
  for (const [key, value] of Object.entries(next)) {
    if (value !== null && value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  }
  const query = params.toString();
  return query ? `/vendors?${query}` : "/vendors";
}

export default async function VendorsPage({ searchParams }: PageProps<"/vendors">) {
  const params = await searchParams;

  const rawCategory = typeof params.category === "string" ? params.category : undefined;
  const category = rawCategory && isVendorCategoryKey(rawCategory) ? rawCategory : undefined;
  const county = typeof params.county === "string" ? params.county : undefined;
  const q = typeof params.q === "string" ? params.q : undefined;
  const page = Number(params.page) > 0 ? Number(params.page) : 1;

  const search = new URLSearchParams({ page: String(page), perPage: String(PER_PAGE) });
  if (category) search.set("category", category);
  if (county) search.set("county", county);
  if (q) search.set("q", q);

  const [vendors, counties] = await Promise.all([
    api<Paginated<VendorSummary>>(`/vendors?${search}`, {
      auth: false,
      revalidate: 300,
    }).catch(() => null),
    api<string[]>("/vendors/counties", { auth: false, revalidate: 3600 }).catch(
      () => [] as string[],
    ),
  ]);

  const active = { category, county, q };
  const selected = category ? VENDOR_CATEGORIES[category] : null;
  const noun = selected ? selected.shortName.toLowerCase() : "vendor";

  return (
    <main className="w-full">
      <header className="mx-auto w-full max-w-[1392px] px-6 pt-10 pb-8 text-center sm:px-12">
        <p className="text-base text-ember">Find a vendor</p>
        <h1 className="mt-2 text-3xl font-semibold text-black sm:text-section">
          Find the people who&rsquo;ll make it happen
        </h1>
        <p className="mx-auto mt-3 max-w-[720px] text-base text-ink/80">
          Browse trusted vendors near you, see what they charge, and message them straight
          on WhatsApp.
        </p>

        <nav aria-label="Vendor categories" className="mt-8">
          <ul className="flex flex-wrap justify-center gap-3">
            <li>
              <FilterPill href={withParams(active, { category: null, page: 1 })} active={!category}>
                All
              </FilterPill>
            </li>
            {Object.values(VENDOR_CATEGORIES).map((definition) => (
              <li key={definition.key}>
                <FilterPill
                  href={withParams(active, { category: definition.key, page: 1 })}
                  active={category === definition.key}
                >
                  {definition.shortName}
                </FilterPill>
              </li>
            ))}
          </ul>
        </nav>

        <form
          action="/vendors"
          className="mx-auto mt-6 flex w-full max-w-[1100px] flex-col gap-3 sm:flex-row"
        >
          {category ? <input type="hidden" name="category" value={category} /> : null}

          <label className="flex shrink-0 items-center gap-2 rounded-full border border-forest px-5 py-3 text-base text-ink">
            <FilterIcon />
            <span className="sr-only">Location</span>
            <select
              name="county"
              defaultValue={county ?? ""}
              className="cursor-pointer bg-transparent outline-none"
            >
              <option value="">Anywhere in Kenya</option>
              {counties.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-white px-6 py-3">
            <label htmlFor="vendor-search" className="sr-only">
              Search for a {noun}
            </label>
            <input
              id="vendor-search"
              name="q"
              defaultValue={q}
              placeholder={`Search for a ${noun}`}
              className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-muted"
            />
            <button type="submit" aria-label="Search" className="cursor-pointer text-ink">
              <SearchIcon />
            </button>
          </div>
        </form>
      </header>

      <div className="mx-auto w-full max-w-[1392px] px-6 pb-20 sm:px-12">
        {!vendors || vendors.data.length === 0 ? (
          <p className="rounded-2xl bg-white px-6 py-16 text-center text-base text-ink/70">
            {vendors
              ? "No vendors match that yet. Try another category or clear the search."
              : "The directory is unavailable just now. Please try again shortly."}
          </p>
        ) : (
          <>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {vendors.data.map((vendor) => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))}
            </ul>

            {vendors.meta.totalPages > 1 ? (
              <nav
                aria-label="Pagination"
                className="mt-10 flex items-center justify-center gap-4"
              >
                <PageLink
                  href={withParams(active, { page: page - 1 })}
                  disabled={page <= 1}
                >
                  Previous
                </PageLink>
                <p className="text-base text-ink/70">
                  Page {vendors.meta.page} of {vendors.meta.totalPages}
                </p>
                <PageLink
                  href={withParams(active, { page: page + 1 })}
                  disabled={page >= vendors.meta.totalPages}
                >
                  Next
                </PageLink>
              </nav>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}

function FilterPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={`inline-block rounded-full px-6 py-2.5 text-base whitespace-nowrap transition-colors ${
        active ? "bg-forest text-bright" : "bg-white text-ink hover:bg-ivory"
      }`}
    >
      {children}
    </Link>
  );
}

function PageLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="rounded-full border border-rule px-5 py-2 text-base text-muted">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="rounded-full border border-forest px-5 py-2 text-base text-forest transition-colors hover:bg-forest/5"
    >
      {children}
    </Link>
  );
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" aria-hidden>
      <path
        d="M4 7h16M7 12h10M10 17h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="m16.5 16.5 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
