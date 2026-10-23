export type CurrencyCode = "USD" | "IDR";

export type SalesRow = {
  id: string;
  campaign: string;
  salesName: string;
  clicks: number;
  sales: number;
};

export type Settings = {
  ratePerSale: number;
  currency: CurrencyCode;
  reportTitle: string;
  period: string;
};

export type Sheet = {
  rows: SalesRow[];
  settings: Settings;
};

export type Totals = {
  clicks: number;
  sales: number;
  revenue: number;
};
