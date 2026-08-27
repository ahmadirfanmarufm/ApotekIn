import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/prisma/config";
import { StockOutReason } from "@/prisma/config";
import type { TopMovingItem } from "@/types/dashboard";

export const dynamic = "force-dynamic";

/**
 * Aggregates total quantity sold per item over the last 30 days.
 * Returns top 5 ordered by total quantity DESC.
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
    const since = new Date();
    since.setDate(since.getDate() - 30);
    since.setHours(0, 0, 0, 0);

    const outItems = await prisma.stockOutItem.findMany({
      where: {
        stockOut: {
          reason: StockOutReason.SALE,
          createdAt: { gte: since },
        },
      },
      select: {
        quantity: true,
        batch: {
          select: {
            item: {
              select: { id: true, name: true, code: true },
            },
          },
        },
      },
    });

    const qtyMap = new Map<
      string,
      { itemId: string; itemName: string; itemCode: string; total: number }
    >();

    for (const soi of outItems) {
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

    const data: TopMovingItem[] = sorted.map((item) => ({
      itemId: item.itemId,
      itemCode: item.itemCode,
      itemName: item.itemName,
      totalQty: item.total,
      relativePercent: Math.round((item.total / maxQty) * 100),
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[DASHBOARD/FAST-MOVING]", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data fast-moving items." },
      { status: 500 },
    );
  }
}
