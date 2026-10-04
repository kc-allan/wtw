/**
 * Amounts are stored in the minor unit of their currency, the way every money
 * column in the schema holds them, so they are whole numbers all the way from
 * the database to here and only become decimal at the moment of display.
 */
export function formatMoney(minorUnits: number, currency: string): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(minorUnits / 100);
}
