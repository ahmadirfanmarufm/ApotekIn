import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/prisma/config";
import type { RecentActivityItem } from "@/types/dashboard";
import { toRelativeTime } from "@/lib/date";

export const dynamic = "force-dynamic";

const REASON_LABELS: Record<string, string> = {
  SALE: "Penjualan",
  TRANSFER: "Transfer",
  RETURN_TO_SUPPLIER: "Retur ke Supplier",
  EXPIRED: "Kedaluwarsa",
  DAMAGED: "Rusak",
};

const STATUS_LABELS: Record<string, string> = {
  IN_PROGRESS: "Sedang Berlangsung",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

/**
 * Merges recent stock-outs, stock receipts, and audits into one
 * activity feed sorted by timestamp DESC, capped at 5 items.
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
    // ── Source 1: Stock outs (sales, write-offs, transfers) ──
    const stockOuts = await prisma.stockOut.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        createdAt: true,
        reason: true,
        createdBy: { select: { fullName: true } },
        _count: { select: { items: true } },
      },
    });

    const stockOutActivities: RecentActivityItem[] = stockOuts.map((so) => ({
      id: so.id,
      source: "STOCK_OUT",
      title:
        REASON_LABELS[so.reason as keyof typeof REASON_LABELS] ?? so.reason,
      description: `${so._count.items} item dikeluarkan oleh ${so.createdBy.fullName}`,
      actorName: so.createdBy.fullName,
      createdAt: so.createdAt.toISOString(),
      relativeTime: toRelativeTime(so.createdAt),
    }));

    // ── Source 2: Stock receipts (incoming goods) ──
    const receipts = await prisma.stockReceipt.findMany({
      orderBy: { receivedAt: "desc" },
      take: 5,
      select: {
        id: true,
        receiptNumber: true,
        receivedAt: true,
        createdBy: { select: { fullName: true } },
        supplier: { select: { name: true } },
        _count: { select: { items: true } },
      },
    });

    const receiptActivities: RecentActivityItem[] = receipts.map((sr) => ({
      id: sr.id,
      source: "STOCK_RECEIPT",
      title: `Penerimaan ${sr.supplier.name}`,
      description: `${sr.receiptNumber} — ${sr._count.items} item diterima oleh ${sr.createdBy.fullName}`,
      actorName: sr.createdBy.fullName,
      createdAt: sr.receivedAt.toISOString(),
      relativeTime: toRelativeTime(sr.receivedAt),
    }));

    // ── Source 3: Stock audits ──
    const audits = await prisma.stockAudit.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        auditNumber: true,
        status: true,
        createdAt: true,
        conductedBy: { select: { fullName: true } },
      },
    });
    const auditActivities: RecentActivityItem[] = audits.map((a) => ({
      id: a.id,
      source: "STOCK_AUDIT",
      title: `Audit Stok ${STATUS_LABELS[a.status] ?? a.status}`,
      description: `${a.auditNumber} — dilakukan oleh ${a.conductedBy.fullName}`,
      actorName: a.conductedBy.fullName,
      createdAt: a.createdAt.toISOString(),
      relativeTime: toRelativeTime(a.createdAt),
    }));

    // Merge & sort by createdAt desc
    const data = [
      ...stockOutActivities,
      ...receiptActivities,
      ...auditActivities,
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[DASHBOARD/ACTIVITIES]", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil aktivitas terbaru." },
      { status: 500 },
    );
  }
}
