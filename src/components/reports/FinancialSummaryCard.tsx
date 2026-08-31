import { ArrowDown, ArrowUp, PiggyBank } from "lucide-react";

import type { FinancialSummary } from "@/types/report";

interface FinancialSummaryCardProps {
  financial: FinancialSummary;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function Row({
  label,
  value,
  change,
  emphasis = false,
}: {
  label: string;
  value: string;
  change?: number;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm text-slate-500">{label}</span>
      <div className="flex items-center gap-2">
        <span
          className={`text-sm sm:text-base ${emphasis ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}
        >
          {value}
        </span>
        {typeof change === "number" && (
          <span
            className={`flex items-center gap-0.5 text-[11px] font-bold ${
              change >= 0 ? "text-emerald-600" : "text-red-500"
            }`}
          >
            {change >= 0 ? (
              <ArrowUp className="h-3 w-3" />
            ) : (
              <ArrowDown className="h-3 w-3" />
            )}
            {Math.abs(change).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}

export function FinancialSummaryCard({ financial }: FinancialSummaryCardProps) {
  const marginDelta = financial.marginPercent - financial.previousMarginPercent;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
      <div className="mb-2 flex items-center gap-2">
        <PiggyBank className="h-5 w-5 shrink-0 text-emerald-500" />
        <div>
          <h3 className="font-manrope text-base font-bold text-slate-900 sm:text-lg">
            Ringkasan Keuangan
          </h3>
          <p className="text-xs text-slate-400">Estimasi dari transaksi penjualan</p>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        <Row
          label="Pendapatan"
          value={formatCurrency(financial.revenue.value)}
          change={financial.revenue.percentageChange}
        />
        <Row
          label="Estimasi HPP (COGS)"
          value={formatCurrency(financial.cogs.value)}
          change={financial.cogs.percentageChange}
        />
        <Row
          label="Estimasi Laba Kotor"
          value={formatCurrency(financial.grossProfit.value)}
          change={financial.grossProfit.percentageChange}
          emphasis
        />
      </div>

      <div className="mt-3 rounded-xl bg-emerald-50/60 p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Margin Kotor
          </span>
          <span
            className={`flex items-center gap-0.5 text-[11px] font-bold ${
              marginDelta >= 0 ? "text-emerald-600" : "text-red-500"
            }`}
          >
            {marginDelta >= 0 ? (
              <ArrowUp className="h-3 w-3" />
            ) : (
              <ArrowDown className="h-3 w-3" />
            )}
            {Math.abs(marginDelta).toFixed(1)} pts
          </span>
        </div>
        <p className="mt-1 font-manrope text-2xl font-bold text-emerald-700">
          {financial.marginPercent.toFixed(1)}%
        </p>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
        HPP dihitung dari harga beli batch pada setiap transaksi penjualan (SALE).
        Angka ini adalah estimasi operasional, bukan laporan keuangan resmi.
      </p>
    </div>
  );
}
