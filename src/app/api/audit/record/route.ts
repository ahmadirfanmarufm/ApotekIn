import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, AuditStatus } from "@/prisma/config";
import { recordAuditSchema } from "@/lib/validations/audit";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Sesi tidak valid." },
      { status: 401 },
    );
  }

  try {
    const body = await req.json();
    const validated = recordAuditSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validasi gagal.",
          errors: validated.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { auditId, items } = validated.data;

    const audit = await prisma.stockAudit.findUnique({
      where: { id: auditId },
      select: {
        id: true,
        auditNumber: true,
        status: true,
      },
    });

    if (!audit) {
      return NextResponse.json(
        { success: false, message: "Audit tidak ditemukan." },
        { status: 404 },
      );
    }

    if (audit.status !== AuditStatus.IN_PROGRESS) {
      return NextResponse.json(
        {
          success: false,
          message:
            audit.status === AuditStatus.COMPLETED
              ? "Audit sudah selesai dan tidak dapat diubah lagi."
              : "Audit sudah dibatalkan.",
        },
        { status: 409 },
      );
    }

    const batchIds = items.map((item) => item.batchId);
    const auditDetails = await prisma.stockAuditDetail.findMany({
      where: {
        stockAuditId: audit.id,
        batchId: { in: batchIds },
      },
      select: {
        id: true,
        batchId: true,
        itemId: true,
        systemStock: true,
        unitPrice: true,
      },
    });

    const detailByBatch = new Map(auditDetails.map((d) => [d.batchId, d]));

    for (const item of items) {
      if (!detailByBatch.has(item.batchId)) {
        return NextResponse.json(
          {
            success: false,
            message: "Batch tidak termasuk dalam daftar audit ini.",
          },
          { status: 400 },
        );
      }
    }

    await prisma.$transaction(
      items.map((item) => {
        const detail = detailByBatch.get(item.batchId)!;

        return prisma.stockAuditDetail.update({
          where: { id: detail.id },
          data: {
            physicalStock: item.physicalStock,
            difference: item.physicalStock - detail.systemStock,
            reason: item.reason?.trim() || null,
            unitPrice: item.unitPrice ?? detail.unitPrice,
          },
        });
      }),
    );

    return NextResponse.json({
      success: true,
      message: "Hasil fisik berhasil dicatat.",
    });
  } catch (error) {
    console.error("PATCH Record Audit Error:", error);

    return NextResponse.json(
      { success: false, message: "Gagal mencatat hasil audit." },
      { status: 500 },
    );
  }
}
