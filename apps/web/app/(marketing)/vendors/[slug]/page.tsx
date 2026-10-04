import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EVENT_TYPES, VENDOR_CATEGORIES } from "@wtw/shared";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import type { VendorProfile } from "@/lib/types";

function load(slug: string) {
  return api<VendorProfile>(`/vendors/${slug}`, { auth: false, revalidate: 300 }).catch(
    () => null,
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/vendors/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const vendor = await load(slug);
  if (!vendor) return { title: "Vendor — Worth the Wait" };

  return {
    title: `${vendor.name} — Worth the Wait`,
    description: vendor.tagline ?? vendor.description ?? undefined,
  };
}

/** wa.me wants the number without its plus or any spacing. */
function whatsappLink(number: string): string {
  return `https://wa.me/${number.replace(/\D/g, "")}`;
}

export default async function VendorProfilePage({ params }: PageProps<"/vendors/[slug]">) {
  const { slug } = await params;
  const vendor = await load(slug);
  if (!vendor) notFound();

  const place = [vendor.city, vendor.county].filter(Boolean).join(", ");
  const price =
    vendor.priceFrom === null
      ? null
      : formatMoney(vendor.priceFrom, vendor.currency);

  return (
    <main className="mx-auto w-full max-w-[1100px] px-6 py-10 sm:px-12">
      <Link
        href="/vendors"
        className="inline-flex items-center gap-2 text-base text-ink transition-opacity hover:opacity-70"
      >
        <span aria-hidden>&larr;</span> All vendors
      </Link>

      <div className="mt-6 overflow-hidden rounded-2xl bg-white">
        {vendor.coverImageUrl ? (
          /* Vendors supply their own artwork, from hosts we do not control. */
          // eslint-disable-next-line @next/next/no-img-element
          <img src={vendor.coverImageUrl} alt="" className="h-64 w-full object-cover" />
        ) : (
          <div aria-hidden className="h-64 w-full bg-forest" />
        )}

        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-3xl font-semibold text-black">{vendor.name}</h1>
              {place ? <p className="mt-1 text-base text-muted">{place}</p> : null}
              {vendor.tagline ? (
                <p className="mt-3 max-w-[640px] text-base text-ink/80">{vendor.tagline}</p>
              ) : null}
            </div>

            {price ? (
              <p className="text-base text-black">
                <span className="font-semibold">{price}</span>{" "}
                <span className="text-muted">to start</span>
              </p>
            ) : null}
          </div>

          <ul className="mt-6 flex flex-wrap gap-2">
            {vendor.categories.map((key) => (
              <li
                key={key}
                className="rounded-full bg-canvas px-4 py-1.5 text-sm text-ink/80"
              >
                {VENDOR_CATEGORIES[key].shortName}
              </li>
            ))}
            {vendor.eventTypes.map((key) => (
              <li
                key={key}
                className="rounded-full bg-blush px-4 py-1.5 text-sm text-ember"
              >
                {EVENT_TYPES[key].plural}
              </li>
            ))}
          </ul>

          {vendor.description ? (
            <p className="mt-6 max-w-[720px] text-base whitespace-pre-line text-ink/80">
              {vendor.description}
            </p>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            {vendor.whatsappNumber ? (
              <a
                href={whatsappLink(vendor.whatsappNumber)}
                target="_blank"
                rel="noreferrer noopener"
                className="rounded-full bg-forest px-6 py-3 text-base font-medium text-bright transition-colors hover:bg-forest-deep"
              >
                Message on WhatsApp
              </a>
            ) : null}
            {vendor.phone ? (
              <a
                href={`tel:${vendor.phone}`}
                className="rounded-full border border-forest px-6 py-3 text-base text-forest transition-colors hover:bg-forest/5"
              >
                Call
              </a>
            ) : null}
            {vendor.email ? (
              <a
                href={`mailto:${vendor.email}`}
                className="rounded-full border border-forest px-6 py-3 text-base text-forest transition-colors hover:bg-forest/5"
              >
                Email
              </a>
            ) : null}
            {vendor.websiteUrl ? (
              <a
                href={vendor.websiteUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="rounded-full border border-rule px-6 py-3 text-base text-ink transition-colors hover:bg-ivory"
              >
                Website
              </a>
            ) : null}
            {vendor.instagramUrl ? (
              <a
                href={vendor.instagramUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="rounded-full border border-rule px-6 py-3 text-base text-ink transition-colors hover:bg-ivory"
              >
                Instagram
              </a>
            ) : null}
          </div>
        </div>
      </div>

      {vendor.reviews.length > 0 ? (
        <section aria-labelledby="reviews" className="mt-10">
          <h2 id="reviews" className="text-xl font-semibold text-black">
            What couples said
          </h2>
          <ul className="mt-4 flex flex-col gap-4">
            {vendor.reviews.map((review) => (
              <li
                key={`${review.authorName}-${review.createdAt}`}
                className="rounded-2xl bg-white p-6"
              >
                <p className="text-base font-medium text-black">{review.authorName}</p>
                <p className="mt-1 text-sm text-gold">
                  {"★".repeat(Math.round(review.rating))}
                  <span className="sr-only">{review.rating} out of 5</span>
                </p>
                {review.body ? (
                  <p className="mt-2 text-base text-ink/80">{review.body}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
