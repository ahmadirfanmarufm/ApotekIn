import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { revalidateTag } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/prisma/config";
import { POStatus, StockOutReason } from "@/prisma/config";
import type {
  ExecutiveSummary,
  RecentActivityItem,
  StockAlertItem,
  SupplierPerformanceItem,
  TopMovingItem,
} from "@/types/dashboard";
import { buildNarrative, type NarrativeInput } from "@/lib/executive-narrative";
import {
  endOfDay,
  nowPlusDays,
  startOfDay,
  toDateKey,
  toRelativeTime,
} from "@/lib/date";

export const dynamic = "force-dynamic";

const CACHE_TTL_SECONDS = 300; // 5 minutes
const CACHE_TAG = "dashboard:executive-summary";
const SINCE_24H_MS = 24 * 60 * 60 * 1000;
const SINCE_30D_MS = 30 * 24 * 60 * 60 * 1000;
const SINCE_15D_MS = 15 * 24 * 60 * 60 * 1000;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Sesi tidak valid." },
      { status: 401 },
    );
  }

  try {
    const data = await getCachedExecutiveSummary();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[DASHBOARD/EXECUTIVE-SUMMARY]", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyusun executive summary." },
      { status: 500 },
    );
  }
}

export function revalidateDashboardSummary(): void {
  revalidateTag(CACHE_TAG, "max");
}

const getCachedExecutiveSummary = unstable_cache(
  async (): Promise<ExecutiveSummary> => computeExecutiveSummary(),
  [CACHE_TAG],
  { revalidate: CACHE_TTL_SECONDS, tags: [CACHE_TAG] },
);

async function computeExecutiveSummary(): Promise<ExecutiveSummary> {
  const now = new Date();
  const since24h = new Date(now.getTime() - SINCE_24H_MS);
  const since30d = new Date(now.getTime() - SINCE_30D_MS);
  const threshold30 = nowPlusDays(30);
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  const [
    healthMetrics,
    topAlerts,
    fastMoving,
    financialAgg,
    pendingTasks,
    suppliers,
    recentActivities,
  ] = await Promise.all([
    computeHealthMetrics(threshold30),
    computeTopAlerts(threshold30, 5),
    computeFastMoving(since24h),
    computeFinancial(since30d),
    computePendingTasks(todayStart, todayEnd),
    computeSupplierPerformance(),
    computeRecentActivities(3),
  ]);

  const topCriticalItem = topAlerts[0]
    ? {
        itemId: topAlerts[0].itemId,
        itemName: topAlerts[0].itemName,
        daysUntilExpiry: topAlerts[0].daysUntilExpiry,
      }
    : null;

  const topFastMoving = fastMoving.topMoving[0];
  const fastMovingName = topFastMoving?.itemName ?? null;
  const fastMovingQty = topFastMoving?.totalQty ?? 0;

  const onTimeSupplierPct = computeOverallOnTimePct(suppliers);

  const lastActivity = recentActivities[0]
    ? {
        title: recentActivities[0].title,
        actor: recentActivities[0].actorName,
        relativeTime: recentActivities[0].relativeTime,
      }
    : null;

  const hasAnyData = healthMetrics.totalSku > 0;

  const narrativeInput: NarrativeInput = {
    healthScore: healthMetrics.healthScore,
    criticalCount: healthMetrics.criticalCount,
    topCriticalItem: topCriticalItem
      ? {
          itemName: topCriticalItem.itemName,
          daysUntilExpiry: topCriticalItem.daysUntilExpiry,
        }
      : null,
    fastMovingName,
    fastMovingQty,
    fefoCompliancePct: fastMoving.fefoCompliancePct,
    revenue30d: financialAgg.revenue,
    expense30d: financialAgg.expense,
    marginPct: financialAgg.marginPct,
    pendingTasksCount: pendingTasks,
    onTimeSupplierPct,
    hasAnyData,
  };

  const generatedAt = new Date().toISOString();
  const cachedUntil = new Date(
    Date.now() + CACHE_TTL_SECONDS * 1000,
  ).toISOString();

  return {
    healthScore: healthMetrics.healthScore,
    totalSku: healthMetrics.totalSku,
    criticalCount: healthMetrics.criticalCount,
    topCriticalItem,
    fastMovingName,
    fastMovingQty,
    fefoCompliancePct: fastMoving.fefoCompliancePct,
    revenue30d: financialAgg.revenue,
    expense30d: financialAgg.expense,
    marginPct: financialAgg.marginPct,
    pendingTasksCount: pendingTasks,
    onTimeSupplierPct,
    lastActivity,
    narrative: buildNarrative(narrativeInput),
    generatedAt,
    cachedUntil,
  };
}

