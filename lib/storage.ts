import { toAmount } from "./calc";
import type { CurrencyCode, SalesRow, Settings, Sheet } from "./types";

const STORAGE_KEY = "waluku.sales-sheet.v1";

export const DEFAULT_SETTINGS: Settings = {
  ratePerSale: 30,
  currency: "USD",
  reportTitle: "Sales Commission Sheet",
  period: "",
};

/** Example data matching the reference spreadsheet. */
export const EXAMPLE_ROWS: SalesRow[] = [
  { id: "example-enda", campaign: "GARONG", salesName: "Enda", clicks: 50, sales: 3 },
  { id: "example-asep", campaign: "GARONG", salesName: "Asep", clicks: 50, sales: 6 },
  { id: "example-udin", campaign: "GARONG", salesName: "Udin", clicks: 10, sales: 1 },
];

export function createRow(): SalesRow {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `row-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    campaign: "",
    salesName: "",
    clicks: 0,
    sales: 0,
  };
}

export function createExampleSheet(): Sheet {
  return {
    rows: EXAMPLE_ROWS.map((row) => ({ ...row })),
    settings: { ...DEFAULT_SETTINGS },
  };
}

function isCurrency(value: unknown): value is CurrencyCode {
  return value === "USD" || value === "IDR";
}

function sanitizeRow(value: unknown, index: number): SalesRow | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Partial<SalesRow>;
  return {
    id:
      typeof row.id === "string" && row.id.length > 0
        ? row.id
        : `row-${index}-${Date.now()}`,
    campaign: typeof row.campaign === "string" ? row.campaign : "",
    salesName: typeof row.salesName === "string" ? row.salesName : "",
    clicks: toAmount(row.clicks ?? 0),
    sales: toAmount(row.sales ?? 0),
  };
}

function sanitizeSettings(value: unknown): Settings {
  if (!value || typeof value !== "object") return { ...DEFAULT_SETTINGS };
  const settings = value as Partial<Settings>;
  return {
    ratePerSale: toAmount(settings.ratePerSale ?? DEFAULT_SETTINGS.ratePerSale),
    currency: isCurrency(settings.currency) ? settings.currency : "USD",
    reportTitle:
      typeof settings.reportTitle === "string" && settings.reportTitle.trim()
        ? settings.reportTitle
        : DEFAULT_SETTINGS.reportTitle,
    period: typeof settings.period === "string" ? settings.period : "",
  };
}

export function loadSheet(): Sheet {
  if (typeof window === "undefined") return createExampleSheet();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createExampleSheet();
    const parsed = JSON.parse(raw) as Partial<Sheet>;
    if (!Array.isArray(parsed.rows)) return createExampleSheet();
    const rows = parsed.rows
      .map((row, index) => sanitizeRow(row, index))
      .filter((row): row is SalesRow => row !== null);
    return { rows, settings: sanitizeSettings(parsed.settings) };
  } catch {
    return createExampleSheet();
  }
}

export function saveSheet(sheet: Sheet): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sheet));
  } catch {
    // Storage can be full or disabled; the app keeps working in memory.
  }
}

export function clearStoredSheet(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
}
