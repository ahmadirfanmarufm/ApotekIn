import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, AuditStatus } from "@/prisma/config";
import { initiateAuditSchema } from "@/lib/validations/audit";
import { getAuditFreezeStatus } from "@/lib/audit-freeze";

async function generateAuditNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  const prefix = `AUD-${year}${month}-`;
  const count = await prisma.stockAudit.count({
    where: {
      auditNumber: {
        startsWith: prefix,
      },
    },
  });

  return `${prefix}${String(count + 1).padStart(4, "0")}`;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Sesi tidak valid." },
      { status: 401 },
    );
  }

  try {
    const body = await req.json();
    const validated = initiateAuditSchema.safeParse(body);

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

    const freezeStatus = await getAuditFreezeStatus();
    if (freezeStatus.isFreezeActive) {
      return NextResponse.json(
        {
          success: false,
          message: `Audit ${freezeStatus.activeAudit?.auditNumber} masih berlangsung. Selesaikan terlebih dahulu sebelum memulai audit baru.`,
        },
        { status: 409 },
      );
    }

    const totalItemCount = await prisma.item.count({
      where: { isActive: true },
    });

    if (totalItemCount === 0) {
      return NextResponse.json(
        { success: false, message: "Tidak ada item yang dapat diaudit." },
        { status: 400 },
      );
    }

    const audit = await prisma.$transaction(async (tx) => {
      const existingAudit = await tx.stockAudit.findFirst({
        where: { status: AuditStatus.IN_PROGRESS },
      });

      if (existingAudit) {
        throw new Error("AUDIT_CONFLICT");
      }

      const auditNumber = await generateAuditNumber();

      const batches = await tx.batch.findMany({
        where: {
          item: { isActive: true },
        },
        select: {
          id: true,
          itemId: true,
          quantity: true,
          buyPrice: true,
          sellPrice: true,
          item: { select: { id: true } },
        },
      });

      const created = await tx.stockAudit.create({
        data: {
          auditNumber,
          conductedById: session.user.id,
          status: AuditStatus.IN_PROGRESS,
          notes: validated.data.notes?.trim() || null,
          details: {
            create: batches.map((batch) => ({
              itemId: batch.itemId,
              batchId: batch.id,
              systemStock: batch.quantity,
              physicalStock: batch.quantity,
              difference: 0,
              unitPrice: batch.buyPrice || batch.sellPrice,
            })),
          },
        },
        include: {
          conductedBy: { select: { id: true, fullName: true } },
          details: true,
        },
      });

      return created;
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Audit stok berhasil dimulai. Stok sistem terkunci (freeze mode aktif).",
        data: {
          id: audit.id,
          auditNumber: audit.auditNumber,
          status: audit.status,
          detailCount: audit.details.length,
          conductedBy: audit.conductedBy,
          freezeActive: true,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST Initiate Audit Error:", error);

    if (error instanceof Error && error.message === "AUDIT_CONFLICT") {
      return NextResponse.json(
        {
          success: false,
          message: "Sudah ada sesi audit yang sedang berlangsung.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { success: false, message: "Gagal memulai audit stok." },
      { status: 500 },
    );
  }
}
