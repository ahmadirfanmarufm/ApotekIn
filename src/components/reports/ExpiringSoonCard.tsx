import { CalendarClock } from "lucide-react";

import type { ExpiringBatch } from "@/types/report";

interface ExpiringSoonCardProps {
  batches: ExpiringBatch[];
}

function urgencyClass(days: number) {
  if (days <= 7) return "bg-red-50 text-red-600 border-red-100";
  if (days <= 14) return "bg-orange-50 text-orange-600 border-orange-100";
  return "bg-amber-50 text-amber-600 border-amber-100";
}

export function ExpiringSoonCard({ batches }: ExpiringSoonCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
      <div className="mb-4 flex items-center gap-2 sm:mb-5">
        <CalendarClock className="h-5 w-5 shrink-0 text-orange-500" />
        <div>
          <h3 className="font-manrope text-base font-bold text-slate-900 sm:text-lg">
            Akan Kedaluwarsa (30 Hari)
          </h3>
          <p className="text-xs text-slate-400">
            Prioritaskan penjualan batch ini (FEFO)
          </p>
        </div>
      </div>

      {batches.length === 0 ? (
        <div className="flex min-h-[160px] flex-col items-center justify-center text-center">
          <CalendarClock className="mb-3 h-9 w-9 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">
            Tidak ada batch yang akan kedaluwarsa dalam 30 hari
          </p>
        </div>
      ) : (
        <div className="max-h-[340px] space-y-2.5 overflow-y-auto pr-1">
          {batches.map((batch) => (
            <div
              key={`${batch.itemId}-${batch.batchNumber}`}
              className={`flex items-center justify-between gap-3 rounded-xl border p-3 ${urgencyClass(batch.daysUntilExpiry)}`}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-800">
                  {batch.itemName}
                </p>
                <p className="truncate text-[11px] text-slate-500">
                  Batch {batch.batchNumber} · {batch.quantity.toLocaleString("id-ID")}{" "}
                  unit
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-sm font-bold">
                  {batch.daysUntilExpiry === 0
                    ? "Hari ini"
                    : `${batch.daysUntilExpiry} hari`}
                </p>
                <p className="text-[10px] text-slate-500">
                  {new Intl.DateTimeFormat("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }).format(new Date(batch.expiryDate))}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
