import type { Currency } from "./data/currencies";
import type { GoldUnit } from "./data/goldConversions";

export type AssetType = "savings" | "cash" | "stock" | "gold";

export interface GoldMeasurement {
  unit: GoldUnit;
  amount: number;
}

export interface AssetItem {
  id: string;
  type: AssetType;
  label: string;
  amount: number;
  currency: Currency;
  // Gold-specific fields
  goldType?: string;
  goldMeasurements?: GoldMeasurement[];
}

export interface ZakatResult {
  itemId: string;
  label: string;
  assetType: AssetType;
  inputAmount: number;
  inputCurrency: Currency;
  // For gold items
  goldType?: string;
  goldMeasurements?: GoldMeasurement[];
  goldMeasurementsSummary?: string; // e.g. "11 Ana, 2 Rotti, 3 Point"
  gramsOfGold?: number;
  pricePerGram?: number;
  totalGoldValueBDT?: number;
  // Calculated
  assetValueInInputCurrency: number;
  zakatInInputCurrency: number;
  zakatInOutputCurrency: number;
  explanation: string;
}

export interface ZakatSummary {
  results: ZakatResult[];
  outputCurrency: Currency;
  totalZakat: number;
  calculatedAt: Date;
}