async function computeHealthMetrics(threshold30: Date) {
  const items = await prisma.item.findMany({
    where: { isActive: true },
    select: {
      minStock: true,
      batches: { select: { quantity: true, expiryDate: true } },
    },
  });

  if (items.length === 0) {
    return { healthScore: 0, totalSku: 0, criticalCount: 0 };
  }

  let safeSku = 0;
  let criticalCount = 0;

  for (const item of items) {
    const totalStock = item.batches.reduce((acc, b) => acc + b.quantity, 0);
    const activeBatches = item.batches.filter((b) => b.quantity > 0);
    const nearestExpiry = activeBatches.reduce<Date | null>((n, b) => {
      if (!n || b.expiryDate < n) return b.expiryDate;
      return n;
    }, null);
    const stockOk = totalStock > item.minStock;
    const expiryOk = nearestExpiry ? nearestExpiry > threshold30 : true;

    if (stockOk && expiryOk) safeSku++;
    else criticalCount++;
  }

  const totalSku = items.length;
  const healthScore = totalSku > 0 ? Math.round((safeSku / totalSku) * 100) : 0;

  return { healthScore, totalSku, criticalCount };
}

async function computeTopAlerts(
  threshold30: Date,
  limit: number,
): Promise<StockAlertItem[]> {
  const items = await prisma.item.findMany({
    where: { isActive: true },
    select: {
      id: true,
      code: true,
      name: true,
      minStock: true,
      batches: {
        where: { quantity: { gt: 0 } },
        select: { quantity: true, expiryDate: true },
        orderBy: { expiryDate: "asc" },
      },
    },
  });

  const alerts: StockAlertItem[] = [];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  for (const item of items) {
    const currentStock = item.batches.reduce((acc, b) => acc + b.quantity, 0);
    const nearestExpiry = item.batches[0]?.expiryDate ?? null;
    const isLowStock = currentStock <= item.minStock;
    const isNearExpiry = nearestExpiry !== null && nearestExpiry <= threshold30;
    if (!isLowStock && !isNearExpiry) continue;

    const reason =
      isLowStock && isNearExpiry
        ? "BOTH"
        : isLowStock
          ? "LOW_STOCK"
          : "NEAR_EXPIRY";
    const daysUntilExpiry = nearestExpiry
      ? Math.ceil((nearestExpiry.getTime() - now) / dayMs)
      : null;

    alerts.push({
      itemId: item.id,
      itemCode: item.code,
      itemName: item.name,
      currentStock,
      minStock: item.minStock,
      nearestExpiry: nearestExpiry?.toISOString() ?? null,
      daysUntilExpiry,
      reason,
    });
  }

  const reasonOrder = { BOTH: 0, LOW_STOCK: 1, NEAR_EXPIRY: 2 } as const;
  return alerts
    .sort((a, b) => {
      const rDiff = reasonOrder[a.reason] - reasonOrder[b.reason];
      if (rDiff !== 0) return rDiff;
      if (a.daysUntilExpiry !== null && b.daysUntilExpiry !== null) {
        return a.daysUntilExpiry - b.daysUntilExpiry;
      }
      return a.currentStock - b.currentStock;
    })
    .slice(0, limit);
}

