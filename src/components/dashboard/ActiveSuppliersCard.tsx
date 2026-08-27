"use client";

import { useDashboardData } from "@/hooks";
import type {
  SupplierPerformanceItem,
  DeliveryStatus,
} from "@/types/dashboard";

const STATUS_CONFIG: Record<
  DeliveryStatus,
  { badgeCls: string; label: string }
> = {
  ON_TIME: { badgeCls: "bg-green-100 text-[#22C55E]", label: "ON TIME" },
  DELAYED: { badgeCls: "bg-red-100 text-red-600", label: "DELAYED" },
  PENDING: { badgeCls: "bg-slate-100 text-slate-500", label: "PENDING" },
};

const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="16" height="13" x="4" y="5" rx="2" />
    <path d="M16 2v3" />
    <path d="M8 2v3" />
    <path d="M4 10h16" />
  </svg>
);

export function ActiveSuppliersCard() {
  const { data, loading, error } = useDashboardData<SupplierPerformanceItem[]>(
    "/api/dashboard/suppliers",
  );

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between h-full animate-pulse">
        <div>
          <div className="h-3 w-32 bg-slate-200 rounded mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 bg-slate-100 rounded-xl" />
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
          Performa Pemasok
        </h3>
        <p className="text-sm text-red-500 py-8 text-center">
          {error ?? "Gagal memuat data."}
        </p>
      </div>
    );
  }

  const suppliers = data;
  const topSuppliers = [...suppliers]
    .sort((a, b) => b.totalDeliveries - a.totalDeliveries)
    .slice(0, 5);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 font-inter">
          Performa Pemasok
        </h3>

        {topSuppliers.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-sm text-slate-400">
            Belum ada data pemasok aktif
          </div>
        ) : (
          <div className="space-y-3">
            {topSuppliers.map((supplier) => {
              const cfg = STATUS_CONFIG[supplier.status];

              return (
                <div
                  key={supplier.supplierId}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-blue-600 shrink-0">
                      <CalendarIcon />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 truncate max-w-[100px]">
                        {supplier.supplierName}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded ${cfg.badgeCls}`}
                        >
                          {cfg.label}
                        </span>
                        {supplier.totalDeliveries > 0 && (
                          <span className="text-[10px] text-slate-400">
                            {supplier.onTimePct}% tepat waktu
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {supplier.totalDeliveries > 0 && (
                    <span className="text-xs text-slate-400 shrink-0 ml-2">
                      {supplier.totalDeliveries}x
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
