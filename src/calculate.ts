import type { AssetItem, GoldMeasurement, ZakatResult, ZakatSummary } from "./types";
import type { Currency, ExchangeRates } from "./data/currencies";
import { convertCurrency, formatCurrency } from "./data/currencies";
import { convertToGrams, gramsPerUnit } from "./data/goldConversions";
import { goldPrices } from "./data/goldPrices";

const ZAKAT_RATE = 0.025;

function formatMeasurementsSummary(measurements: GoldMeasurement[]): string {
  return measurements
    .filter((m) => m.amount > 0)
    .map((m) => `${m.amount} ${m.unit}`)
    .join(", ");
}

function calculateGoldItem(
  item: AssetItem,
  outputCurrency: Currency,
  rates: ExchangeRates
): ZakatResult {
  const goldType = item.goldType!;
  const measurements = (item.goldMeasurements ?? []).filter((m) => m.amount > 0);
  const pricePerGram = goldPrices[goldType];

  // Convert each measurement to grams and build explanation lines
  let totalGrams = 0;
  const conversionLines: string[] = [];

  for (const m of measurements) {
    const grams = convertToGrams(m.amount, m.unit);
    totalGrams += grams;
    conversionLines.push(
      `${m.amount} ${m.unit} x ${gramsPerUnit[m.unit].toFixed(4)} g/${m.unit} = ${grams.toFixed(4)} g`
    );
  }

  const totalValueBDT = totalGrams * pricePerGram;
  const zakatBDT = totalValueBDT * ZAKAT_RATE;
  const zakatInOutput = convertCurrency(zakatBDT, "BDT", outputCurrency, rates);

  const summary = formatMeasurementsSummary(measurements);

  // Build step-by-step explanation
  let explanation = "";
  if (measurements.length === 1) {
    explanation += conversionLines[0] + "\n";
  } else {
    explanation += conversionLines.join("\n") + "\n";
    explanation += `Total: ${totalGrams.toFixed(4)} grams\n`;
  }
  explanation +=
    `${totalGrams.toFixed(4)} g x ${formatCurrency(pricePerGram, "BDT")}/g (${goldType}) = ${formatCurrency(totalValueBDT, "BDT")}\n` +
    `Zakat = ${formatCurrency(totalValueBDT, "BDT")} x 2.5% = ${formatCurrency(zakatBDT, "BDT")}`;
  if (outputCurrency !== "BDT") {
    explanation += `\nConverted: ${formatCurrency(zakatInOutput, outputCurrency)}`;
  }

  return {
    itemId: item.id,
    label: item.label,
    assetType: "gold",
    inputAmount: 0,
    inputCurrency: "BDT",
    goldType,
    goldMeasurements: measurements,
    goldMeasurementsSummary: summary,
    gramsOfGold: totalGrams,
    pricePerGram,
    totalGoldValueBDT: totalValueBDT,
    assetValueInInputCurrency: totalValueBDT,
    zakatInInputCurrency: zakatBDT,
    zakatInOutputCurrency: zakatInOutput,
    explanation,
  };
}

function calculateNonGoldItem(
  item: AssetItem,
  outputCurrency: Currency,
  rates: ExchangeRates
): ZakatResult {
  const zakat = item.amount * ZAKAT_RATE;
  const zakatInOutput = convertCurrency(zakat, item.currency, outputCurrency, rates);

  const explanation =
    `${formatCurrency(item.amount, item.currency)} x 2.5% = ${formatCurrency(zakat, item.currency)}` +
    (item.currency !== outputCurrency
      ? `\nConverted: ${formatCurrency(zakatInOutput, outputCurrency)}`
      : "");

  return {
    itemId: item.id,
    label: item.label,
    assetType: item.type,
    inputAmount: item.amount,
    inputCurrency: item.currency,
    assetValueInInputCurrency: item.amount,
    zakatInInputCurrency: zakat,
    zakatInOutputCurrency: zakatInOutput,
    explanation,
  };
}

export function calculateZakat(
  items: AssetItem[],
  outputCurrency: Currency,
  rates: ExchangeRates
): ZakatSummary {
  const results = items.map((item) =>
    item.type === "gold"
      ? calculateGoldItem(item, outputCurrency, rates)
      : calculateNonGoldItem(item, outputCurrency, rates)
  );

  const totalZakat = results.reduce((sum, r) => sum + r.zakatInOutputCurrency, 0);

  return {
    results,
    outputCurrency,
    totalZakat,
    calculatedAt: new Date(),
  };
}
