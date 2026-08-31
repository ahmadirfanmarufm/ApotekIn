"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

import type { ReportPeriod, ReportsData } from "@/types/report";

import { ReportPeriodFilter } from "./ReportPeriodFilter";
import { ExportMenu } from "./ExportMenu";
import { ReportsTopSection } from "./ReportsTopSection";
import { MetricsGrid } from "./MetricsGrid";
import { AnalyticsSection } from "./AnalyticsSection";
import { EfficiencyTable } from "./EfficiencyTable";
import { FinancialSummaryCard } from "./FinancialSummaryCard";
import { TopProductsCard } from "./TopProductsCard";
import { ExpiringSoonCard } from "./ExpiringSoonCard";
import { AiInsightTeaser } from "./AiInsightTeaser";

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-slate-100 ${className}`}
    />
  );
}

function ReportsSkeleton() {
  return (
    <div
      className="space-y-4 sm:space-y-6"
      aria-busy="true"
      aria-live="polite"
    >
      {/* Hero / Summary */}
      <SkeletonBlock className="h-36 sm:h-40 lg:h-44" />

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-28 sm:h-32" />
        ))}
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        <SkeletonBlock className="h-[280px] sm:h-[320px] lg:col-span-2 lg:h-[360px]" />
        <SkeletonBlock className="h-[280px] sm:h-[320px] lg:h-[360px]" />
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
        <SkeletonBlock className="h-[220px] sm:h-[250px]" />
        <SkeletonBlock className="h-[220px] sm:h-[250px]" />
        <SkeletonBlock className="h-[220px] sm:h-[250px] sm:col-span-2 xl:col-span-1" />
      </div>

      {/* Table */}
      <SkeletonBlock className="h-[280px] sm:h-[320px]" />
    </div>
  );
}

export function ReportsClient() {
  const [period, setPeriod] = useState<ReportPeriod>("6m");
  const [data, setData] = useState<ReportsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/reports?period=${period}`, {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengambil data laporan.");
      }

      setData(result.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengambil laporan.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  return (
    <div className="min-w-0 space-y-4 sm:space-y-6">
      {/* CONTROL BAR */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 w-full lg:w-auto">
            <ReportPeriodFilter value={period} onChange={setPeriod} />
          </div>

          {data && (
            <div className="w-full lg:w-auto">
              <ExportMenu data={data} />
            </div>
          )}
        </div>
      </div>

      {/* AI INSIGHT */}
      <div className="print:hidden">
        <AiInsightTeaser />
      </div>

      {/* LOADING */}
      {isLoading && <ReportsSkeleton />}

      {/* ERROR */}
      {!isLoading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-center sm:p-6">
          <p className="font-semibold text-red-600">
            Gagal memuat laporan
          </p>

          <p className="mt-1 text-sm leading-relaxed text-red-500">
            {error}
          </p>

          <button
            onClick={() => void loadReports()}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600"
          >
            <RefreshCw className="h-4 w-4" />
            Coba Lagi
          </button>
        </div>
      )}

      {/* CONTENT */}
      {!isLoading && !error && data && (
        <div
          id="report-content"
          className="min-w-0 space-y-4 sm:space-y-6"
        >
          {/* PRINT HEADER */}
          <div className="hidden print:mb-4 print:block">
            <h1 className="text-xl font-bold">
              Laporan ApotekIn — {data.period.label}
            </h1>

            <p className="text-xs text-slate-500">
              Dicetak pada{" "}
              {new Date().toLocaleString("id-ID")}
            </p>
          </div>

          {/* TOP SUMMARY */}
          <ReportsTopSection
            summary={data.summary}
            periodLabel={data.period.label}
          />

          {/* METRICS */}
          <MetricsGrid metrics={data.metrics} />

          {/* ANALYTICS */}
          <AnalyticsSection
            trends={data.trends}
            suppliers={data.suppliers}
            periodLabel={data.period.label}
          />

          {/* SECONDARY CARDS */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
            <FinancialSummaryCard financial={data.financial} />

            <TopProductsCard products={data.topProducts} />

            <div className="sm:col-span-2 xl:col-span-1">
              <ExpiringSoonCard batches={data.expiringSoon} />
            </div>
          </div>

          {/* EFFICIENCY TABLE */}
          <EfficiencyTable data={data.efficiency} />
        </div>
      )}

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }

          #report-content,
          #report-content * {
            visibility: visible;
          }

          #report-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }

          #report-content > * {
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}