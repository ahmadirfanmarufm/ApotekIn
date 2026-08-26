"use client";

import { useDashboardData } from "@/hooks";
import type { TopMovingItem } from "@/types/dashboard";

export function TopUsageCard() {
  const { data, loading, error } = useDashboardData<TopMovingItem[]>(
    "/api/dashboard/fast-moving",
  );

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between h-full animate-pulse">
        <div>
          <div className="h-3 w-36 bg-slate-200 rounded mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-8 bg-slate-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between h-full">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 font-inter">
          5 Penggunaan Teratas
        </h3>
        <p className="text-sm text-red-500 py-8 text-center">
          {error ?? "Gagal memuat data."}
        </p>
      </div>
    );
  }

  const items = data;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 font-inter">
          5 Penggunaan Teratas
        </h3>

        {items.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-sm text-slate-400">
            Belum ada data penjualan bulan ini
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.itemId}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span
                    className="font-bold text-slate-900 font-manrope truncate max-w-[70%]"
                    title={item.itemName}
                  >
                    {item.itemName}
                  </span>
                  <span className="text-slate-500 text-xs font-medium shrink-0">
                    {item.totalQty.toLocaleString("id-ID")} unit
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#22C55E] h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.relativePercent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