async function computeFastMoving(since24h: Date) {
  const recentOutItems = await prisma.stockOutItem.findMany({
    where: {
      stockOut: {
        createdAt: { gte: since24h },
        reason: StockOutReason.SALE,
      },
    },
    select: {
      quantity: true,
      batch: {
        select: {
          id: true,
          item: { select: { id: true, name: true, code: true } },
        },
      },
    },
  });

  const qtyMap = new Map<
    string,
    { itemId: string; itemName: string; itemCode: string; total: number }
  >();
  for (const soi of recentOutItems) {
    const { id, name, code } = soi.batch.item;
    const existing = qtyMap.get(id) ?? {
      itemId: id,
      itemName: name,
      itemCode: code,
      total: 0,
    };
    existing.total += soi.quantity;
    qtyMap.set(id, existing);
  }

  const sorted = Array.from(qtyMap.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const maxQty = sorted[0]?.total ?? 1;
  const topMoving: TopMovingItem[] = sorted.map((it) => ({
    itemId: it.itemId,
    itemCode: it.itemCode,
    itemName: it.itemName,
    totalQty: it.total,
    relativePercent: Math.round((it.total / maxQty) * 100),
  }));

  // FEFO compliance
  const recentAllOuts = await prisma.stockOutItem.findMany({
    where: { stockOut: { createdAt: { gte: since24h } } },
    select: {
      batch: { select: { id: true } },
      batchId: true,
      stockOut: {
        select: {
          items: {
            select: {
              batch: {
                select: {
                  item: {
                    select: {
                      batches: {
                        where: { quantity: { gt: 0 } },
                        select: { id: true, expiryDate: true },
                        orderBy: { expiryDate: "asc" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  let fefoCompliant = 0;
  let fefoTotal = 0;
  for (const soi of recentAllOuts) {
    fefoTotal++;
    const oldest = soi.stockOut.items[0]?.batch.item.batches[0];
    if (oldest && oldest.id === soi.batch.id) fefoCompliant++;
  }
  const fefoCompliancePct =
    fefoTotal > 0 ? Math.round((fefoCompliant / fefoTotal) * 100) : 100;

  return { topMoving, fefoCompliancePct };
}

async function computeFinancial(since30d: Date) {
  const salesOuts = await prisma.stockOut.findMany({
    where: { reason: StockOutReason.SALE, createdAt: { gte: since30d } },
    select: {
      createdAt: true,
      items: { select: { quantity: true, unitPrice: true } },
    },
  });

  const dayMap = new Map<string, { revenue: number; expense: number }>();
  for (const so of salesOuts) {
    const key = toDateKey(so.createdAt);
    const entry = dayMap.get(key) ?? { revenue: 0, expense: 0 };
    for (const item of so.items) {
      entry.revenue += item.quantity * Number(item.unitPrice);
    }
    dayMap.set(key, entry);
  }

  const receipts = await prisma.stockReceipt.findMany({
    where: { receivedAt: { gte: since30d } },
    select: {
      receivedAt: true,
      items: { select: { quantity: true, unitPrice: true } },
    },
  });
  for (const sr of receipts) {
    const key = toDateKey(sr.receivedAt);
    const entry = dayMap.get(key) ?? { revenue: 0, expense: 0 };
    for (const item of sr.items) {
      entry.expense += item.quantity * Number(item.unitPrice);
    }
    dayMap.set(key, entry);
  }

  const writeOffs = await prisma.stockOut.findMany({
    where: {
      reason: { in: [StockOutReason.EXPIRED, StockOutReason.DAMAGED] },
      createdAt: { gte: since30d },
    },
    select: {
      createdAt: true,
      items: {
        select: { quantity: true, batch: { select: { buyPrice: true } } },
      },
    },
  });
  for (const wo of writeOffs) {
    const key = toDateKey(wo.createdAt);
    const entry = dayMap.get(key) ?? { revenue: 0, expense: 0 };
    for (const item of wo.items) {
      entry.expense += item.quantity * Number(item.batch.buyPrice);
    }
    dayMap.set(key, entry);
  }

  const values = Array.from(dayMap.values());
  const revenue = values.reduce((s, v) => s + v.revenue, 0);
  const expense = values.reduce((s, v) => s + v.expense, 0);
  const marginPct = revenue > 0 ? ((revenue - expense) / revenue) * 100 : 0;

  return { revenue, expense, marginPct };
}

async function computePendingTasks(
  todayStart: Date,
  todayEnd: Date,
): Promise<number> {
  const [expiring, audits] = await Promise.all([
    prisma.batch.findMany({
      where: {
        expiryDate: { gte: todayStart, lte: todayEnd },
        quantity: { gt: 0 },
      },
      select: { id: true },
    }),
    prisma.stockAudit.findMany({
      where: { status: "IN_PROGRESS" },
      select: { id: true },
    }),
  ]);

  const items = await prisma.item.findMany({
    where: { isActive: true },
    select: {
      minStock: true,
      batches: { select: { quantity: true } },
    },
  });

  let reorderCritical = 0;
  for (const it of items) {
    const total = it.batches.reduce((acc, b) => acc + b.quantity, 0);
    if (total <= it.minStock) reorderCritical++;
  }

  return expiring.length + reorderCritical + audits.length;
}

async function computeSupplierPerformance(): Promise<
  SupplierPerformanceItem[]
> {
  const suppliers = await prisma.supplier.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      code: true,
      purchaseOrders: {
        select: {
          status: true,
          expectedDeliveryAt: true,
          receivedAt: true,
        },
      },
    },
  });

  const result: SupplierPerformanceItem[] = [];
  for (const s of suppliers) {
    let onTime = 0;
    let delayed = 0;
    let pending = 0;
    for (const po of s.purchaseOrders) {
      if (!po.receivedAt) {
        pending++;
        continue;
      }
      if (!po.expectedDeliveryAt) continue;
      if (po.receivedAt > po.expectedDeliveryAt) delayed++;
      else onTime++;
    }

    const hasExpected = s.purchaseOrders.some((po) => po.expectedDeliveryAt);
    if (!hasExpected && s.purchaseOrders.length > 0) {
      onTime = s.purchaseOrders.filter(
        (po) => po.status === POStatus.COMPLETED,
      ).length;
      const totalDelivered = s.purchaseOrders.length;
      delayed = Math.max(0, totalDelivered - onTime);
      pending = s.purchaseOrders.filter(
        (po) => po.status === POStatus.PENDING,
      ).length;
    }

    const denominator = onTime + delayed || 1;
    const onTimePct = Math.round((onTime / denominator) * 100);

    let status: SupplierPerformanceItem["status"] = "ON_TIME";
    if (pending > 0 && onTime + delayed === 0) status = "PENDING";
    else if (onTimePct >= 80) status = "ON_TIME";
    else status = "DELAYED";

    result.push({
      supplierId: s.id,
      supplierName: s.name,
      supplierCode: s.code ?? "-",
      totalDeliveries: s.purchaseOrders.length,
      onTimeCount: onTime,
      delayedCount: delayed,
      pendingCount: pending,
      onTimePct,
      status,
    });
  }
  return result;
}

function computeOverallOnTimePct(suppliers: SupplierPerformanceItem[]): number {
  let totalOnTime = 0;
  let totalDelivered = 0;
  for (const s of suppliers) {
    totalOnTime += s.onTimeCount;
    totalDelivered += s.onTimeCount + s.delayedCount;
  }
  if (totalDelivered === 0) return 0;
  return Math.round((totalOnTime / totalDelivered) * 100);
}

async function computeRecentActivities(
  take: number,
): Promise<RecentActivityItem[]> {
  const since15d = new Date(Date.now() - SINCE_15D_MS);

  const [stockOuts, receipts, audits] = await Promise.all([
    prisma.stockOut.findMany({
      where: { createdAt: { gte: since15d } },
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        createdAt: true,
        reason: true,
        createdBy: { select: { fullName: true } },
        _count: { select: { items: true } },
      },
    }),
    prisma.stockReceipt.findMany({
      where: { receivedAt: { gte: since15d } },
      orderBy: { receivedAt: "desc" },
      take,
      select: {
        id: true,
        receiptNumber: true,
        receivedAt: true,
        createdBy: { select: { fullName: true } },
        supplier: { select: { name: true } },
        _count: { select: { items: true } },
      },
    }),
    prisma.stockAudit.findMany({
      where: { createdAt: { gte: since15d } },
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        auditNumber: true,
        status: true,
        createdAt: true,
        conductedBy: { select: { fullName: true } },
      },
    }),
  ]);

  const reasonLabels: Record<string, string> = {
    SALE: "Penjualan",
    TRANSFER: "Transfer",
    RETURN_TO_SUPPLIER: "Retur ke Supplier",
    EXPIRED: "Kedaluwarsa",
    DAMAGED: "Rusak",
  };
  const statusLabels: Record<string, string> = {
    IN_PROGRESS: "Sedang Berlangsung",
    COMPLETED: "Selesai",
    CANCELLED: "Dibatalkan",
  };

  const merged: RecentActivityItem[] = [
    ...stockOuts.map((so) => ({
      id: so.id,
      source: "STOCK_OUT" as const,
      title: reasonLabels[so.reason] ?? so.reason,
      description: `${so._count.items} item dikeluarkan oleh ${so.createdBy.fullName}`,
      actorName: so.createdBy.fullName,
      createdAt: so.createdAt.toISOString(),
      relativeTime: toRelativeTime(so.createdAt),
    })),
    ...receipts.map((sr) => ({
      id: sr.id,
      source: "STOCK_RECEIPT" as const,
      title: `Penerimaan ${sr.supplier.name}`,
      description: `${sr.receiptNumber} — ${sr._count.items} item diterima oleh ${sr.createdBy.fullName}`,
      actorName: sr.createdBy.fullName,
      createdAt: sr.receivedAt.toISOString(),
      relativeTime: toRelativeTime(sr.receivedAt),
    })),
    ...audits.map((a) => ({
      id: a.id,
      source: "STOCK_AUDIT" as const,
      title: `Audit Stok ${statusLabels[a.status] ?? a.status}`,
      description: `${a.auditNumber} — dilakukan oleh ${a.conductedBy.fullName}`,
      actorName: a.conductedBy.fullName,
      createdAt: a.createdAt.toISOString(),
      relativeTime: toRelativeTime(a.createdAt),
    })),
  ];

  return merged
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, take);
}
