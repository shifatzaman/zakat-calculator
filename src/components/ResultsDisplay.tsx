import type { ZakatSummary, ZakatResult } from "../types";
import { formatCurrency } from "../data/currencies";

interface Props {
  summary: ZakatSummary;
  onGeneratePDF: () => void;
}

const typeLabels: Record<string, string> = {
  savings: "Savings",
  cash: "Cash",
  stock: "Stock",
  gold: "Gold",
};

const typeBgColors: Record<string, string> = {
  savings: "bg-blue-100 text-blue-700",
  cash: "bg-green-100 text-green-700",
  stock: "bg-purple-100 text-purple-700",
  gold: "bg-amber-100 text-amber-700",
};

function AssetRow({ r, i }: { r: ZakatResult; i: number }) {
  const isGold = r.assetType === "gold";
  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="py-3 px-4 text-sm text-gray-500">{i + 1}</td>
      <td className="py-3 px-4">
        <span className="font-medium text-gray-800">{r.label || "Untitled"}</span>
      </td>
      <td className="py-3 px-4">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeBgColors[r.assetType]}`}>
          {typeLabels[r.assetType]}
        </span>
      </td>
      <td className="py-3 px-4 text-sm text-gray-700">
        {isGold ? (
          <div className="space-y-0.5">
            {(r.goldMeasurements ?? []).map((m, mi) => (
              <div key={mi}>
                <span className="font-medium">{m.amount}</span>{" "}
                <span className="text-gray-500">{m.unit}</span>
              </div>
            ))}
          </div>
        ) : (
          <span>{formatCurrency(r.inputAmount, r.inputCurrency)}</span>
        )}
      </td>
      {/* Gold details or currency */}
      <td className="py-3 px-4 text-sm text-gray-700">
        {isGold ? (
          <div>
            <span className="font-medium">{r.goldType}</span>
            <span className="text-gray-400 mx-1">|</span>
            <span>{r.gramsOfGold?.toFixed(2)} g</span>
          </div>
        ) : (
          <span className="text-gray-400">{r.inputCurrency}</span>
        )}
      </td>
      <td className="py-3 px-4 text-sm text-right font-medium text-gray-800">
        {isGold
          ? formatCurrency(r.totalGoldValueBDT!, "BDT")
          : formatCurrency(r.inputAmount, r.inputCurrency)}
      </td>
    </tr>
  );
}

function ZakatBreakdownRow({
  r,
  i,
  outputCurrency,
}: {
  r: ZakatResult;
  i: number;
  outputCurrency: string;
}) {
  return (
    <div className="px-6 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-gray-700">{i + 1}.</span>
            <span className="font-semibold text-gray-800">{r.label || "Untitled"}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeBgColors[r.assetType]}`}>
              {typeLabels[r.assetType]}
            </span>
          </div>
          {/* Step-by-step explanation */}
          <div className="bg-gray-50 rounded-lg p-3 mt-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Step-by-step</p>
            {r.explanation.split("\n").map((line, li) => (
              <div key={li} className="flex items-start gap-2 text-sm text-gray-700 font-mono leading-relaxed">
                <span className="text-emerald-500 mt-0.5 shrink-0">&#8594;</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="text-right shrink-0 pt-1">
          <p className="text-xs text-gray-500">Zakat</p>
          <p className="text-lg font-bold text-emerald-700">
            {formatCurrency(r.zakatInOutputCurrency, outputCurrency as any)}
          </p>
          {r.inputCurrency !== outputCurrency && (
            <p className="text-xs text-gray-400 mt-0.5">
              ({formatCurrency(r.zakatInInputCurrency, r.inputCurrency)})
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResultsDisplay({ summary, onGeneratePDF }: Props) {
  const goldItems = summary.results.filter((r) => r.assetType === "gold");
  const nonGoldItems = summary.results.filter((r) => r.assetType !== "gold");

  return (
    <div className="mt-8 space-y-6">
      {/* ── Section 1: Assets Overview ── */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gray-800 px-6 py-4">
          <h2 className="text-lg font-bold text-white">Your Assets</h2>
          <p className="text-gray-400 text-sm mt-0.5">
            {summary.results.length} item{summary.results.length !== 1 ? "s" : ""} declared
            {" | "}
            {summary.calculatedAt.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Non-gold assets table */}
        {nonGoldItems.length > 0 && (
          <div>
            <div className="px-6 pt-4 pb-2">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Cash, Savings & Stocks</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="py-2 px-4 text-xs font-semibold text-gray-500 uppercase">#</th>
                    <th className="py-2 px-4 text-xs font-semibold text-gray-500 uppercase">Label</th>
                    <th className="py-2 px-4 text-xs font-semibold text-gray-500 uppercase">Type</th>
                    <th className="py-2 px-4 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                    <th className="py-2 px-4 text-xs font-semibold text-gray-500 uppercase">Currency</th>
                    <th className="py-2 px-4 text-xs font-semibold text-gray-500 uppercase text-right">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {nonGoldItems.map((r, i) => (
                    <AssetRow key={r.itemId} r={r} i={i} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Gold assets table */}
        {goldItems.length > 0 && (
          <div className={nonGoldItems.length > 0 ? "border-t border-gray-200" : ""}>
            <div className="px-6 pt-4 pb-2">
              <h3 className="text-sm font-bold text-amber-600 uppercase tracking-wide">Gold Assets</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 bg-amber-50/50">
                    <th className="py-2 px-4 text-xs font-semibold text-gray-500 uppercase">#</th>
                    <th className="py-2 px-4 text-xs font-semibold text-gray-500 uppercase">Label</th>
                    <th className="py-2 px-4 text-xs font-semibold text-gray-500 uppercase">Type</th>
                    <th className="py-2 px-4 text-xs font-semibold text-gray-500 uppercase">Quantity</th>
                    <th className="py-2 px-4 text-xs font-semibold text-gray-500 uppercase">Gold / Weight</th>
                    <th className="py-2 px-4 text-xs font-semibold text-gray-500 uppercase text-right">Value (BDT)</th>
                  </tr>
                </thead>
                <tbody>
                  {goldItems.map((r, i) => (
                    <AssetRow key={r.itemId} r={r} i={i} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Section 2: Zakat Breakdown ── */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-emerald-600 px-6 py-4">
          <h2 className="text-lg font-bold text-white">Zakat Breakdown</h2>
          <p className="text-emerald-100 text-sm mt-0.5">
            2.5% on each asset &middot; Output in {summary.outputCurrency}
          </p>
        </div>

        <div className="divide-y divide-gray-100">
          {summary.results.map((r, i) => (
            <ZakatBreakdownRow
              key={r.itemId}
              r={r}
              i={i}
              outputCurrency={summary.outputCurrency}
            />
          ))}
        </div>

        {/* Total */}
        <div className="bg-emerald-50 border-t-2 border-emerald-200 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-gray-800">Total Zakat Due</span>
              <p className="text-xs text-gray-500 mt-0.5">Sum of all items in {summary.outputCurrency}</p>
            </div>
            <span className="text-2xl font-bold text-emerald-700">
              {formatCurrency(summary.totalZakat, summary.outputCurrency)}
            </span>
          </div>
        </div>

        {/* PDF Button */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onGeneratePDF}
            className="w-full md:w-auto bg-gray-800 hover:bg-gray-900 text-white font-medium py-2.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
            </svg>
            Download PDF Report
          </button>
        </div>
      </div>
    </div>
  );
}
