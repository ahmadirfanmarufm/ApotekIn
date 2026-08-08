import React from 'react';
import { Button } from "@/components/ui/button";
import { ReportsTopSection } from "@/components/reports/ReportsTopSection";
import { MetricsGrid } from "@/components/reports/MetricsGrid";
import { AnalyticsSection } from "@/components/reports/AnalyticsSection";
import { EfficiencyTable } from "@/components/reports/EfficiencyTable";

export default function ReportsPage() {
    return (
        <div className="space-y-6 font-inter text-slate-800 pb-12">

            <div className="flex justify-between items-start mb-2">
                <div>
                    <h1 className="text-3xl font-bold font-manrope text-slate-950">Laporan & Analisis</h1>
                    <p className="text-slate-500 mt-1">Real-time performance data for your pharmaceutical operations.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="bg-white text-slate-700 border-slate-200 shadow-sm">
                        Ekspor PDF
                    </Button>
                    <Button className="bg-[#22C55E] hover:bg-green-600 text-white shadow-sm flex items-center gap-2">
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