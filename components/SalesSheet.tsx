"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { computeTotals, formatCurrency, formatNumber } from "@/lib/calc";
import { exportSheetPdf } from "@/lib/pdf";
import {
  createExampleSheet,
  createRow,
  loadSheet,
  saveSheet,
} from "@/lib/storage";
import type { SalesRow, Settings } from "@/lib/types";
import { SalesTable } from "./SalesTable";
import { SettingsDialog } from "./SettingsDialog";

type Toast = { kind: "success" | "error"; message: string };

export function SalesSheet() {
  const [rows, setRows] = useState<SalesRow[]>(() => createExampleSheet().rows);
  const [settings, setSettings] = useState<Settings>(
    () => createExampleSheet().settings,
  );
  const [hydrated, setHydrated] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    const stored = loadSheet();
    setRows(stored.rows);
    setSettings(stored.settings);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveSheet({ rows, settings });
  }, [rows, settings, hydrated]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const totals = useMemo(() => computeTotals(rows, settings), [rows, settings]);

  const updateRow = useCallback(
    (id: string, patch: Partial<Omit<SalesRow, "id">>) => {
      setRows((previous) =>
        previous.map((row) => (row.id === id ? { ...row, ...patch } : row)),
      );
    },
    [],
  );

  const addRow = useCallback(() => {
    const row = createRow();
    setRows((previous) => [...previous, row]);
    setLastAddedId(row.id);
  }, []);

  const removeRow = useCallback((id: string) => {
    setRows((previous) => previous.filter((row) => row.id !== id));
    setToast({ kind: "success", message: "Row removed." });
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportSheetPdf(rows, settings);
      setToast({ kind: "success", message: "PDF downloaded in black and white." });
    } catch (error) {
      console.error("PDF export failed", error);
      setToast({
        kind: "error",
        message: "Could not create the PDF. Please try again.",
      });
    } finally {
      setExporting(false);
    }
  };

  const applySettings = (next: Settings) => {
    setSettings(next);
    setSettingsOpen(false);
    setToast({ kind: "success", message: "Configuration saved." });
  };

  const loadExample = () => {
    const sheet = createExampleSheet();
    setRows(sheet.rows);
    setSettings(sheet.settings);
    setSettingsOpen(false);
    setToast({ kind: "success", message: "Example data loaded." });
  };

  const clearSheet = () => {
    setRows([]);
    setSettingsOpen(false);
    setToast({ kind: "success", message: "All rows cleared." });
  };

  const rowCount = rows.length;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:gap-7 lg:py-12">
      <header className="flex flex-col gap-5 border-b border-line/15 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
            <span className="inline-block size-1.5 rounded-full bg-ink" />
            Waluku
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-[2.1rem]">
            {settings.reportTitle}
          </h1>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted">
            Log each rep&apos;s campaign results, let the sheet total the
            numbers, then export a clean black-and-white PDF.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line/20 bg-white px-3.5 py-2 text-sm font-medium text-ink transition hover:border-line/40 hover:bg-paper"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4"
              aria-hidden="true"
            >
              <circle cx="10" cy="10" r="2.6" />
              <path d="M10 3.2v1.5M10 15.3v1.5M3.2 10h1.5M15.3 10h1.5M5.2 5.2l1.1 1.1M13.7 13.7l1.1 1.1M14.8 5.2l-1.1 1.1M6.3 13.7l-1.1 1.1" />
            </svg>
            Configuration
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-ink/90 disabled:cursor-wait disabled:opacity-70"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4"
              aria-hidden="true"
            >
              <path d="M10 3v8.5M6.8 8.7 10 12l3.2-3.3M4 14.5v1.3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1.3" />
            </svg>
            {exporting ? "Preparing…" : "Export PDF"}
          </button>
        </div>
      </header>

      <section
        aria-label="Summary"
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        <SummaryCard
          label="Total clicks"
          value={formatNumber(totals.clicks)}
          hint={rowCount === 1 ? "1 campaign row" : `${rowCount} campaign rows`}
        />
        <SummaryCard
          label="Total sales"
          value={formatNumber(totals.sales)}
          hint="Closed deals across all reps"
        />
        <SummaryCard
          label="Total revenue"
          value={formatCurrency(totals.revenue, settings.currency)}
          hint={`Sales × ${formatCurrency(settings.ratePerSale, settings.currency)} per sale`}
          accent
        />
        <SummaryCard
          label="Rate per sale"
          value={formatCurrency(settings.ratePerSale, settings.currency)}
          hint="Set in Configuration"
        />
      </section>

      <section className="min-w-0 overflow-hidden rounded-2xl border border-line/15 bg-white shadow-[0_1px_2px_rgba(25,22,18,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line/10 px-4 py-3.5 sm:px-5">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">
              Campaign results
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              Type directly into the cells. Revenue updates as you go.
            </p>
          </div>
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line/25 bg-white px-3 py-1.5 text-xs font-medium text-ink transition hover:border-line/50 hover:bg-paper"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              className="size-3.5"
              aria-hidden="true"
            >
              <path d="M10 4.5v11M4.5 10h11" />
            </svg>
            Add row
          </button>
        </div>

        <SalesTable
          rows={rows}
          settings={settings}
          lastAddedId={lastAddedId}
          onUpdate={updateRow}
          onRemove={removeRow}
          onAdd={addRow}
        />

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line/10 bg-paper/40 px-4 py-3 text-[11px] text-muted sm:px-5">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block size-1.5 rounded-full bg-emerald-600/70" />
            Saved automatically in this browser
          </span>
          <span>
            Revenue = sales × rate · PDF exports in strict black and white
          </span>
        </div>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-2 pb-2 text-[11px] text-muted/80">
        <span>
          Waluku · {settings.period.trim() || "No period set"} ·{" "}
          {settings.currency}
        </span>
        <span>Built with Next.js</span>
      </footer>

      {settingsOpen ? (
        <SettingsDialog
          settings={settings}
          rowCount={rowCount}
          onClose={() => setSettingsOpen(false)}
          onApply={applySettings}
          onLoadExample={loadExample}
          onClearSheet={clearSheet}
        />
      ) : null}

      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-line/20 bg-ink px-4 py-2 text-xs font-medium text-white shadow-lg"
        >
          <span
            aria-hidden="true"
            className={`inline-block size-1.5 rounded-full ${
              toast.kind === "success" ? "bg-emerald-400" : "bg-rose-400"
            }`}
          />
          {toast.message}
        </div>
      ) : null}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string;
  value: string;
  hint: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-4 py-3.5 ${
        accent
          ? "border-line/20 bg-peach/70"
          : "border-line/15 bg-white/85"
      }`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
        {label}
      </p>
      <p className="mt-1 text-[1.45rem] font-semibold leading-tight tracking-tight tabular-nums">
        {value}
      </p>
      <p className="mt-0.5 truncate text-[11px] text-muted">{hint}</p>
    </div>
  );
}
