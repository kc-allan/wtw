import { formatMoney } from "@/lib/money";
import type { RegistryItem, ThemePalette } from "@/lib/types";
import { ClaimGift } from "./claim-gift";

export interface CashGiftMethod {
  kind: "mobile_money" | "bank" | "international";
  label: string;
  detail?: string;
}

/**
 * How guests give. A host may offer a list of gifts, the details for sending
 * money, or both — nothing is handled on their behalf either way, so the
 * section shows what the couple wrote and gets out of the road.
 */
export function GiftingSection({
  slug,
  token,
  heading,
  note,
  methods,
  items,
  currency,
  palette,
}: {
  slug: string;
  token?: string;
  heading: string;
  note?: string;
  methods: CashGiftMethod[];
  items: RegistryItem[];
  currency: string;
  palette: ThemePalette;
}) {
  if (methods.length === 0 && items.length === 0) return null;

  return (
    <section
      id="registry"
      aria-labelledby="registry-heading"
      className="scroll-mt-20 px-6 py-12"
      style={{ backgroundColor: palette.surface, color: palette.ink }}
    >
      <div className="mx-auto w-full max-w-[860px]">
        <h2
          id="registry-heading"
          className="text-center font-serif text-section font-semibold"
          style={{ color: palette.ink }}
        >
          {heading}
        </h2>

        {note ? (
          <p
            className="mx-auto mt-3 max-w-[640px] text-center text-base whitespace-pre-line"
            style={{ color: palette.muted }}
          >
            {note}
          </p>
        ) : null}

        {methods.length > 0 ? (
          <ul className="mt-8 flex flex-wrap justify-center gap-4">
            {methods.map((method) => (
              <li
                key={`${method.label}-${method.detail ?? ""}`}
                className="flex min-w-[220px] items-center gap-3 rounded-xl border px-5 py-4"
                style={{ borderColor: palette.accent }}
              >
                <MethodIcon kind={method.kind} />
                <span>
                  <span className="block text-base" style={{ color: palette.ink }}>
                    {method.label}
                  </span>
                  {method.detail ? (
                    <span className="block text-sm" style={{ color: palette.muted }}>
                      {method.detail}
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        {items.length > 0 ? (
          <ul className="mt-10 grid gap-5 sm:grid-cols-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col rounded-xl border p-5"
                style={{ borderColor: palette.accent }}
              >
                <h3 className="text-lg font-semibold" style={{ color: palette.ink }}>
                  {item.name}
                </h3>
                {item.description ? (
                  <p className="mt-1 text-base" style={{ color: palette.muted }}>
                    {item.description}
                  </p>
                ) : null}

                <p className="mt-3 text-base" style={{ color: palette.ink }}>
                  {item.price !== null ? formatMoney(item.price, currency) : "Any amount"}
                </p>

                <p className="mt-1 text-sm" style={{ color: palette.muted }}>
                  {remaining(item) > 0
                    ? `${remaining(item)} of ${item.quantity} still needed`
                    : "Taken care of"}
                </p>

                <div className="mt-4">
                  <ClaimGift
                    slug={slug}
                    token={token}
                    item={item}
                    remaining={remaining(item)}
                    palette={palette}
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

function remaining(item: RegistryItem): number {
  return Math.max(0, item.quantity - item.quantityClaimed);
}

function MethodIcon({ kind }: { kind: CashGiftMethod["kind"] }) {
  const paths: Record<CashGiftMethod["kind"], string> = {
    mobile_money: "M8 3h8v18H8V3Zm3 15h2",
    bank: "M4 10h16M6 10v8m5-8v8m2-8v8m5-8v8M3 21h18M12 3l9 5H3l9-5Z",
    international: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 0c3 3 3 15 0 18M3 12h18",
  };

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 opacity-70" fill="none" aria-hidden>
      <path
        d={paths[kind]}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
