"use client";

import { Lock } from "lucide-react";
import { useAuditFreeze } from "@/hooks/useAuditFreeze";

export function AuditFreezeBanner() {
  const { isFreezeActive, activeAudit } = useAuditFreeze();

  if (!isFreezeActive) {
    return null;
  }

  return (
    <div className="bg-low-stock text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium">
      <Lock className="h-4 w-4 shrink-0" />
      <span>Stok Locked (Audit Mode Active)</span>
      {activeAudit && (
        <span className="opacity-90">— {activeAudit.auditNumber}</span>
      )}
    </div>
  );
}
