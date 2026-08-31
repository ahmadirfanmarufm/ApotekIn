import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Boxes,
  Clock,
  PackagePlus,
  Wallet,
} from "lucide-react";

import type { ReportsData } from "@/types/report";

interface MetricsGridProps {
  metrics: ReportsData["metrics"];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function ChangeBadge({
  value,
  higherIsBetter = true,
}: {
  value: number;
  higherIsBetter?: boolean;
}) {
  const isGoodChange = higherIsBetter ? value >= 0 : value <= 0;

  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-bold ${
        isGoodChange ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
      }`}
    >
      {value >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  const cards = [
    {
      label: "Total Pendapatan",
      value: formatCurrency(metrics.totalRevenue.value),
      change: metrics.totalRevenue.percentageChange,
      higherIsBetter: true,
      icon: Wallet,
      iconClass: "bg-blue-50 text-blue-600",
    },
    {
      label: "Total Stok Masuk",
      value: `${metrics.totalStockIn.value.toLocaleString("id-ID")} Unit`,
      change: metrics.totalStockIn.percentageChange,
      higherIsBetter: true,
      icon: PackagePlus,
      iconClass: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Perputaran Persediaan",
      value: `${metrics.inventoryTurnover.value.toFixed(2)}x`,
      change: metrics.inventoryTurnover.percentageChange,
      higherIsBetter: true,
      icon: Boxes,
      iconClass: "bg-violet-50 text-violet-600",
    },
    {
      label: "Write-off Kedaluwarsa",
      value: `${metrics.expiredWriteOffs.value.toLocaleString("id-ID")} Unit`,
      change: metrics.expiredWriteOffs.percentageChange,
      higherIsBetter: false,
      icon: Clock,
      iconClass: "bg-orange-50 text-orange-500",
    },
    {
      label: "Stok Menipis",
      value: `${metrics.lowStockItems} Item`,
      change: null,
      higherIsBetter: false,
      icon: AlertTriangle,
      iconClass: "bg-amber-50 text-amber-500",
    },
    {
      label: "Item Kedaluwarsa (Live)",
      value: `${metrics.expiredItemsNow} Item`,
      change: null,
      higherIsBetter: false,
      icon: AlertTriangle,
      iconClass: "bg-red-50 text-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
          >
            <div className="mb-3 flex items-start justify-between gap-2 sm:mb-4">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${card.iconClass}`}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>

              {card.change !== null && (
                <ChangeBadge value={card.change} higherIsBetter={card.higherIsBetter} />
              )}
            </div>

            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 sm:text-xs">
              {card.label}
            </p>

            <h3 className="mt-1.5 truncate text-base font-bold text-slate-900 sm:mt-2 sm:text-xl">
              {card.value}
            </h3>
          </div>
        );
      })}
    </div>
  );
}
