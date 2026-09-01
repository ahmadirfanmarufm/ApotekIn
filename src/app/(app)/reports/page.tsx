import React from "react";
import { Button } from "@/components/ui/button";
import { ReportsTopSection } from "@/components/reports/ReportsTopSection";
import { MetricsGrid } from "@/components/reports/MetricsGrid";
import { AnalyticsSection } from "@/components/reports/AnalyticsSection";
import { EfficiencyTable } from "@/components/reports/EfficiencyTable";

export default function ReportsPage() {
  return (
    <div className="space-y-6 font-inter text-slate-800 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-2 mb-4">
        <div>
          <h1 className="text-2xl font-bold font-manrope text-slate-950">
            Laporan & Analisis
          </h1>
          <p className="text-slate-500 mt-1">
            Real-time performance data for your pharmaceutical operations.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            className="bg-white text-slate-700 border-slate-200 shadow-sm w-full sm:w-auto"
          >
            Ekspor PDF
          </Button>
          <Button className="bg-[#22C55E] hover:bg-green-600 text-white shadow-sm flex items-center justify-center gap-2 w-full sm:w-auto">
            <span>Bagikan Laporan</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <ReportsTopSection />
        <MetricsGrid />
        <AnalyticsSection />
        <EfficiencyTable />
      </div>
    </div>
  );
}
