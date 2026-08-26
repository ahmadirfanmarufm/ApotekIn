"use client";

import React from "react";
import { AlertTriangle, ShoppingCart, Pill } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CriticalStockSectionProps {
  onReorderAll?: () => void;
  onReorderItem?: (itemName: string) => void;
}

export function CriticalStockSection({
  onReorderAll,
  onReorderItem,
}: CriticalStockSectionProps) {
  const criticalItems = [
    {
      id: 1,
      name: "Amoxicillin 500mg",
      eta: "14 Hours",
      icon: Pill,
    },
    {
      id: 2,
      name: "Insulin Glargine",
      eta: "2 Days",
      icon: Pill,
    },
  ];

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-red-100 bg-red-50/20 p-6 shadow-sm">
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <h2 className="text-base font-bold text-slate-900">
              Risiko Kehabisan Stok yang Kritis
            </h2>
          </div>
          <Badge
            variant="danger"
            className="bg-red-500 text-white font-bold px-2.5 py-0.5 rounded-full text-xs"
          >
            4 Item
          </Badge>
        </div>

        <div className="space-y-3 mb-6">
          {criticalItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl bg-white p-3.5 border border-slate-200 shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {item.name}
                  </h3>
                  <p className="text-xs text-red-600 font-semibold mt-0.5">
                    ETA Out: <span className="font-bold">{item.eta}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onReorderItem?.(item.name)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-600 text-white transition-colors cursor-pointer shadow-xs"
                title={`Pesan ${item.name}`}
              >
                <ShoppingCart className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onReorderAll}
        className="w-full rounded-xl bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-700 font-semibold text-sm py-3 transition-colors text-center cursor-pointer"
      >
        Pesan Ulang Semua Barang Kritis
      </button>
    </div>
  );
}
