"use client";

import { useState } from "react";
import { useDashboardData } from "@/hooks";
import type { PriorityTaskItem } from "@/types/dashboard";

const TYPE_BADGE: Record<
  PriorityTaskItem["type"],
  { label: string; cls: string }
> = {
  EXPIRY_TODAY: { label: "Kedaluwarsa", cls: "bg-red-100 text-red-600" },
  REORDER_CRITICAL: { label: "Reorder", cls: "bg-amber-100 text-amber-700" },
  AUDIT_SCHEDULED: { label: "Audit", cls: "bg-blue-100 text-blue-600" },
};

function formatDueAt(
  dueAt: string | null,
): { label: string; cls: string } | null {
  if (!dueAt) return null;
  const ms = new Date(dueAt).getTime() - Date.now();
  const hours = Math.floor(ms / (1000 * 60 * 60));

  if (ms < 0) {
    return { label: `Terlambat ${Math.abs(hours)}j`, cls: "text-red-500" };
  }
  if (hours < 2) {
    return { label: `${hours}j lagi`, cls: "text-amber-500" };
  }
  return { label: `Tenggat hari ini`, cls: "text-slate-500" };
}

export function PrioritiesList() {
  const [completingId, setCompletingId] = useState<string | null>(null);
  const { data, loading, error, refetch } = useDashboardData<
    PriorityTaskItem[]
  >("/api/dashboard/tasks");

  const handleComplete = async (task: PriorityTaskItem) => {
    if (task.isCompleted || completingId) return;
    setCompletingId(task.id);
    try {
      await fetch(`/api/dashboard/tasks/${encodeURIComponent(task.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: task.type }),
      });
      refetch();
    } finally {
      setCompletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col h-full animate-pulse">
        <div className="h-5 w-40 bg-slate-200 rounded mb-6" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col h-full">
        <h2 className="text-lg font-bold font-manrope text-slate-900">
          Prioritas Hari Ini
        </h2>
        <p className="text-sm text-red-500 flex-1 flex items-center justify-center">
          {error ?? "Gagal memuat data."}
        </p>
      </div>
    );
  }

  const tasks = data;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold font-manrope text-slate-900">
          Prioritas Hari Ini
        </h2>
        {tasks.length > 0 && (
          <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
            {tasks.length} Mendesak
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-72">
        {tasks.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-sm text-slate-400">
            Tidak ada tugas mendesak hari ini 🎉
          </div>
        ) : (
          tasks.map((task) => {
            const badge = TYPE_BADGE[task.type];
            const dueInfo = formatDueAt(task.dueAt);
            const isBusy = completingId === task.id;

            return (
              <div
                key={task.id}
                className="flex items-start gap-4 p-3 rounded-xl border border-slate-100 bg-slate-50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <h4
                      className={`text-sm font-semibold text-slate-700 ${task.isCompleted ? "line-through opacity-60" : ""}`}
                    >
                      {task.title}
                    </h4>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${badge.cls}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    {task.description}
                  </p>
                  {dueInfo && !task.isCompleted && (
                    <p className={`text-xs font-medium mt-0.5 ${dueInfo.cls}`}>
                      {dueInfo.label}
                    </p>
                  )}
                </div>
                {!task.isCompleted && (
                  <button
                    type="button"
                    onClick={() => handleComplete(task)}
                    disabled={isBusy}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50 shrink-0"
                  >
                    {isBusy ? "..." : "Selesai"}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
