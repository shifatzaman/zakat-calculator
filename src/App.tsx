import { useState, useEffect } from "react";
import type { AssetItem, ZakatSummary } from "./types";
import type { Currency, ExchangeRates } from "./data/currencies";
import { currencies, fetchExchangeRates } from "./data/currencies";
import { goldTypes } from "./data/goldPrices";
import AssetItemForm from "./components/AssetItemForm";
import ResultsDisplay from "./components/ResultsDisplay";
import { calculateZakat } from "./calculate";
import { generateZakatPDF } from "./generatePDF";

function createEmptyItem(): AssetItem {
  return {
    id: crypto.randomUUID(),
    type: "savings",
    label: "",
    amount: 0,
    currency: "BDT",
  };
}

function createGoldItem(): AssetItem {
  return {
    id: crypto.randomUUID(),
    type: "gold",
    label: "",
    amount: 0,
    currency: "BDT",
    goldType: goldTypes[0],
    goldMeasurements: [{ unit: "Vori", amount: 0 }],
  };
}

export default function App() {
  const [items, setItems] = useState<AssetItem[]>([createEmptyItem()]);
  const [outputCurrency, setOutputCurrency] = useState<Currency>("BDT");
  const [summary, setSummary] = useState<ZakatSummary | null>(null);

  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [ratesIsLive, setRatesIsLive] = useState(false);
  const [ratesLastUpdated, setRatesLastUpdated] = useState("");
  const [ratesLoading, setRatesLoading] = useState(true);

  useEffect(() => {
    fetchExchangeRates().then(({ rates, isLive, lastUpdated }) => {
      setRates(rates);
      setRatesIsLive(isLive);
      setRatesLastUpdated(lastUpdated);
      setRatesLoading(false);
    });
  }, []);

  const updateItem = (index: number, updated: AssetItem) => {
    setItems((prev) => prev.map((it, i) => (i === index ? updated : it)));
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCalculate = () => {
    if (!rates) return;
    const validItems = items.filter((it) => {
      if (it.type === "gold") {
        return (it.goldMeasurements ?? []).some((m) => m.amount > 0);
      }
      return it.amount > 0;
    });
    if (validItems.length === 0) return;
    setSummary(calculateZakat(validItems, outputCurrency, rates));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-emerald-700 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold tracking-tight">Zakat Calculator</h1>
          <p className="text-emerald-200 mt-1">Calculate your annual Zakat with ease</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Exchange rate status */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${
                ratesLoading
                  ? "bg-yellow-400 animate-pulse"
                  : ratesIsLive
                    ? "bg-green-500"
                    : "bg-orange-400"
              }`}
            />
            <span className="text-xs text-gray-500">
              {ratesLoading
                ? "Fetching live rates..."
                : ratesIsLive
                  ? `Live rates (${ratesLastUpdated})`
                  : "Using fallback rates (API unavailable)"}
            </span>
          </div>
        </div>

        {/* Output currency selector */}
        <div className="mb-6 flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">
            Final Zakat currency:
          </label>
          <select
            value={outputCurrency}
            onChange={(e) => setOutputCurrency(e.target.value as Currency)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
          >
            {currencies.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Asset items */}
        <div className="space-y-4">
          {items.map((item, i) => (
            <AssetItemForm
              key={item.id}
              item={item}
              onChange={(updated) => updateItem(i, updated)}
              onRemove={() => removeItem(i)}
            />
          ))}
        </div>

        {/* Add buttons */}
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => setItems((prev) => [...prev, createEmptyItem()])}
            className="bg-white border-2 border-dashed border-emerald-300 hover:border-emerald-500 text-emerald-600 hover:text-emerald-700 font-medium py-2.5 px-5 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Asset
          </button>
          <button
            onClick={() => setItems((prev) => [...prev, createGoldItem()])}
            className="bg-white border-2 border-dashed border-amber-300 hover:border-amber-500 text-amber-600 hover:text-amber-700 font-medium py-2.5 px-5 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Gold
          </button>
        </div>

        {/* Calculate button */}
        <div className="mt-8">
          <button
            onClick={handleCalculate}
            disabled={items.length === 0 || ratesLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold py-3.5 px-8 rounded-xl text-lg transition-colors shadow-md hover:shadow-lg cursor-pointer"
          >
            {ratesLoading ? "Loading rates..." : "Calculate Zakat"}
          </button>
        </div>

        {/* Results */}
        {summary && (
          <ResultsDisplay
            summary={summary}
            onGeneratePDF={() => generateZakatPDF(summary)}
          />
        )}

        {/* Footer note */}
        <p className="mt-10 text-center text-xs text-gray-400">
          Gold prices are in BDT per gram. Currency rates fetched live from open.er-api.com.
          Consult a scholar for Zakat rulings.
        </p>
      </main>
    </div>
  );
}
