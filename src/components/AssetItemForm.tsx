import type { AssetItem, AssetType, GoldMeasurement } from "../types";
import type { Currency } from "../data/currencies";
import type { GoldUnit } from "../data/goldConversions";
import { currencies } from "../data/currencies";
import { goldTypes } from "../data/goldPrices";
import { goldUnits } from "../data/goldConversions";

interface Props {
  item: AssetItem;
  onChange: (item: AssetItem) => void;
  onRemove: () => void;
}

const assetTypes: { value: AssetType; label: string }[] = [
  { value: "savings", label: "Savings" },
  { value: "cash", label: "Cash" },
  { value: "stock", label: "Stock" },
  { value: "gold", label: "Gold" },
];

function defaultMeasurement(): GoldMeasurement {
  return { unit: "Vori", amount: 0 };
}

export default function AssetItemForm({ item, onChange, onRemove }: Props) {
  const isGold = item.type === "gold";
  const measurements = item.goldMeasurements ?? [defaultMeasurement()];

  const updateMeasurement = (index: number, field: "unit" | "amount", value: string | number) => {
    const updated = measurements.map((m, i) =>
      i === index
        ? { ...m, [field]: field === "amount" ? (parseFloat(value as string) || 0) : value }
        : m
    );
    onChange({ ...item, goldMeasurements: updated });
  };

  const addMeasurement = () => {
    // Pick a unit not yet used, or default to "Gram"
    const usedUnits = new Set(measurements.map((m) => m.unit));
    const nextUnit = goldUnits.find((u) => !usedUnits.has(u)) ?? "Gram";
    onChange({
      ...item,
      goldMeasurements: [...measurements, { unit: nextUnit as GoldUnit, amount: 0 }],
    });
  };

  const removeMeasurement = (index: number) => {
    if (measurements.length <= 1) return;
    onChange({
      ...item,
      goldMeasurements: measurements.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="relative bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <button
        onClick={onRemove}
        className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
        title="Remove item"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Type</label>
          <select
            value={item.type}
            onChange={(e) =>
              onChange({
                ...item,
                type: e.target.value as AssetType,
                goldType: e.target.value === "gold" ? goldTypes[0] : undefined,
                goldMeasurements: e.target.value === "gold" ? [defaultMeasurement()] : undefined,
                currency: e.target.value === "gold" ? "BDT" : item.currency,
              })
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          >
            {assetTypes.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Label */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Label</label>
          <input
            type="text"
            value={item.label}
            onChange={(e) => onChange({ ...item, label: e.target.value })}
            placeholder="e.g. Bank savings, Necklace"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
        </div>

        {/* Gold Type (if gold) */}
        {isGold && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-1">Gold Type</label>
            <select
              value={item.goldType || goldTypes[0]}
              onChange={(e) => onChange({ ...item, goldType: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              {goldTypes.map((gt) => (
                <option key={gt} value={gt}>{gt}</option>
              ))}
            </select>
          </div>
        )}

        {/* Gold measurements (if gold) */}
        {isGold && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Gold Quantity
              <span className="text-xs text-gray-400 font-normal ml-1">(add multiple units for mixed amounts)</span>
            </label>
            <div className="space-y-2">
              {measurements.map((m, mi) => (
                <div key={mi} className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={m.amount || ""}
                    onChange={(e) => updateMeasurement(mi, "amount", e.target.value)}
                    placeholder="0"
                    className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  />
                  <select
                    value={m.unit}
                    onChange={(e) => updateMeasurement(mi, "unit", e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  >
                    {goldUnits.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                  {measurements.length > 1 && (
                    <button
                      onClick={() => removeMeasurement(mi)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="Remove unit"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={addMeasurement}
              className="mt-2 text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add another unit
            </button>
          </div>
        )}

        {/* Amount (non-gold only) */}
        {!isGold && (
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Amount (money)</label>
            <input
              type="number"
              min="0"
              step="any"
              value={item.amount || ""}
              onChange={(e) => onChange({ ...item, amount: parseFloat(e.target.value) || 0 })}
              placeholder="e.g. 100000"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>
        )}

        {/* Currency (non-gold only) */}
        {!isGold && (
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Currency</label>
            <select
              value={item.currency}
              onChange={(e) => onChange({ ...item, currency: e.target.value as Currency })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              {currencies.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
