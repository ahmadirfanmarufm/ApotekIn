import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/prisma/config";
import type { StockAlertItem, StockAlertReason } from "@/types/dashboard";
import { nowPlusDays, daysFromNow } from "@/lib/date";

export const dynamic = "force-dynamic";

/**
 * Returns top 5 items that are LOW_STOCK, NEAR_EXPIRY, or BOTH.
 * Sort priority: BOTH first, then LOW_STOCK, then NEAR_EXPIRY.
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
    const threshold30 = nowPlusDays(30);

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

    for (const item of items) {
      const currentStock = item.batches.reduce((acc, b) => acc + b.quantity, 0);
      const nearestExpiry = item.batches[0]?.expiryDate ?? null;

      const isLowStock = currentStock <= item.minStock;
      const isNearExpiry =
        nearestExpiry !== null && nearestExpiry <= threshold30;

      if (!isLowStock && !isNearExpiry) continue;

      const reason: StockAlertReason =
        isLowStock && isNearExpiry
          ? "BOTH"
          : isLowStock
            ? "LOW_STOCK"
            : "NEAR_EXPIRY";

      const daysUntilExpiry = nearestExpiry ? daysFromNow(nearestExpiry) : null;

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

    // Sort: BOTH first, LOW_STOCK second, NEAR_EXPIRY last; then by daysUntilExpiry asc
    const reasonOrder: Record<StockAlertReason, number> = {
      BOTH: 0,
      LOW_STOCK: 1,
      NEAR_EXPIRY: 2,
    };

    const data = alerts
      .sort((a, b) => {
        const rDiff = reasonOrder[a.reason] - reasonOrder[b.reason];
        if (rDiff !== 0) return rDiff;
        if (a.daysUntilExpiry !== null && b.daysUntilExpiry !== null) {
          return a.daysUntilExpiry - b.daysUntilExpiry;
        }
        return a.currentStock - b.currentStock;
      })
      .slice(0, 5);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[DASHBOARD/ALERTS]", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data stock alerts." },
      { status: 500 },
    );
  }
}
