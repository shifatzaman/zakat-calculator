// Conversion factors: how many grams per 1 unit of each type
// Derived from Zakat-Gold-Conversions.csv:
//   1 Tola = 1 Vori = 11.664 Gram
//   1 Vori = 16 Ana  =>  1 Ana = 11.664/16 Gram
//   1 Vori = 96 Rotti  =>  1 Rotti = 11.664/96 Gram
//   1 Ana = 6 Rotti (consistent)
//   1 Rotti = 10 Point  =>  1 Point = 11.664/960 Gram
//   1 Tola = 3.746 Ounce  =>  1 Ounce = 11.664/3.746 Gram
//   31.10348 Gram = 1 Troy Ounce
//   1000 Gram = 1 Kg

export const goldUnits = [
  "Tola",
  "Vori",
  "Ana",
  "Rotti",
  "Point",
  "Gram",
  "Ounce",
  "Troy Ounce",
  "Kg",
] as const;

export type GoldUnit = (typeof goldUnits)[number];

export const gramsPerUnit: Record<GoldUnit, number> = {
  Tola: 11.664,
  Vori: 11.664,
  Ana: 11.664 / 16,       // 0.729
  Rotti: 11.664 / 96,     // 0.1215
  Point: 11.664 / 960,    // 0.01215
  Gram: 1,
  Ounce: 11.664 / 3.746,  // ~3.113
  "Troy Ounce": 31.10348,
  Kg: 1000,
};

export function convertToGrams(amount: number, unit: GoldUnit): number {
  return amount * gramsPerUnit[unit];
}
