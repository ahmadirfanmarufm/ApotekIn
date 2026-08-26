import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/prisma/config";
import { StockOutReason } from "@/prisma/config";
import type { FinancialChartData, FinancialDayData } from "@/types/dashboard";
import { toDateKey } from "@/lib/date";
import { z } from "zod";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  days: z.coerce.number().int().min(7).max(90).default(30),
});

/**
 * Agregasi revenue & expense per hari selama N hari terakhir.
 * Revenue: penjualan (StockOut reason=SALE)
 * Expense: pembelian (StockReceipt) + write-off expired/damaged (buy price)
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Sesi tidak valid." },
      { status: 401 },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({ days: searchParams.get("days") });

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Parameter 'days' harus berupa angka antara 7 dan 90.",
        },
        { status: 400 },
      );
    }

    const days = parsed.data.days;
    const since = new Date();
    since.setDate(since.getDate() - (days - 1));
    since.setHours(0, 0, 0, 0);

    // Build a lookup map pre-filled with zero for each day
    const dayMap = new Map<string, FinancialDayData>();
    for (let i = 0; i < days; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      const key = toDateKey(d);
      dayMap.set(key, { date: key, revenue: 0, expense: 0 });
    }

    // ── Revenue (Sales StockOut) ──
    const salesOuts = await prisma.stockOut.findMany({
      where: {
        reason: StockOutReason.SALE,
        createdAt: { gte: since },
      },
      select: {
        createdAt: true,
        items: {
          select: {
            quantity: true,
            unitPrice: true,
          },
        },
      },
    });

    for (const so of salesOuts) {
      const key = toDateKey(so.createdAt);
      const entry = dayMap.get(key);
      if (!entry) continue;
      for (const item of so.items) {
        entry.revenue += item.quantity * Number(item.unitPrice);
      }
    }

    // ── Expense source 1: Stock Receipts (PBF purchases) ──
    const receipts = await prisma.stockReceipt.findMany({
      where: { receivedAt: { gte: since } },
      select: {
        receivedAt: true,
        items: {
          select: {
            quantity: true,
            unitPrice: true,
          },
        },
      },
    });

    for (const sr of receipts) {
      const key = toDateKey(sr.receivedAt);
      const entry = dayMap.get(key);
      if (!entry) continue;
      for (const item of sr.items) {
        entry.expense += item.quantity * Number(item.unitPrice);
      }
    }

    // ── Expense source 2: Expired/Damaged write-offs (buy price cost) ──
    const writeOffs = await prisma.stockOut.findMany({
      where: {
        reason: { in: [StockOutReason.EXPIRED, StockOutReason.DAMAGED] },
        createdAt: { gte: since },
      },
      select: {
        createdAt: true,
        items: {
          select: {
            quantity: true,
            batch: {
              select: { buyPrice: true },
            },
          },
        },
      },
    });

    for (const wo of writeOffs) {
      const key = toDateKey(wo.createdAt);
      const entry = dayMap.get(key);
      if (!entry) continue;
      for (const item of wo.items) {
        entry.expense += item.quantity * Number(item.batch.buyPrice);
      }
    }

    const dayArray = Array.from(dayMap.values());
    const totalRevenue = dayArray.reduce((s, d) => s + d.revenue, 0);
    const totalExpense = dayArray.reduce((s, d) => s + d.expense, 0);

    const data: FinancialChartData = {
      days: dayArray,
      totalRevenue,
      totalExpense,
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[DASHBOARD/FINANCIAL]", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data keuangan." },
      { status: 500 },
    );
  }
}
