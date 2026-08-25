"use client";

import { useDashboardData } from "@/hooks";
import type { StockAlertItem, StockAlertReason } from "@/types/dashboard";

const REASON_CONFIG: Record<
  StockAlertReason,
  { dotCls: string; label: string }
> = {
  LOW_STOCK: { dotCls: "bg-red-500", label: "Stok rendah" },
  NEAR_EXPIRY: { dotCls: "bg-amber-500", label: "Mendekati ED" },
  BOTH: { dotCls: "bg-red-600", label: "Stok rendah & mendekati ED" },
};

export function StockAlertsCard() {
  const { data, loading, error } = useDashboardData<StockAlertItem[]>(
    "/api/dashboard/alerts",
  );

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between h-full animate-pulse">
        <div>
          <div className="h-3 w-32 bg-slate-200 rounded mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 bg-slate-100 rounded" />
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
          Pemberitahuan Stok
        </h3>
        <p className="text-sm text-red-500 py-8 text-center">
          {error ?? "Gagal memuat data."}
        </p>
      </div>
    );
  }

  const alerts = data;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 font-inter">
          Pemberitahuan Stok
        </h3>

        {alerts.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-sm text-slate-400">
            Semua stok dalam kondisi aman ✓
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => {
              const cfg = REASON_CONFIG[alert.reason];
              const subText =
                alert.reason === "LOW_STOCK"
                  ? `Stok: ${alert.currentStock} / min ${alert.minStock}`
                  : alert.reason === "NEAR_EXPIRY"
                    ? `ED dalam ${alert.daysUntilExpiry ?? "?"} hari`
                    : `Stok: ${alert.currentStock} | ED: ${alert.daysUntilExpiry ?? "?"}h`;

              return (
                <div key={alert.itemId} className="flex items-start gap-3">
                  <span
                    className={`w-2 h-2 rounded-full ${cfg.dotCls} mt-1.5 shrink-0`}
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 font-manrope leading-tight">
                      {alert.itemName}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">{cfg.label}</p>
                    <p className="text-xs text-slate-400">{subText}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
