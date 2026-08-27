import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/prisma/config";
import { StockOutReason } from "@/prisma/config";
import type {
  AiExecutiveSummaryPayload,
  FastMovingVelocity,
} from "@/types/dashboard";
import { nowPlusDays } from "@/lib/date";

export const dynamic = "force-dynamic";

/**
 * Agregasi data 24 jam terakhir untuk dikirim ke Gemini AI API:
 * - Top fast-moving drugs (by quantity sold)
 * - Count of critical items
 * - FEFO compliance %
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
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const threshold30 = nowPlusDays(30);

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
            itemId: true,
            item: {
              select: { id: true, name: true, code: true },
            },
          },
        },
      },
    });

    const velocityMap = new Map<
      string,
      { itemId: string; itemName: string; itemCode: string; qty: number }
    >();
    for (const soi of recentOutItems) {
      const { id, name, code } = soi.batch.item;
      const existing = velocityMap.get(id) ?? {
        itemId: id,
        itemName: name,
        itemCode: code,
        qty: 0,
      };
      existing.qty += soi.quantity;
      velocityMap.set(id, existing);
    }

    const fastMoving: FastMovingVelocity[] = Array.from(velocityMap.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5)
      .map((v) => ({
        itemId: v.itemId,
        itemName: v.itemName,
        itemCode: v.itemCode,
        totalQtySold24h: v.qty,
      }));

    const items = await prisma.item.findMany({
      where: { isActive: true },
      select: {
        minStock: true,
        batches: { select: { quantity: true, expiryDate: true } },
      },
    });

    let criticalItemCount = 0;
    for (const item of items) {
      const totalStock = item.batches.reduce((acc, b) => acc + b.quantity, 0);
      const activeBatches = item.batches.filter((b) => b.quantity > 0);
      const nearestExpiry = activeBatches.reduce<Date | null>((n, b) => {
        if (!n || b.expiryDate < n) return b.expiryDate;
        return n;
      }, null);
      const stockOk = totalStock > item.minStock;
      const expiryOk = nearestExpiry ? nearestExpiry > threshold30 : true;
      if (!stockOk || !expiryOk) criticalItemCount++;
    }
    
    const recentOuts = await prisma.stockOutItem.findMany({
      where: { stockOut: { createdAt: { gte: since24h } } },
      select: {
        quantity: true,
        batch: {
          select: {
            id: true,
            expiryDate: true,
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
    });

    let fefoCompliant = 0;
    const fefoTotal = recentOuts.length;

    for (const soi of recentOuts) {
      const oldestBatch = soi.batch.item.batches[0];
      if (oldestBatch && oldestBatch.id === soi.batch.id) fefoCompliant++;
    }

    const fefoCompliancePct =
      fefoTotal > 0 ? Math.round((fefoCompliant / fefoTotal) * 100) : 100;

    const payload: AiExecutiveSummaryPayload = {
      snapshotAt: new Date().toISOString(),
      criticalItemCount,
      fastMoving,
      fefoCompliancePct,
      promptHint:
        "Berikan ringkasan eksekutif singkat dalam Bahasa Indonesia tentang kondisi inventaris apotek, " +
        "rekomendasikan tindakan untuk item kritis, dan beri insight tentang perputaran obat fast-moving.",
    };

    return NextResponse.json({ success: true, data: payload });
  } catch (error) {
    console.error("[DASHBOARD/AI-PAYLOAD]", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil payload AI summary." },
      { status: 500 },
    );
  }
}
