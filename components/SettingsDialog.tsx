"use client";

import { useEffect, useState } from "react";
import { CURRENCIES, formatCurrency, toAmount } from "@/lib/calc";
import type { CurrencyCode, Settings } from "@/lib/types";

type SettingsDialogProps = {
  settings: Settings;
  rowCount: number;
  onClose: () => void;
  onApply: (settings: Settings) => void;
  onLoadExample: () => void;
  onClearSheet: () => void;
};

const labelClass =
  "text-[11px] font-semibold uppercase tracking-[0.14em] text-muted";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-line/20 bg-white px-3 py-2 text-sm text-ink outline-none transition placeholder:text-muted/50 focus:border-line/50 focus:ring-2 focus:ring-peach";

export function SettingsDialog({
  settings,
  rowCount,
  onClose,
  onApply,
  onLoadExample,
  onClearSheet,
}: SettingsDialogProps) {
  const [draft, setDraft] = useState<Settings>({ ...settings });
  const [confirmAction, setConfirmAction] = useState<"example" | "clear" | null>(
    null,
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const confirmCopy =
    confirmAction === "clear"
      ? `Remove all ${rowCount} rows from this sheet?`
      : "Replace the current sheet and configuration with the example data?";

  const handleConfirm = () => {
    if (confirmAction === "clear") {
      onClearSheet();
    } else if (confirmAction === "example") {
      onLoadExample();
    }
    setConfirmAction(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-[2px] sm:items-center sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-line/15 bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line/10 px-5 py-4 sm:px-6">
          <div>
            <h2
              id="settings-title"
              className="text-base font-semibold tracking-tight"
            >
              Configuration
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              How the sheet calculates revenue and exports the PDF.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close configuration"
            className="rounded-md p-1.5 text-muted transition hover:bg-paper hover:text-ink"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              className="size-4"
              aria-hidden="true"
            >
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 px-5 py-5 sm:px-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr]">
            <div>
              <label htmlFor="rate-per-sale" className={labelClass}>
                Rate per sale
              </label>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
                  {CURRENCIES[draft.currency].symbol}
                </span>
                <input
                  id="rate-per-sale"
                  type="number"
                  min={0}
                  step="any"
                  inputMode="decimal"
                  value={draft.ratePerSale}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      ratePerSale: toAmount(event.target.value),
                    })
                  }
                  onFocus={(event) => event.currentTarget.select()}
                  className={`${inputClass} pl-9 tabular-nums`}
                />
              </div>
            </div>
            <div>
              <label htmlFor="currency" className={labelClass}>
                Currency
              </label>
              <select
                id="currency"
                value={draft.currency}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    currency: event.target.value as CurrencyCode,
                  })
                }
                className={`${inputClass} mt-1.5`}
              >
                {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => (
                  <option key={code} value={code}>
                    {CURRENCIES[code].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="rounded-lg border border-line/10 bg-paper/70 px-3 py-2 text-xs leading-relaxed text-muted">
            Every row uses this single rate. Revenue is{" "}
            <span className="font-medium text-ink">
              sales × {formatCurrency(draft.ratePerSale, draft.currency)}
            </span>
            , and changing the rate recalculates the whole sheet and the PDF
            immediately.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1.6fr_1fr]">
            <div>
              <label htmlFor="report-title" className={labelClass}>
                Report title
              </label>
              <input
                id="report-title"
                type="text"
                value={draft.reportTitle}
                onChange={(event) =>
                  setDraft({ ...draft, reportTitle: event.target.value })
                }
                placeholder="Sales Commission Sheet"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="period" className={labelClass}>
                Period
              </label>
              <input
                id="period"
                type="text"
                value={draft.period}
                onChange={(event) =>
                  setDraft({ ...draft, period: event.target.value })
                }
                placeholder="e.g. October 2026"
                className={inputClass}
              />
            </div>
          </div>

          {confirmAction ? (
            <div className="rounded-lg border border-line/25 bg-paper px-3 py-3">
              <p className="text-xs font-medium text-ink">{confirmCopy}</p>
              <div className="mt-2.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="rounded-md bg-ink px-2.5 py-1.5 text-[11px] font-medium text-white transition hover:bg-ink/85"
                >
                  Yes, continue
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmAction(null)}
                  className="rounded-md px-2 py-1.5 text-[11px] font-medium text-muted transition hover:text-ink"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-2 border-t border-line/10 pt-4">
            <button
              type="button"
              onClick={() => setConfirmAction("example")}
              className="rounded-md px-2 py-1.5 text-xs font-medium text-muted underline decoration-line/25 underline-offset-4 transition hover:text-ink"
            >
              Load example data
            </button>
            <span className="text-line/20">|</span>
            <button
              type="button"
              onClick={() => setConfirmAction("clear")}
              className="rounded-md px-2 py-1.5 text-xs font-medium text-muted underline decoration-line/25 underline-offset-4 transition hover:text-ink"
            >
              Clear sheet
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-line/10 bg-paper/50 px-5 py-3.5 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-line/20 bg-white px-3.5 py-2 text-sm font-medium text-ink transition hover:border-line/40 hover:bg-paper"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onApply(draft)}
            className="rounded-lg bg-ink px-3.5 py-2 text-sm font-medium text-white transition hover:bg-ink/90"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
