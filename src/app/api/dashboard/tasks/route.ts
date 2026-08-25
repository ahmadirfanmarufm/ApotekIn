import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/prisma/config";
import type { PriorityTaskItem } from "@/types/dashboard";
import { startOfDay, endOfDay } from "@/lib/date";

export const dynamic = "force-dynamic";

/**
 * Builds a dynamic daily task list from three sources:
 * A. Batches expiring today → EXPIRY_TODAY
 * B. Items at/below reorder point → REORDER_CRITICAL
 * C. Stock audits in IN_PROGRESS state → AUDIT_SCHEDULED
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
    const todayStart = startOfDay();
    const todayEnd = endOfDay();
    const tasks: PriorityTaskItem[] = [];

    // ── A. Batches expiring today ──
    const expiringBatches = await prisma.batch.findMany({
      where: {
        expiryDate: { gte: todayStart, lte: todayEnd },
        quantity: { gt: 0 },
      },
      select: {
        id: true,
        batchNumber: true,
        quantity: true,
        expiryDate: true,
        item: { select: { name: true, unit: true } },
      },
      orderBy: { expiryDate: "asc" },
      take: 10,
    });

    for (const batch of expiringBatches) {
      tasks.push({
        id: `EXPIRY_TODAY:${batch.id}`,
        type: "EXPIRY_TODAY",
        entityId: batch.id,
        title: `Proses Kedaluwarsa: ${batch.item.name}`,
        description: `Batch ${batch.batchNumber} — ${batch.quantity} ${batch.item.unit} kedaluwarsa hari ini`,
        dueAt: todayEnd.toISOString(),
        isCompleted: false,
      });
    }

    // ── B. Items at/below reorder point ──
    const allItems = await prisma.item.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        code: true,
        minStock: true,
        unit: true,
        batches: { select: { quantity: true } },
      },
      orderBy: { name: "asc" },
    });

    for (const item of allItems) {
      const totalStock = item.batches.reduce((acc, b) => acc + b.quantity, 0);
      if (totalStock <= item.minStock) {
        tasks.push({
          id: `REORDER_CRITICAL:${item.id}`,
          type: "REORDER_CRITICAL",
          entityId: item.id,
          title: `Reorder Kritis: ${item.name}`,
          description: `Stok saat ini ${totalStock} ${item.unit} ≤ batas minimum ${item.minStock} ${item.unit}`,
          dueAt: null,
          isCompleted: false,
        });
      }
    }

    // ── C. In-progress audits ──
    const ongoingAudits = await prisma.stockAudit.findMany({
      where: { status: "IN_PROGRESS" },
      select: {
        id: true,
        auditNumber: true,
        createdAt: true,
        conductedBy: { select: { fullName: true } },
      },
      orderBy: { createdAt: "asc" },
      take: 5,
    });

    for (const audit of ongoingAudits) {
      tasks.push({
        id: `AUDIT_SCHEDULED:${audit.id}`,
        type: "AUDIT_SCHEDULED",
        entityId: audit.id,
        title: `Audit Stok: ${audit.auditNumber}`,
        description: `Dilakukan oleh ${audit.conductedBy.fullName} — dimulai ${audit.createdAt.toLocaleDateString("id-ID")}`,
        dueAt: endOfDay(audit.createdAt).toISOString(),
        isCompleted: false,
      });
    }

    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    console.error("[DASHBOARD/TASKS]", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil daftar tugas prioritas." },
      { status: 500 },
    );
  }
}
