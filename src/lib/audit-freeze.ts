import { prisma, AuditStatus } from "@/prisma/config";

export interface AuditFreezeStatus {
  isFreezeActive: boolean;
  activeAudit: {
    id: string;
    auditNumber: string;
    conductedById: string;
    broughtAt: Date;
  } | null;
}

export async function getAuditFreezeStatus(): Promise<AuditFreezeStatus> {
  const activeAudit = await prisma.stockAudit.findFirst({
    where: {
      status: AuditStatus.IN_PROGRESS,
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      auditNumber: true,
      conductedById: true,
      createdAt: true,
    },
  });

  return {
    isFreezeActive: Boolean(activeAudit),
    activeAudit: activeAudit
      ? {
          id: activeAudit.id,
          auditNumber: activeAudit.auditNumber,
          conductedById: activeAudit.conductedById,
          broughtAt: activeAudit.createdAt,
        }
      : null,
  };
}

export async function assertStockNotFrozen() {
  const { isFreezeActive } = await getAuditFreezeStatus();

  if (isFreezeActive) {
    const error = new Error("STOCK_AUDIT_FREEZE_ACTIVE") as Error & {
      code: string;
    };
    error.code = "ERR_STOCK_FROZEN";

    throw error;
  }
}
