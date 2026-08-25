import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/prisma/config";
import type { PriorityTaskType } from "@/types/dashboard";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Sesi tidak valid." },
      { status: 401 },
    );
  }

  try {
    const { id: entityId } = await params;

    if (!entityId || typeof entityId !== "string" || entityId.trim() === "") {
      return NextResponse.json(
        { success: false, message: "ID tugas tidak valid." },
        { status: 400 },
      );
    }

    const body = await request.json();
    const taskType = (body?.type ?? "") as PriorityTaskType;
    const validTypes: PriorityTaskType[] = [
      "EXPIRY_TODAY",
      "REORDER_CRITICAL",
      "AUDIT_SCHEDULED",
    ];

    if (!validTypes.includes(taskType)) {
      return NextResponse.json(
        {
          success: false,
          message: "Tipe tugas tidak valid.",
          validTypes,
        },
        { status: 400 },
      );
    }

    // Atomic write via transaction.
    // EXPIRY_TODAY and REORDER_CRITICAL are virtual tasks derived from
    // batch/item state — completing them is a DB no-op (their status changes
    // when stock changes). Only AUDIT_SCHEDULED has a real state transition.
    if (taskType === "AUDIT_SCHEDULED") {
      await prisma.$transaction(async (tx) => {
        const audit = await tx.stockAudit.findUniqueOrThrow({
          where: { id: entityId },
        });

        if (audit.status === "COMPLETED") {
          throw new Error("Audit sudah selesai.");
        }

        await tx.stockAudit.update({
          where: { id: entityId },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
          },
        });
      });
    }

    return NextResponse.json({
      success: true,
      message: "Tugas berhasil ditandai selesai.",
    });
  } catch (error) {
    console.error("[DASHBOARD/TASKS/:id PATCH]", error);
    const message =
      error instanceof Error ? error.message : "Gagal menyelesaikan tugas.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
