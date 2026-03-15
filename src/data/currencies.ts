export const currencies = ["BDT", "USD", "EUR", "GBP", "SAR", "AED", "INR", "MYR"] as const;
export type Currency = (typeof currencies)[number];

export type ExchangeRates = Record<Currency, number>;

// Fallback rates: 1 unit of currency = X BDT
const FALLBACK_RATES: ExchangeRates = {
  BDT: 1,
  USD: 121.5,
  EUR: 132.0,
  GBP: 153.0,
  SAR: 32.4,
  AED: 33.1,
  INR: 1.46,
  MYR: 27.2,
};

/**
 * Fetch live exchange rates from open.er-api.com (free, no key needed).
 * Returns rates as "1 unit of currency = X BDT".
 * Falls back to hardcoded rates on failure.
 */
export async function fetchExchangeRates(): Promise<{
  rates: ExchangeRates;
  isLive: boolean;
  lastUpdated: string;
}> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/BDT");
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const data = await res.json();

    // data.rates gives: 1 BDT = X other currency
    // We need: 1 other currency = Y BDT  =>  Y = 1 / X
    const apiRates = data.rates as Record<string, number>;
    const rates: ExchangeRates = { BDT: 1 } as ExchangeRates;

    for (const cur of currencies) {
      if (cur === "BDT") continue;
      if (apiRates[cur]) {
        rates[cur] = 1 / apiRates[cur];
      } else {
        rates[cur] = FALLBACK_RATES[cur];
      }
    }

    return {
      rates,
      isLive: true,
      lastUpdated: data.time_last_update_utc ?? new Date().toISOString(),
    };
  } catch {
    return {
      rates: FALLBACK_RATES,
      isLive: false,
      lastUpdated: "N/A (using fallback rates)",
    };
  }
}

export function convertCurrency(
  amount: number,
  from: Currency,
  to: Currency,
  rates: ExchangeRates
): number {
  const inBDT = amount * rates[from];
  return inBDT / rates[to];
}

export function formatCurrency(amount: number, currency: Currency): string {
  return `${currency} ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
