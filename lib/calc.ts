import type {
  CurrencyCode,
  SalesRow,
  Settings,
  Totals,
} from "./types";

export const CURRENCIES: Record<
  CurrencyCode,
  { label: string; locale: string; symbol: string }
> = {
  USD: { label: "USD ($)", locale: "en-US", symbol: "$" },
  IDR: { label: "IDR (Rp)", locale: "id-ID", symbol: "Rp" },
};

/** Coerce user input into a non-negative finite number. */
export function toAmount(value: number | string): number {
  const parsed = typeof value === "number" ? value : Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return parsed;
}

export function rowRevenue(row: SalesRow, settings: Settings): number {
  return toAmount(row.sales) * toAmount(settings.ratePerSale);
}

export function computeTotals(rows: SalesRow[], settings: Settings): Totals {
  return rows.reduce<Totals>(
    (totals, row) => ({
      clicks: totals.clicks + toAmount(row.clicks),
      sales: totals.sales + toAmount(row.sales),
      revenue: totals.revenue + rowRevenue(row, settings),
    }),
    { clicks: 0, sales: 0, revenue: 0 },
  );
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCurrency(value: number, currency: CurrencyCode): string {
  return new Intl.NumberFormat(CURRENCIES[currency].locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: currency === "IDR" ? 0 : 2,
  }).format(value);
}

/** Display form used in tables and the PDF, e.g. "GARONG(Enda)". */
export function campaignLabel(row: SalesRow): string {
  const campaign = row.campaign.trim();
  const salesName = row.salesName.trim();
  if (campaign && salesName) return `${campaign}(${salesName})`;
  return campaign || salesName || "Untitled campaign";
}
