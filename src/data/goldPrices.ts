// Gold prices per gram in BDT (from GoldPrices.json)
export const goldPrices: Record<string, number> = {
  "18k": 15272,
  "21k": 17815.95,
  "22k": 18662.55,
  "Sonaton": 12437.55,
  "Srilankan": 11875.30,
};

export const goldTypes = Object.keys(goldPrices);
