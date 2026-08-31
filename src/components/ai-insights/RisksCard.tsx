import { AlertTriangle, ShieldAlert } from "lucide-react";

import type { InsightRisk } from "@/types/insight";

interface RisksCardProps {
  risks: InsightRisk[];
}

const SEVERITY_STYLES: Record<InsightRisk["severity"], string> = {
  high: "border-red-200 bg-red-50 text-red-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  low: "border-slate-200 bg-slate-50 text-slate-600",
};

const SEVERITY_LABEL: Record<InsightRisk["severity"], string> = {
  high: "Tinggi",
  medium: "Sedang",
  low: "Rendah",
};

export function RisksCard({ risks }: RisksCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
      <div className="mb-4 flex items-center gap-2">
        <ShieldAlert className="h-5 w-5 shrink-0 text-red-500" />
        <div>
          <h3 className="font-manrope text-base font-bold text-slate-900 sm:text-lg">
            Risiko Terdeteksi
          </h3>
          <p className="text-xs text-slate-400">Perlu perhatian dalam waktu dekat</p>
        </div>
      </div>

      {risks.length === 0 ? (
        <div className="flex min-h-[140px] flex-col items-center justify-center text-center">
          <ShieldAlert className="mb-2 h-8 w-8 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">Tidak ada risiko signifikan</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {risks.map((risk, i) => (
            <div
              key={i}
              className={`rounded-xl border p-3 ${SEVERITY_STYLES[risk.severity]}`}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="text-sm font-bold">{risk.title}</p>
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-white/60 px-2 py-0.5 text-[10px] font-bold uppercase">
                  <AlertTriangle className="h-3 w-3" />
                  {SEVERITY_LABEL[risk.severity]}
                </span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">{risk.detail}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
