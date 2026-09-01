import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  prisma,
  Prisma,
  AuditStatus,
  StockOutReason,
  StockInReason,
  StockBatchType,
  Role,
} from "@/prisma/config";
import { approveAuditSchema } from "@/lib/validations/audit";

async function generateReferenceNo(tx: Prisma.TransactionClient, prefix: string) {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const startsWith = `${prefix}${year}${month}${day}-`;

  const [outCount, inCount] = await Promise.all([
    tx.stockOutTransaction.count({
      where: {
        referenceNo: {
          startsWith,
        },
      },
    }),

    tx.stockInTransaction.count({
      where: {
        referenceNo: {
          startsWith,
        },
      },
    }),
  ]);

  return `${startsWith}${String(outCount + inCount + 1).padStart(4, "0")}`;
}

function canApprove(role: string | undefined) {
  return (
    role === Role.APOTEKER_PENANGGUNG_JAWAB ||
    role === Role.ADMINISTRATOR ||
    role === Role.OWNER
  );
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Sesi tidak valid." },
      { status: 401 },
    );
  }

  if (!canApprove(session.user.role)) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Hanya Apoteker Penanggung Jawab, Administrator, atau Owner yang dapat menyetujui hasil audit.",
      },
      { status: 403 },
    );
  }

  try {
    const body = await req.json();
    const validated = approveAuditSchema.safeParse(body);

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

    const { auditId, notes } = validated.data;

    const result = await prisma.$transaction(async (tx) => {
      const lockedAudits = await tx.$queryRaw<
        Array<{
          id: string;
          auditNumber: string;
          status: AuditStatus;
          notes: string | null;
        }>
      >`
        SELECT "id", "auditNumber", "status", "notes"
        FROM "stock_audits"
        WHERE "id" = ${auditId}
        FOR UPDATE
      `;

      const activeAudit = lockedAudits[0];

      if (!activeAudit) {
        throw new Error("AUDIT_NOT_FOUND");
      }

      if (activeAudit.status !== AuditStatus.IN_PROGRESS) {
        throw new Error(
          activeAudit.status === AuditStatus.COMPLETED
            ? "AUDIT_ALREADY_COMPLETED"
            : "AUDIT_CANCELLED",
        );
      }

      const details = await tx.stockAuditDetail.findMany({
        where: { stockAuditId: activeAudit.id },
        select: {
          batchId: true,
          itemId: true,
          systemStock: true,
          physicalStock: true,
          difference: true,
          unitPrice: true,
        },
      });

      const lockedBatches = await tx.$queryRaw<
        Array<{ id: string; quantity: number }>
      >`
        SELECT "id", "quantity"
        FROM "batches"
        WHERE "id" IN (${Prisma.join(batchIds(details))})
        FOR UPDATE
      `;

      for (const detail of details) {
        await tx.batch.update({
          where: { id: detail.batchId },
          data: { quantity: detail.physicalStock },
        });
      }

      const adjustmentsOut = details.filter((d) => d.difference < 0);
      const adjustmentsIn = details.filter((d) => d.difference > 0);

      if (adjustmentsOut.length > 0) {
        const referenceNo = await generateReferenceNo(tx, "SOU-AUD-");
        const totalQty = adjustmentsOut.reduce(
          (acc, a) => acc + Math.abs(a.difference),
          0,
        );
        const totalAmount = adjustmentsOut.reduce(
          (acc, a) => acc + Math.abs(a.difference) * Number(a.unitPrice || 0),
          0,
        );

        await tx.stockOutTransaction.create({
          data: {
            referenceNo,
            createdById: session.user.id,
            reason: StockOutReason.ADJUSTMENT_AUDIT,
            batchType: StockBatchType.ADJUSTMENT,
            totalQuantity: totalQty,
            totalAmount,
            notes: `Selisih minus audit ${activeAudit.auditNumber}`,
            items: {
              create: adjustmentsOut.map((adj) => ({
                itemId: adj.itemId,
                batchId: adj.batchId,
                quantity: Math.abs(adj.difference),
                unitPrice: Number(adj.unitPrice || 0),
              })),
            },
          },
        });
      }

      if (adjustmentsIn.length > 0) {
        const referenceNo = await generateReferenceNo(tx, "SIN-AUD-");
        const totalQty = adjustmentsIn.reduce(
          (acc, a) => acc + a.difference,
          0,
        );

        await tx.stockInTransaction.create({
          data: {
            referenceNo,
            createdById: session.user.id,
            reason: StockInReason.ADJUSTMENT_AUDIT,
            batchType: StockBatchType.ADJUSTMENT,
            totalQuantity: totalQty,
            notes: `Selisih plus audit ${activeAudit.auditNumber}`,
            items: {
              create: adjustmentsIn.map((adj) => ({
                itemId: adj.itemId,
                batchId: adj.batchId,
                quantity: adj.difference,
                unitPrice: Number(adj.unitPrice || 0),
              })),
            },
          },
        });
      }

      await tx.stockAudit.update({
        where: { id: activeAudit.id },
        data: {
          status: AuditStatus.COMPLETED,
          completedAt: new Date(),
          notes:
            notes?.trim() ||
            activeAudit.notes ||
            "Audit disetujui dan direkonsiliasi.",
        },
      });

      return {
        adjustedOutCount: adjustmentsOut.reduce(
          (acc, a) => acc + Math.abs(a.difference),
          0,
        ),
        adjustedInCount: adjustmentsIn.reduce(
          (acc, a) => acc + a.difference,
          0,
        ),
        batchCount: details.length,
      };
    }, {
      maxWait: 5000,
      timeout: 15000,
    });

    return NextResponse.json({
      success: true,
      message:
        "Audit disetujui. Stok telah direkonsiliasi dan stok tidak lagi terkunci.",
      data: result,
    });
  } catch (error) {
    console.error("POST Approve Audit Error:", error);

    if (error instanceof Error) {
      switch (error.message) {
        case "AUDIT_NOT_FOUND":
          return NextResponse.json(
            { success: false, message: "Audit tidak ditemukan." },
            { status: 404 },
          );
        case "AUDIT_ALREADY_COMPLETED":
          return NextResponse.json(
            {
              success: false,
              message: "Audit ini sudah disetujui dan diselesaikan.",
            },
            { status: 409 },
          );
        case "AUDIT_CANCELLED":
          return NextResponse.json(
            { success: false, message: "Audit ini sudah dibatalkan." },
            { status: 409 },
          );
        default:
          break;
      }
    }

    return NextResponse.json(
      { success: false, message: "Gagal menyetujui audit stok." },
      { status: 500 },
    );
  }
}

function batchIds(details: Array<{ batchId: string }>): string[] {
  const ids = details.map((d) => d.batchId);
  return ids.length > 0 ? ids : [""];
}
