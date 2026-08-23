"use client";

import React from "react";
import { TrendingUp } from "lucide-react";

interface FinancialAnalysisSectionProps {
  onViewPL?: () => void;
}

export function FinancialAnalysisSection({ onViewPL }: FinancialAnalysisSectionProps) {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        {/* Title Header */}
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-5">
          ANALISIS KEUANGAN
        </h2>

        {/* Financial Metrics */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-600">Margin Kotor</span>
            <span className="text-lg font-bold text-emerald-600 font-manrope">
              $42,850
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="text-sm font-medium text-slate-600">Biaya Pengadaan</span>
            <span className="text-sm font-bold text-slate-900">$18,200</span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="text-sm font-medium text-slate-600">Biaya Penyimpanan</span>
            <span className="text-sm font-bold text-slate-900">$2,100</span>
          </div>
        </div>
      </div>

      {/* AI Financial Recommendation Callout */}
      <div className="space-y-3">
        <div className="rounded-xl bg-blue-50/60 p-4 border border-blue-100 space-y-2">
          <div className="flex items-center gap-2 text-blue-700 font-bold text-xs">
            <TrendingUp className="h-4 w-4" />
            <span>Rekomendasi AI</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            Mengalihkan anggaran sebesar $4.000 ke suplemen Vitamin C dapat
            menghasilkan peningkatan ROI sebesar 18% berdasarkan tren flu musiman.
          </p>
        </div>

        {/* View Full P&L Button */}
        <button
          type="button"
          onClick={onViewPL}
          className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-2.5 transition-colors shadow-sm cursor-pointer"
        >
          View Full P&L
        </button>
      </div>
    </div>
  );
}
