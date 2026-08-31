import { Lightbulb } from "lucide-react";

import type { InsightOpportunity } from "@/types/insight";

interface OpportunitiesCardProps {
  opportunities: InsightOpportunity[];
}

export function OpportunitiesCard({ opportunities }: OpportunitiesCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
      <div className="mb-4 flex items-center gap-2">
        <Lightbulb className="h-5 w-5 shrink-0 text-emerald-500" />
        <div>
          <h3 className="font-manrope text-base font-bold text-slate-900 sm:text-lg">
            Peluang
          </h3>
          <p className="text-xs text-slate-400">Hal positif yang bisa dimanfaatkan</p>
        </div>
      </div>

      {opportunities.length === 0 ? (
        <div className="flex min-h-[140px] flex-col items-center justify-center text-center">
          <Lightbulb className="mb-2 h-8 w-8 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">Belum ada peluang menonjol</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {opportunities.map((opp, i) => (
            <div key={i} className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
              <p className="mb-1 text-sm font-bold text-emerald-800">{opp.title}</p>
              <p className="text-xs leading-relaxed text-emerald-700/90">{opp.detail}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
