"use client";

import { useDashboardData } from "@/hooks";
import type { RecentActivityItem, ActivitySource } from "@/types/dashboard";

const SOURCE_CONFIG: Record<ActivitySource, { dotCls: string }> = {
  STOCK_OUT: { dotCls: "bg-red-400" },
  STOCK_RECEIPT: { dotCls: "bg-[#22C55E]" },
  STOCK_AUDIT: { dotCls: "bg-blue-400" },
  PURCHASE_ORDER: { dotCls: "bg-amber-400" },
};

export function RecentActivityCard() {
  const { data, loading, error } = useDashboardData<RecentActivityItem[]>(
    "/api/dashboard/activities",
  );

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between h-full relative animate-pulse">
        <div>
          <div className="h-3 w-28 bg-slate-200 rounded mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between h-full relative">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 font-inter">
          Aktivitas Terkini
        </h3>
        <p className="text-sm text-red-500 py-8 text-center">
          {error ?? "Gagal memuat data."}
        </p>
      </div>
    );
  }

  const activities = data;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between h-full relative">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 font-inter">
          Aktivitas Terkini
        </h3>

        {activities.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-sm text-slate-400">
            Belum ada aktivitas hari ini
          </div>
        ) : (
          <div className="space-y-4 relative border-l-2 border-slate-100 ml-2 pl-4">
            {activities.map((activity, idx) => {
              const cfg = SOURCE_CONFIG[activity.source];
              const isFirst = idx === 0;

              return (
                <div key={activity.id} className="relative">
                  <span
                    className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white ${
                      isFirst ? cfg.dotCls : "bg-slate-300"
                    }`}
                  />
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">
                    {activity.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                    {activity.description}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    by {activity.actorName} • {activity.relativeTime}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
