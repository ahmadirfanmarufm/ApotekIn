export type AuditStatusUI = "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface AuditListItem {
  id: string;
  auditNumber: string;
  status: AuditStatusUI;
  notes: string | null;
  createdAt: string;
  completedAt: string | null;
  conductedBy: { id: string; fullName: string };
  _count: { details: number };
}

export interface AuditDetailItem {
  id: string;
  itemId: string;
  batchId: string;
  systemStock: number;
  physicalStock: number;
  difference: number;
  unitPrice: string;
  reason: string | null;
  item: {
    id: string;
    code: string;
    name: string;
    unit: string;
  };
  batch: {
    id: string;
    batchNumber: string;
    expiryDate: string;
    sellPrice: string;
  };
}

export interface AuditDetail {
  id: string;
  auditNumber: string;
  status: AuditStatusUI;
  notes: string | null;
  createdAt: string;
  completedAt: string | null;
  conductedBy: { id: string; fullName: string };
  details: AuditDetailItem[];
}

export const AUDIT_STATUS_LABEL: Record<AuditStatusUI, string> = {
  IN_PROGRESS: "Berlangsung",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};
