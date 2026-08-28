"use client";

import { useDashboardData } from "@/hooks";
import type {
  ExecutiveSummary,
  NarrativeSeverity,
  NarrativeSource,
} from "@/types/dashboard";

const SEVERITY_THEME: Record<
  NarrativeSeverity,
  {
    badge: string;
    iconWrap: string;
    icon: string;
    recBox: string;
    recText: string;
    recIcon: string;
    recTitle: string;
    label: string;
  }
> = {
  GOOD: {
    badge: "bg-green-100 text-[#22C55E]",
    iconWrap: "bg-green-100 text-[#22C55E]",
    icon: "text-[#22C55E]",
    recBox: "bg-slate-50 border-slate-200",
    recText: "text-teal-800",
    recIcon: "text-[#22C55E]",
    recTitle: "text-[#22C55E]",
    label: "Stabil",
  },
  WARNING: {
    badge: "bg-amber-100 text-amber-700",
    iconWrap: "bg-amber-100 text-amber-600",
    icon: "text-amber-600",
    recBox: "bg-amber-50 border-amber-200",
    recText: "text-amber-900",
    recIcon: "text-amber-600",
    recTitle: "text-amber-700",
    label: "Perhatian",
  },
  CRITICAL: {
    badge: "bg-red-100 text-red-600",
    iconWrap: "bg-red-100 text-red-600",
    icon: "text-red-600",
    recBox: "bg-red-50 border-red-200",
    recText: "text-red-900",
    recIcon: "text-red-600",
    recTitle: "text-red-700",
    label: "Kritis",
  },
};

const SparklesIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

const LightbulbIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 21h6" />
    <path d="M10 21v-2c0-1.2.9-2.2 2-2.2s2 1 2 2.2v2" />
    <path d="M15 11c0 2-1 3.5-3 3.5S9 13 9 11s2-3.5 3-3.5 3 1.5 3 3.5z" />
    <path d="M12 2v2" />
    <path d="M19.07 4.93l-1.41 1.41" />
    <path d="M22 12h-2" />
    <path d="M19.07 19.07l-1.41-1.41" />
    <path d="M4.93 19.07l1.41-1.41" />
    <path d="M2 12h2" />
    <path d="M4.93 4.93l1.41 1.41" />
  </svg>
);

function formatRelativeMinutes(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}

function SourceBadge({
  source,
  model,
}: {
  source: NarrativeSource;
  model: string | null;
}) {
  if (source === "GEMINI") {
    return (
      <span
        title={model ? `Diringkas oleh ${model}` : "Diringkas oleh Gemini"}
        className="text-[10px] font-bold uppercase px-2 py-0.5 rounded tracking-wider bg-blue-100 text-blue-700"
      >
        ✨ AI
      </span>
    );
  }
  return (
    <span
      title="Template deterministik (Gemini tidak aktif atau fallback)"
      className="text-[10px] font-bold uppercase px-2 py-0.5 rounded tracking-wider bg-slate-100 text-slate-500"
    >
      Template
    </span>
  );
}

export function AiSummaryCard() {
  const { data, loading, error, refetch } = useDashboardData<ExecutiveSummary>(
    "/api/dashboard/executive-summary",
  );

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between h-full animate-pulse">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-slate-100" />
          <div className="h-5 w-44 bg-slate-200 rounded" />
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-3 w-full bg-slate-100 rounded" />
          <div className="h-3 w-11/12 bg-slate-100 rounded" />
          <div className="h-3 w-10/12 bg-slate-100 rounded" />
        </div>
        <div className="h-20 bg-slate-50 rounded-xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between h-full">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
            <SparklesIcon />
          </div>
          <h2 className="text-xl font-bold font-manrope text-slate-900">
            AI Executive Summary
          </h2>
        </div>
        <p className="text-sm text-red-500 py-6 text-center">
          {error ?? "Gagal memuat ringkasan."}
        </p>
        <button
          onClick={refetch}
          className="text-xs font-semibold text-blue-600 hover:underline self-center"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  const theme = SEVERITY_THEME[data.narrative.severity];
  const { narrative, cachedUntil, narrativeSource, geminiModel } = data;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center gap-4 mb-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${theme.iconWrap}`}
          >
            <SparklesIcon className={theme.icon} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold font-manrope text-slate-900">
                AI Executive Summary
              </h2>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded tracking-wider ${theme.badge}`}
              >
                {theme.label}
              </span>
              <SourceBadge source={narrativeSource} model={geminiModel} />
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Diperbarui {formatRelativeMinutes(data.generatedAt)} • cache
              hingga {formatRelativeMinutes(cachedUntil)}
            </p>
          </div>
        </div>

        <p className="text-slate-800 text-sm font-semibold leading-relaxed mb-2">
          {narrative.headline}
        </p>
        <p className="text-slate-600 text-sm leading-relaxed mb-4">
          {narrative.insight}
        </p>
      </div>

      <div className={`${theme.recBox} border rounded-xl p-4 flex gap-3`}>
        <div className={`${theme.recIcon} mt-0.5 shrink-0`}>
          <LightbulbIcon />
        </div>
        <p className={`text-sm leading-relaxed font-medium ${theme.recText}`}>
          <span className={`font-bold ${theme.recTitle}`}>Rekomendasi: </span>
          {narrative.recommendation}
        </p>
      </div>
    </div>
  );
}
