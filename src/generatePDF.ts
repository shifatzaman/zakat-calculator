import { jsPDF } from "jspdf";
import type { ZakatSummary, ZakatResult } from "./types";
import { formatCurrency } from "./data/currencies";

const typeLabels: Record<string, string> = {
  savings: "Savings",
  cash: "Cash",
  stock: "Stock",
  gold: "Gold",
};

export function generateZakatPDF(summary: ZakatSummary): void {
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();
  const left = 20;
  const right = pw - 20;
  let y = 20;

  const checkPage = (needed: number) => {
    if (y + needed > 272) {
      doc.addPage();
      y = 20;
    }
  };

  const drawDivider = (color: [number, number, number] = [16, 185, 129]) => {
    doc.setDrawColor(...color);
    doc.setLineWidth(0.5);
    doc.line(left, y, right, y);
    y += 8;
  };

  const dateStr = summary.calculatedAt.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // ── Title ──
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Zakat Calculation Report", pw / 2, y, { align: "center" });
  y += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Calculated on: ${dateStr}  |  Output currency: ${summary.outputCurrency}`, pw / 2, y, { align: "center" });
  doc.setTextColor(0);
  y += 10;
  drawDivider();

  // ══════════════════════════════════════
  // SECTION 1: ASSETS OVERVIEW
  // ══════════════════════════════════════
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text("1. Your Assets", left, y);
  y += 4;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`${summary.results.length} item(s) declared`, left, y);
  doc.setTextColor(0);
  y += 8;

  const goldItems = summary.results.filter((r) => r.assetType === "gold");
  const nonGoldItems = summary.results.filter((r) => r.assetType !== "gold");

  // ── Non-gold table ──
  if (nonGoldItems.length > 0) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60);
    doc.text("Cash, Savings & Stocks", left, y);
    doc.setTextColor(0);
    y += 6;

    // Table header
    const cols = [left, left + 8, left + 55, left + 85, left + 115, right];
    doc.setFillColor(245, 245, 245);
    doc.rect(left, y - 3.5, right - left, 6, "F");
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100);
    doc.text("#", cols[0], y);
    doc.text("Label", cols[1], y);
    doc.text("Type", cols[2], y);
    doc.text("Amount", cols[3], y);
    doc.text("Currency", cols[4], y);
    doc.text("Value", cols[5], y, { align: "right" });
    doc.setTextColor(0);
    y += 6;

    nonGoldItems.forEach((r, i) => {
      checkPage(8);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`${i + 1}`, cols[0], y);
      doc.text(truncate(r.label || "Untitled", 28), cols[1], y);
      doc.text(typeLabels[r.assetType], cols[2], y);
      doc.text(formatNum(r.inputAmount), cols[3], y);
      doc.text(r.inputCurrency, cols[4], y);
      doc.setFont("helvetica", "bold");
      doc.text(formatCurrency(r.inputAmount, r.inputCurrency), cols[5], y, { align: "right" });
      doc.setFont("helvetica", "normal");
      y += 6;
    });
    y += 4;
  }

  // ── Gold table ──
  if (goldItems.length > 0) {
    checkPage(30);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(180, 120, 0);
    doc.text("Gold Assets", left, y);
    doc.setTextColor(0);
    y += 6;

    const cols = [left, left + 8, left + 50, left + 75, left + 100, left + 125, right];
    doc.setFillColor(255, 251, 235);
    doc.rect(left, y - 3.5, right - left, 6, "F");
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100);
    doc.text("#", cols[0], y);
    doc.text("Label", cols[1], y);
    doc.text("Gold Type", cols[2], y);
    doc.text("Quantity", cols[3], y);
    doc.text("Weight (g)", cols[4], y);
    doc.text("Rate/g", cols[5], y);
    doc.text("Value (BDT)", cols[6], y, { align: "right" });
    doc.setTextColor(0);
    y += 6;

    goldItems.forEach((r, i) => {
      const measurementLines = (r.goldMeasurements ?? []).length;
      checkPage(6 + measurementLines * 5);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`${i + 1}`, cols[0], y);
      doc.text(truncate(r.label || "Untitled", 22), cols[1], y);
      doc.text(r.goldType ?? "", cols[2], y);
      // Quantity: show first measurement on header row, rest below
      const ms = r.goldMeasurements ?? [];
      if (ms.length > 0) {
        doc.text(`${ms[0].amount} ${ms[0].unit}`, cols[3], y);
      }
      doc.text(r.gramsOfGold?.toFixed(2) ?? "", cols[4], y);
      doc.text(formatNum(r.pricePerGram ?? 0), cols[5], y);
      doc.setFont("helvetica", "bold");
      doc.text(formatCurrency(r.totalGoldValueBDT!, "BDT"), cols[6], y, { align: "right" });
      doc.setFont("helvetica", "normal");
      y += 5;
      // Additional measurement lines
      for (let mi = 1; mi < ms.length; mi++) {
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(`+ ${ms[mi].amount} ${ms[mi].unit}`, cols[3], y);
        doc.setTextColor(0);
        y += 4;
      }
      y += 2;
    });
    y += 4;
  }

  // ══════════════════════════════════════
  // SECTION 2: ZAKAT BREAKDOWN
  // ══════════════════════════════════════
  checkPage(20);
  drawDivider();

  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text("2. Zakat Breakdown", left, y);
  y += 4;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`2.5% on each asset  |  Output in ${summary.outputCurrency}`, left, y);
  doc.setTextColor(0);
  y += 10;

  summary.results.forEach((r, i) => {
    checkPage(35);
    renderZakatItem(doc, r, i, summary, left, right);
  });

  // ── TOTAL ──
  checkPage(25);
  y += 2;
  drawDivider([16, 120, 80]);

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text("Total Zakat Due", left, y);
  doc.setTextColor(16, 120, 80);
  doc.text(formatCurrency(summary.totalZakat, summary.outputCurrency), right, y, { align: "right" });
  y += 6;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Sum of all items in ${summary.outputCurrency}`, left, y);
  y += 12;

  // Footer
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(150);
  doc.text(
    "This report is for informational purposes. Please consult a scholar for Zakat rulings.",
    pw / 2,
    280,
    { align: "center" }
  );

  doc.save(`zakat-report-${dateStr.replace(/\s+/g, "-")}.pdf`);

  // ── Helper to render one zakat item ──
  function renderZakatItem(
    doc: jsPDF,
    r: ZakatResult,
    i: number,
    summary: ZakatSummary,
    left: number,
    right: number
  ) {
    // Item header line
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text(`${i + 1}. ${r.label || "Untitled"} (${typeLabels[r.assetType]})`, left, y);

    doc.setTextColor(16, 120, 80);
    doc.text(formatCurrency(r.zakatInOutputCurrency, summary.outputCurrency), right, y, { align: "right" });
    y += 6;

    // Original currency note if different
    if (r.inputCurrency !== summary.outputCurrency) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(130);
      doc.text(`(${formatCurrency(r.zakatInInputCurrency, r.inputCurrency)} in original currency)`, right, y, { align: "right" });
      y += 5;
    }

    // Step-by-step explanation
    doc.setFontSize(9);
    doc.setFont("courier", "normal");
    doc.setTextColor(80);
    r.explanation.split("\n").forEach((line) => {
      checkPage(6);
      doc.text(`  -> ${line}`, left + 3, y);
      y += 5;
    });
    y += 5;
  }
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + "..." : s;
}

function formatNum(n: number): string {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}
