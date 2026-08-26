import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/prisma/config";
import { POStatus } from "@/prisma/config";
import type {
  SupplierPerformanceItem,
  DeliveryStatus,
} from "@/types/dashboard";

export const dynamic = "force-dynamic";

/**
 * Computes on-time delivery stats for each active supplier.
 * - OnTime: receivedAt <= expectedDeliveryAt
 * - Delayed: receivedAt > expectedDeliveryAt
 * Fallback (when no expectedDeliveryAt): uses purchaseOrder.status.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Sesi tidak valid." },
      { status: 401 },
    );
  }

  try {
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

      // Fallback when expectedDeliveryAt is not set — use PO status as proxy
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

      // Status classification
      let status: DeliveryStatus = "ON_TIME";
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

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[DASHBOARD/SUPPLIERS]", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data performa supplier." },
      { status: 500 },
    );
  }
}
