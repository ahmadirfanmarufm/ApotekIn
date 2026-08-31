"use client";

import type { ReportPeriod } from "@/types/report";
import { CalendarDays } from "lucide-react";

interface ReportPeriodFilterProps {
  value: ReportPeriod;
  onChange: (period: ReportPeriod) => void;
}

const periods: Array<{
  value: ReportPeriod;
  label: string;
  shortLabel: string;
}> = [
  { value: "3d", label: "3 Hari", shortLabel: "3H" },
  { value: "10d", label: "10 Hari", shortLabel: "10H" },
  { value: "20d", label: "20 Hari", shortLabel: "20H" },
  { value: "1m", label: "1 Bulan", shortLabel: "1B" },
  { value: "3m", label: "3 Bulan", shortLabel: "3B" },
  { value: "6m", label: "6 Bulan", shortLabel: "6B" },
  { value: "1y", label: "1 Tahun", shortLabel: "1T" },
  { value: "all", label: "Semua", shortLabel: "All" },
];

export function ReportPeriodFilter({
  value,
  onChange,
}: ReportPeriodFilterProps) {
  return (
    <div className="w-full overflow-hidden">
      <div className="flex w-full items-center gap-2 overflow-x-auto pb-1 pr-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="mr-1 flex shrink-0 items-center gap-2 text-sm text-slate-500">
          <CalendarDays className="h-4 w-4 shrink-0" />

          <span className="hidden sm:inline">
            Periode:
          </span>
        </div>

        {periods.map((period) => {
          const isActive = value === period.value;

          return (
            <button
              key={period.value}
              type="button"
              onClick={() => onChange(period.value)}
              aria-pressed={isActive}
              className={`shrink-0 rounded-lg px-2.5 py-2 text-xs font-semibold transition-all sm:px-3 ${
                isActive
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span className="sm:hidden">
                {period.shortLabel}
              </span>

              <span className="hidden sm:inline">
                {period.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}