"use client";

import { useState } from "react";
import {
  computeTotals,
  formatCurrency,
  formatNumber,
  rowRevenue,
  toAmount,
} from "@/lib/calc";
import type { SalesRow, Settings } from "@/lib/types";

type SalesTableProps = {
  rows: SalesRow[];
  settings: Settings;
  lastAddedId: string | null;
  onUpdate: (id: string, patch: Partial<Omit<SalesRow, "id">>) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
};

const fieldClass =
  "w-full min-w-0 rounded-md border border-transparent bg-transparent px-2 py-1.5 text-sm text-ink outline-none transition-colors placeholder:text-muted/45 hover:border-line/20 focus:border-line/50 focus:bg-white focus:ring-2 focus:ring-peach";

const numberFieldClass = `${fieldClass} text-right tabular-nums`;

export function SalesTable({
  rows,
  settings,
  lastAddedId,
  onUpdate,
  onRemove,
  onAdd,
}: SalesTableProps) {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const totals = computeTotals(rows, settings);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="bg-peach/80 text-[11px] uppercase tracking-[0.14em] text-ink/80">
            <th
              scope="col"
              className="border-b border-line/15 px-4 py-3 text-left font-semibold"
            >
              Campaign
            </th>
            <th
              scope="col"
              className="w-28 border-b border-line/15 px-4 py-3 text-right font-semibold"
            >
              Clicks
            </th>
            <th
              scope="col"
              className="w-24 border-b border-line/15 px-4 py-3 text-right font-semibold"
            >
              Sales
            </th>
            <th
              scope="col"
              className="w-32 border-b border-line/15 px-4 py-3 text-right font-semibold"
            >
              Revenue
            </th>
            <th className="relative w-24 border-b border-line/15 px-3 py-3">
              <span className="sr-only">Row actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="bg-sky/70 text-ink">
            <th
              scope="row"
              className="border-b border-line/15 px-4 py-3 text-left font-semibold"
            >
              TOTAL
            </th>
            <td className="border-b border-line/15 px-4 py-3 text-right font-semibold tabular-nums">
              {formatNumber(totals.clicks)}
            </td>
            <td className="border-b border-line/15 px-4 py-3 text-right font-semibold tabular-nums">
              {formatNumber(totals.sales)}
            </td>
            <td className="border-b border-line/15 px-4 py-3 text-right font-semibold tabular-nums">
              {formatCurrency(totals.revenue, settings.currency)}
            </td>
            <td className="border-b border-line/15 px-3 py-3" />
          </tr>

          {rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center">
                <p className="text-sm font-medium text-ink">
                  No campaign rows yet
                </p>
                <p className="mx-auto mt-1 max-w-sm text-xs text-muted">
                  Add a row to start logging clicks and sales for each rep.
                </p>
                <button
                  type="button"
                  onClick={onAdd}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-line/20 bg-white px-3 py-1.5 text-xs font-medium text-ink transition hover:border-line/40 hover:bg-paper"
                >
                  + Add row
                </button>
              </td>
            </tr>
          ) : null}

          {rows.map((row, index) => {
            const label = `${row.campaign.trim() || "Campaign"} (${
              row.salesName.trim() || "sales rep"
            })`;
            return (
              <tr
                key={row.id}
                className="border-b border-line/10 transition-colors last:border-b-0 hover:bg-paper/70"
              >
                <td className="px-2 py-1.5">
                  <div className="flex max-w-[340px] items-center gap-0.5">
                    <input
                      value={row.campaign}
                      onChange={(event) =>
                        onUpdate(row.id, { campaign: event.target.value })
                      }
                      placeholder="GARONG"
                      aria-label={`Campaign product, row ${index + 1}`}
                      autoFocus={row.id === lastAddedId}
                      className={`${fieldClass} w-[48%] font-medium`}
                    />
                    <span aria-hidden="true" className="text-muted/70">
                      (
                    </span>
                    <input
                      value={row.salesName}
                      onChange={(event) =>
                        onUpdate(row.id, { salesName: event.target.value })
                      }
                      placeholder="Enda"
                      aria-label={`Sales name, row ${index + 1}`}
                      className={`${fieldClass} w-[40%]`}
                    />
                    <span aria-hidden="true" className="text-muted/70">
                      )
                    </span>
                  </div>
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    value={row.clicks}
                    onChange={(event) =>
                      onUpdate(row.id, { clicks: toAmount(event.target.value) })
                    }
                    onFocus={(event) => event.currentTarget.select()}
                    aria-label={`Clicks, ${label}`}
                    className={numberFieldClass}
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    value={row.sales}
                    onChange={(event) =>
                      onUpdate(row.id, { sales: toAmount(event.target.value) })
                    }
                    onFocus={(event) => event.currentTarget.select()}
                    aria-label={`Sales, ${label}`}
                    className={numberFieldClass}
                  />
                </td>
                <td className="px-4 py-1.5 text-right font-medium tabular-nums">
                  {formatCurrency(rowRevenue(row, settings), settings.currency)}
                </td>
                <td className="px-3 py-1.5 text-right">
                  {pendingDeleteId === row.id ? (
                    <span className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          onRemove(row.id);
                          setPendingDeleteId(null);
                        }}
                        className="rounded-md bg-ink px-2 py-1 text-[11px] font-medium text-white transition hover:bg-ink/85"
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDeleteId(null)}
                        aria-label="Cancel delete"
                        className="rounded-md px-1.5 py-1 text-xs text-muted transition hover:bg-paper hover:text-ink"
                      >
                        ✕
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPendingDeleteId(row.id)}
                      aria-label={`Delete ${label}`}
                      title="Delete row"
                      className="rounded-md p-1.5 text-muted/60 transition hover:bg-white hover:text-ink"
                    >
                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        className="size-4"
                        aria-hidden="true"
                      >
                        <path d="M4 6h12M8 6V4.5h4V6M6 6l.7 9.2a1 1 0 0 0 1 .8h4.6a1 1 0 0 0 1-.8L14 6M8.5 9v4.5M11.5 9v4.5" />
                      </svg>
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
