import { Award } from "lucide-react";

import type { TopProduct } from "@/types/report";

interface TopProductsCardProps {
  products: TopProduct[];
}

const RANK_COLORS = [
  "bg-amber-100 text-amber-700",
  "bg-slate-200 text-slate-600",
  "bg-orange-100 text-orange-700",
];

export function TopProductsCard({ products }: TopProductsCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
      <div className="mb-4 flex items-center gap-2 sm:mb-5">
        <Award className="h-5 w-5 shrink-0 text-emerald-500" />
        <div>
          <h3 className="font-manrope text-base font-bold text-slate-900 sm:text-lg">
            Produk Terlaris
          </h3>
          <p className="text-xs text-slate-400">Berdasarkan jumlah unit terjual</p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="flex min-h-[160px] flex-col items-center justify-center text-center">
          <Award className="mb-3 h-9 w-9 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">Belum ada penjualan</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {products.map((product, index) => (
            <div
              key={product.itemId}
              className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3"
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  RANK_COLORS[index] ?? "bg-emerald-50 text-emerald-600"
                }`}
              >
                {index + 1}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-800">
                  {product.name}
                </p>
                <p className="truncate text-[11px] text-slate-400">
                  {product.code}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-emerald-600">
                  {product.quantitySold.toLocaleString("id-ID")}
                </p>
                <p className="text-[10px] text-slate-400">unit terjual</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
