import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";

import type { ProductEfficiency } from "@/types/report";

interface EfficiencyTableProps {
  data: ProductEfficiency[];
}

function TrendBadge({ trendChange }: { trendChange: number }) {
  const TrendIcon = trendChange > 0 ? ArrowUp : trendChange < 0 ? ArrowDown : ArrowRight;

  return (
    <span
      className={`flex items-center gap-1 text-xs font-semibold ${
        trendChange > 0
          ? "text-emerald-600"
          : trendChange < 0
            ? "text-red-500"
            : "text-slate-500"
      }`}
    >
      <TrendIcon className="h-3.5 w-3.5" />
      {Math.abs(trendChange).toFixed(1)}%
    </span>
  );
}

export function EfficiencyTable({ data }: EfficiencyTableProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
      <div className="mb-4 sm:mb-6">
        <h3 className="text-base font-bold text-slate-900 sm:text-lg">
          Matriks Efisiensi Inventaris
        </h3>
        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
          Perbandingan efisiensi berdasarkan kategori produk, dibanding periode
          sebelumnya.
        </p>
      </div>

      {data.length === 0 ? (
        <div className="py-12 text-center text-sm text-slate-400">
          Belum ada data untuk periode ini.
        </div>
      ) : (
        <>
          {/* Tampilan tabel untuk layar sedang ke atas */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-3">Kategori Produk</th>
                  <th className="pb-3 text-center">Stok Masuk</th>
                  <th className="pb-3 text-center">Stok Keluar</th>
                  <th className="pb-3">Turnover Rate</th>
                  <th className="pb-3">Efisiensi</th>
                  <th className="pb-3 text-right">Trend vs Periode Lalu</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm">
                {data.map((item) => (
                  <tr key={item.category} className="hover:bg-slate-50/70">
                    <td className="py-4 font-bold text-slate-900">{item.category}</td>
                    <td className="py-4 text-center text-slate-600">
                      {item.stockIn.toLocaleString("id-ID")}
                    </td>
                    <td className="py-4 text-center text-slate-600">
                      {item.stockOut.toLocaleString("id-ID")}
                    </td>
                    <td className="py-4 text-slate-600">
                      {item.turnoverRate.toFixed(2)}x
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${item.efficiency}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-600">
                          {item.efficiency.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex justify-end">
                        <TrendBadge trendChange={item.trendChange} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tampilan kartu untuk layar kecil (mobile) */}
          <div className="space-y-3 sm:hidden">
            {data.map((item) => (
              <div
                key={item.category}
                className="rounded-xl border border-slate-100 bg-slate-50 p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-bold text-slate-900">{item.category}</p>
                  <TrendBadge trendChange={item.trendChange} />
                </div>

                <div className="mb-2 grid grid-cols-3 gap-2 text-center text-xs text-slate-500">
                  <div>
                    <p className="font-semibold text-slate-700">
                      {item.stockIn.toLocaleString("id-ID")}
                    </p>
                    <p>Masuk</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700">
                      {item.stockOut.toLocaleString("id-ID")}
                    </p>
                    <p>Keluar</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700">
                      {item.turnoverRate.toFixed(2)}x
                    </p>
                    <p>Turnover</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${item.efficiency}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-600">
                    {item.efficiency.toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
