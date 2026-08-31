import { ArrowDownCircle, Eye, PackagePlus } from "lucide-react";

import type { StockRecommendation } from "@/types/insight";

interface StockRecommendationsTableProps {
  recommendations: StockRecommendation[];
}

const ACTION_CONFIG: Record<
  StockRecommendation["action"],
  { label: string; className: string; icon: typeof PackagePlus }
> = {
  restock: {
    label: "Restock",
    className: "bg-blue-50 text-blue-700 border-blue-100",
    icon: PackagePlus,
  },
  reduce: {
    label: "Kurangi",
    className: "bg-orange-50 text-orange-700 border-orange-100",
    icon: ArrowDownCircle,
  },
  monitor: {
    label: "Pantau",
    className: "bg-slate-100 text-slate-600 border-slate-200",
    icon: Eye,
  },
};

function ActionBadge({ action }: { action: StockRecommendation["action"] }) {
  const config = ACTION_CONFIG[action];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${config.className}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

export function StockRecommendationsTable({ recommendations }: StockRecommendationsTableProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
      <div className="mb-4">
        <h3 className="font-manrope text-base font-bold text-slate-900 sm:text-lg">
          Rekomendasi Tindakan Stok
        </h3>
        <p className="mt-1 text-xs text-slate-400 sm:text-sm">
          Saran spesifik per item berdasarkan kondisi stok saat ini.
        </p>
      </div>

      {recommendations.length === 0 ? (
        <div className="py-10 text-center text-sm text-slate-400">
          Tidak ada rekomendasi khusus saat ini.
        </div>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[600px] text-left">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-3">Item</th>
                  <th className="pb-3">Tindakan</th>
                  <th className="pb-3">Alasan</th>
                  <th className="pb-3 text-right">Saran Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {recommendations.map((rec, i) => (
                  <tr key={i} className="hover:bg-slate-50/70">
                    <td className="py-3 font-bold text-slate-900">{rec.itemName}</td>
                    <td className="py-3">
                      <ActionBadge action={rec.action} />
                    </td>
                    <td className="max-w-xs py-3 text-slate-600">{rec.reason}</td>
                    <td className="py-3 text-right font-semibold text-slate-700">
                      {rec.suggestedQuantity != null
                        ? rec.suggestedQuantity.toLocaleString("id-ID")
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="space-y-2.5 sm:hidden">
            {recommendations.map((rec, i) => (
              <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-slate-900">{rec.itemName}</p>
                  <ActionBadge action={rec.action} />
                </div>
                <p className="text-xs leading-relaxed text-slate-600">{rec.reason}</p>
                {rec.suggestedQuantity != null && (
                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    Saran jumlah: {rec.suggestedQuantity.toLocaleString("id-ID")} unit
                  </p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
