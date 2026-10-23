import {
  CURRENCIES,
  campaignLabel,
  computeTotals,
  formatCurrency,
  formatNumber,
} from "./calc";
import type { SalesRow, Settings } from "./types";

function formatGeneratedAt(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Builds a strictly black-and-white A4 commission sheet:
 * white background, black text and table rules, no colour fills.
 */
export async function createSheetPdf(rows: SalesRow[], settings: Settings) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentWidth = pageWidth - margin * 2;
  const totals = computeTotals(rows, settings);
  const generatedAt = new Date();

  const title = settings.reportTitle.trim() || "Sales Commission Sheet";
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.text(title, margin, 64);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const meta = [
    settings.period.trim() ? `Period: ${settings.period.trim()}` : "Period: -",
    `Rate per sale: ${formatCurrency(settings.ratePerSale, settings.currency)}`,
    `Currency: ${CURRENCIES[settings.currency].label}`,
  ];
  doc.text(meta.join("    |    "), margin, 86);
  doc.setFontSize(8.5);
  doc.text(`Generated: ${formatGeneratedAt(generatedAt)}`, margin, 101);

  const body: string[][] = [
    [
      "TOTAL",
      formatNumber(totals.clicks),
      formatNumber(totals.sales),
      formatCurrency(totals.revenue, settings.currency),
    ],
    ...rows.map((row) => [
      campaignLabel(row),
      formatNumber(row.clicks),
      formatNumber(row.sales),
      formatCurrency(row.sales * settings.ratePerSale, settings.currency),
    ]),
  ];

  autoTable(doc, {
    startY: 118,
    margin: { left: margin, right: margin, bottom: 56 },
    tableWidth: contentWidth,
    head: [["CAMPAIGN", "CLICKS", "SALES", "REVENUE"]],
    body,
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 10,
      cellPadding: { top: 7, right: 9, bottom: 7, left: 9 },
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.6,
      fillColor: [255, 255, 255],
      overflow: "linebreak",
      valign: "middle",
    },
    headStyles: {
      fontStyle: "bold",
      fontSize: 10,
      textColor: [0, 0, 0],
      fillColor: [255, 255, 255],
      lineWidth: 0.9,
      halign: "center",
    },
    bodyStyles: {
      textColor: [0, 0, 0],
      fillColor: [255, 255, 255],
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255],
    },
    columnStyles: {
      0: { cellWidth: contentWidth - 85 - 75 - 100, halign: "left" },
      1: { cellWidth: 85, halign: "right" },
      2: { cellWidth: 75, halign: "right" },
      3: { cellWidth: 100, halign: "right" },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.row.index === 0) {
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  const finalY =
    (
      doc as unknown as { lastAutoTable?: { finalY?: number } }
    ).lastAutoTable?.finalY ?? 118;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(
    "Revenue = sales x rate per sale. All amounts in the selected currency.",
    margin,
    Math.min(finalY + 18, pageHeight - 44),
  );

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setFontSize(8.5);
    doc.text(
      `Page ${page} of ${pageCount}`,
      pageWidth - margin,
      pageHeight - 28,
      { align: "right" },
    );
  }

  return doc;
}

export async function exportSheetPdf(
  rows: SalesRow[],
  settings: Settings,
): Promise<void> {
  const doc = await createSheetPdf(rows, settings);
  const stamp = new Date().toISOString().slice(0, 10);
  doc.save(`sales-commission-${stamp}.pdf`);
}
