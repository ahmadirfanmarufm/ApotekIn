import { Activity, Sparkles } from "lucide-react";

interface ReportsTopSectionProps {
  summary: {
    healthScore: number;
    message: string;
  };
  periodLabel: string;
}

export function ReportsTopSection({ summary, periodLabel }: ReportsTopSectionProps) {
  const scoreColor =
    summary.healthScore >= 80
      ? "text-emerald-600"
      : summary.healthScore >= 60
        ? "text-amber-500"
        : "text-red-500";

  const ringColor =
    summary.healthScore >= 80
      ? "#22c55e"
      : summary.healthScore >= 60
        ? "#f59e0b"
        : "#ef4444";

  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (summary.healthScore / 100) * circumference;

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 shadow-sm sm:p-6 lg:col-span-2">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <Sparkles className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h2 className="font-manrope text-base font-bold text-slate-900 sm:text-lg">
              Ringkasan Inventaris
            </h2>
            <p className="truncate text-xs text-slate-500">
              Berdasarkan {periodLabel.toLowerCase()}
            </p>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-slate-600">{summary.message}</p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Activity className="h-4 w-4" />
          Kesehatan Inventaris
        </div>

        <div className="relative my-3 flex h-28 w-28 items-center justify-center">
          <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={ringColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 0.6s ease" }}
            />
          </svg>

          <span
            className={`absolute font-manrope text-2xl font-bold ${scoreColor}`}
          >
            {Math.round(summary.healthScore)}%
          </span>
        </div>

        <p className="text-center text-xs text-slate-500">
          Berdasarkan kondisi stok aktif, stok minimum, dan barang kedaluwarsa.
        </p>
      </div>
    </div>
  );
}
