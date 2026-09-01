"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Truck,
} from "lucide-react";

import type {
  InventoryTrend,
  SupplierPerformance,
} from "@/types/report";

import { InventoryTrendChart } from "./InventoryTrendChart";

interface AnalyticsSectionProps {
  trends: InventoryTrend[];
  suppliers: SupplierPerformance[];
  periodLabel: string;
}

export function AnalyticsSection({ trends, suppliers, periodLabel }: AnalyticsSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
      {/* INVENTORY TREND */}
      <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:col-span-2 lg:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 shrink-0 text-emerald-500" />

              <h3 className="font-manrope text-base font-bold text-slate-900 sm:text-lg">
                Tren Pergerakan Inventaris
              </h3>
            </div>

            <p className="mt-1 text-xs leading-relaxed text-slate-400 sm:truncate">
              Aktivitas stok berdasarkan {periodLabel.toLowerCase()}
            </p>
          </div>

          <div className="inline-flex w-fit shrink-0 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500">
            Stok Masuk vs Keluar
          </div>
        </div>

        {trends.length === 0 ? (
          <div className="flex h-[240px] flex-col items-center justify-center text-center sm:h-[320px]">
            <BarChart3 className="mb-3 h-10 w-10 text-slate-300" />

            <p className="text-sm font-medium text-slate-500">
              Belum ada data transaksi
            </p>

            <p className="mt-1 max-w-xs text-xs text-slate-400">
              Data stok masuk dan stok keluar akan muncul di sini.
            </p>
          </div>
        ) : (
          <InventoryTrendChart trends={trends} />
        )}
      </div>

      {/* SUPPLIER PERFORMANCE */}
      <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
        <div className="mb-4 flex items-center gap-2 sm:mb-5">
          <Truck className="h-5 w-5 shrink-0 text-emerald-500" />

          <div className="min-w-0">
            <h3 className="font-manrope text-base font-bold text-slate-900 sm:text-lg">
              Performa Pemasok
            </h3>

            <p className="text-xs text-slate-400">
              Berdasarkan purchase order
            </p>
          </div>
        </div>

        {suppliers.length === 0 ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center text-center sm:min-h-[240px]">
            <Truck className="mb-3 h-9 w-9 text-slate-300" />

            <p className="text-sm font-medium text-slate-500">
              Belum ada data pemasok
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {suppliers.slice(0, 5).map((supplier) => {
              const isGood = supplier.fulfillmentRate >= 80;

              return (
                <div
                  key={supplier.id}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-800">
                        {supplier.name}
                      </p>

                      <p className="mt-1 text-[11px] text-slate-400">
                        {supplier.completedOrders}/{supplier.totalOrders} pesanan selesai
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <div
                        className={`flex items-center justify-end gap-1 text-xs font-bold ${
                          isGood
                            ? "text-emerald-600"
                            : "text-amber-500"
                        }`}
                      >
                        {isGood ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3" />
                        )}

                        {supplier.fulfillmentRate.toFixed(1)}%
                      </div>

                      <p className="mt-1 text-[10px] text-slate-400">
                        {supplier.averageLeadTime.toFixed(1)} hari
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isGood
                          ? "bg-emerald-500"
                          : "bg-amber-400"
                      }`}
                      style={{
                        width: `${Math.min(
                          supplier.fulfillmentRate,
                          100,
                        )}%`,
                      }}
                    />
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