import { Sparkles, TrendingDown, TrendingUp } from "lucide-react";

import type { InsightResponse } from "@/types/insight";

interface ExecutiveSummaryCardProps {
  result: InsightResponse["result"];
  snapshot: InsightResponse["digestSnapshot"];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ExecutiveSummaryCard({ result, snapshot }: ExecutiveSummaryCardProps) {
  const revenueChangePct =
    snapshot.revenuePrev7Days > 0
      ? ((snapshot.revenueLast7Days - snapshot.revenuePrev7Days) / snapshot.revenuePrev7Days) * 100
      : 0;
  const isRevenueUp = revenueChangePct >= 0;

  return (
    <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-emerald-50/40 p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h2 className="font-manrope text-base font-bold text-slate-900 sm:text-lg">
            Ringkasan Eksekutif AI
          </h2>
          <p className="text-xs text-slate-500">Dihasilkan otomatis dari data operasional</p>
        </div>
      </div>

      <p className="text-base font-semibold leading-relaxed text-slate-800 sm:text-lg">
        {result.headline}
      </p>

      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        {result.healthAssessment}
      </p>

      {/* Strip angka mentah untuk transparansi -- pengguna bisa verifikasi */}
      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-200/70 pt-4 sm:grid-cols-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Stok Menipis
          </p>
          <p className="text-base font-bold text-slate-800 sm:text-lg">
            {snapshot.lowStockCount} item
          </p>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Akan Kedaluwarsa
          </p>
          <p className="text-base font-bold text-slate-800 sm:text-lg">
            {snapshot.expiringSoonCount} batch
          </p>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Pendapatan 7 Hari
          </p>
          <div className="flex items-center gap-1.5">
            <p className="truncate text-base font-bold text-slate-800 sm:text-lg">
              {formatCurrency(snapshot.revenueLast7Days)}
            </p>
            <span
              className={`flex shrink-0 items-center text-[11px] font-bold ${
                isRevenueUp ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {isRevenueUp ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
            </span>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Produk Terlaris
          </p>
          <p className="truncate text-base font-bold text-slate-800 sm:text-lg">
            {snapshot.topSellingItem ?? "-"}
          </p>
        </div>
      </div>
    </div>
  );
}
