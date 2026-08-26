"use client";

import { useDashboardData } from "@/hooks";
import type { InventoryHealthData } from "@/types/dashboard";

export function InventoryHealthCard() {
  const { data, loading, error } = useDashboardData<InventoryHealthData>(
    "/api/dashboard/health",
  );

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm animate-pulse">
        <div className="h-3 w-32 bg-slate-200 rounded mb-6" />
        <div className="h-28 w-28 rounded-full bg-slate-100 mx-auto my-2" />
        <div className="grid grid-cols-2 pt-4 mt-4 gap-4">
          <div className="h-8 bg-slate-100 rounded" />
          <div className="h-8 bg-slate-100 rounded" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 font-inter">
          Inventory Health
        </h3>
        <p className="text-sm text-red-500 py-8 text-center">
          {error ?? "Gagal memuat data."}
        </p>
      </div>
    );
  }

  const { score, totalSku, criticalCount } = data;

  const statusLabel =
    score >= 80 ? "Stable" : score >= 60 ? "Warning" : "Critical";
  const statusColor =
    score >= 80
      ? "text-[#22C55E]"
      : score >= 60
        ? "text-amber-500"
        : "text-red-500";
  const ringColor =
    score >= 80 ? "#22C55E" : score >= 60 ? "#F59E0B" : "#EF4444";

  const totalDisplay =
    totalSku >= 1000 ? `${(totalSku / 1000).toFixed(1)}k` : String(totalSku);

  const size = 112;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(100, Math.max(0, score));
  const dashOffset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 font-inter">
          Inventory Health
        </h3>

        <div className="flex flex-col items-center justify-center my-2">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              className="absolute top-0 left-0 -rotate-90"
            >
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#E5E7EB"
                strokeWidth={strokeWidth}
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={ringColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{ transition: "stroke-dashoffset 0.5s ease" }}
              />
            </svg>

            <div className="text-center relative z-10">
              <span className="text-2xl font-bold font-manrope text-slate-900">
                {score}%
              </span>
              <p className={`text-xs font-semibold ${statusColor}`}>
                {statusLabel}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 pt-4 border-t border-slate-100 text-center mt-4">
        <div>
          <p className="text-lg font-bold font-manrope text-slate-900">
            {totalDisplay}
          </p>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            Total SKUs
          </p>
        </div>
        <div>
          <p className="text-lg font-bold font-manrope text-red-500">
            {criticalCount}
          </p>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            Critical
          </p>
        </div>
      </div>
    </div>
  );
}
