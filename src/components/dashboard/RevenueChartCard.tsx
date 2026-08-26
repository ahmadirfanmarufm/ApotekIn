"use client";

import { useState } from "react";
import { useDashboardData } from "@/hooks";
import type { FinancialChartData } from "@/types/dashboard";

function formatRupiah(value: number): string {
  if (value >= 1_000_000_000) return `Rp${(value / 1_000_000_000).toFixed(1)}M`;
  if (value >= 1_000_000) return `Rp${(value / 1_000_000).toFixed(1)}jt`;
  if (value >= 1_000) return `Rp${(value / 1_000).toFixed(0)}rb`;
  return `Rp${value.toFixed(0)}`;
}

export function RevenueChartCard() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { data, loading, error } = useDashboardData<FinancialChartData>(
    "/api/dashboard/financial?days=30",
  );

  if (loading)
    return (
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-full animate-pulse">
        <div className="h-4 w-48 bg-slate-200 rounded mb-6" />
        <div className="flex items-end gap-1 h-40">
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-slate-100 rounded-t-sm"
              style={{ height: `${30 + ((i * 37) % 60)}%` }}
            />
          ))}
        </div>
      </div>
    );
  if (error || !data)
    return (
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold font-manrope text-slate-900">
          Pendapatan dan Pengeluaran
        </h2>
        <p className="text-sm text-red-500 py-12 text-center">
          {error ?? "Gagal memuat data."}
        </p>
      </div>
    );

  const { days, totalRevenue, totalExpense } = data;
  const maxValue = Math.max(
    ...days.map((d) => Math.max(d.revenue, d.expense)),
    1,
  );

  const buckets = days.map((d) => ({
    revenue: d.revenue,
    expense: d.expense,
    label: d.date?.slice(5) ?? "",
  }));

  const bucketMax = maxValue;

  return (
    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg font-bold font-manrope text-slate-900">
            Pendapatan dan Pengeluaran
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            keuangan {days.length} hari terakhir
          </p>
        </div>
        <div className="flex gap-4 text-sm font-medium text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#22C55E]" />
            Pendapatan
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-400" />
            Pengeluaran
          </div>
        </div>
      </div>

      <div className="flex gap-6 mb-4">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
            Total Pendapatan
          </p>
          <p className="text-lg font-bold font-manrope text-[#22C55E]">
            {formatRupiah(totalRevenue)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
            Total Pengeluaran
          </p>
          <p className="text-lg font-bold font-manrope text-blue-500">
            {formatRupiah(totalExpense)}
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-end justify-between gap-1 pt-2 border-b border-slate-100 pb-2 relative">
        {buckets.length > 0 ? (
          buckets.map((bucket, idx) => {
            const revenueH = Math.round((bucket.revenue / bucketMax) * 100);
            const expenseH = Math.round((bucket.expense / bucketMax) * 100);
            const isHovered = hoveredIndex === idx;

            return (
              <div
                key={idx}
                className="flex gap-0.5 items-end h-40 flex-1 cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {isHovered && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap z-10 shadow-lg pointer-events-none">
                    <p className="font-bold">{bucket.label}</p>
                    <p>Pendapatan: {formatRupiah(bucket.revenue)}</p>
                    <p>Pengeluaran: {formatRupiah(bucket.expense)}</p>
                  </div>
                )}
                <div
                  className="flex-1 bg-blue-100 rounded-t-sm hover:bg-blue-200 transition-colors"
                  style={{ height: `${Math.max(expenseH, 2)}%` }}
                />
                <div
                  className="flex-1 bg-[#22C55E] rounded-t-sm hover:bg-green-400 transition-colors"
                  style={{ height: `${Math.max(revenueH, 2)}%` }}
                />
              </div>
            );
          })
        ) : (
          <div className="flex-1 flex items-center justify-center h-40">
            <p className="text-sm text-slate-400">Belum ada data transaksi</p>
          </div>
        )}
      </div>

      <div className="flex justify-between text-xs text-slate-400 font-medium pt-2">
        {buckets
          .filter(
            (_, i) =>
              i === 0 ||
              i === Math.floor(buckets.length / 2) ||
              i === buckets.length - 1,
          )
          .map((b, i) => (
            <span key={i}>{b.label}</span>
          ))}
      </div>
    </div>
  );
}
