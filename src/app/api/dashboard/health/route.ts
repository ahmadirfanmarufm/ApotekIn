import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/prisma/config";
import type { InventoryHealthData } from "@/types/dashboard";
import { nowPlusDays } from "@/lib/date";

export const dynamic = "force-dynamic";

/**
 * Kalkulasi Inventory Health Score:
 *   score = (safeSku / totalSku) * 100
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

    // Fetch all active items with their aggregated batch stock
    const items = await prisma.item.findMany({
      where: { isActive: true },
      select: {
        id: true,
        minStock: true,
        batches: {
          select: {
            quantity: true,
            expiryDate: true,
          },
        },
      },
    });

    if (items.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          score: 0,
          totalSku: 0,
          criticalCount: 0,
          safeSku: 0,
        } satisfies InventoryHealthData,
      });
    }

    let safeSku = 0;
    let criticalCount = 0;

    for (const item of items) {
      // Sum all batch quantities for this item
      const totalStock = item.batches.reduce((acc, b) => acc + b.quantity, 0);

      // Find the soonest expiring batch with stock > 0
      const activeBatches = item.batches.filter((b) => b.quantity > 0);
      const nearestExpiry = activeBatches.reduce<Date | null>((nearest, b) => {
        if (!nearest || b.expiryDate < nearest) return b.expiryDate;
        return nearest;
      }, null);

      const stockOk = totalStock > item.minStock;
      const expiryOk = nearestExpiry ? nearestExpiry > threshold30 : true;

      if (stockOk && expiryOk) {
        safeSku++;
      } else {
        criticalCount++;
      }
    }

    const totalSku = items.length;
    const score = totalSku > 0 ? Math.round((safeSku / totalSku) * 100) : 0;

    const data: InventoryHealthData = {
      score,
      totalSku,
      criticalCount,
      safeSku,
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[DASHBOARD/HEALTH]", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data inventory health." },
      { status: 500 },
    );
  }
}
