import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Prisma, prisma } from "@/prisma/config";
import { StockOutReason } from "@/prisma/config";
import { createStockOutSchema } from "@/lib/validations/stock-out";

async function generateReferenceNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const prefix = `OUT-${year}${month}${day}-`;

  const count = await prisma.stockOut.count({
    where: {
      referenceNo: {
        startsWith: prefix,
      },
    },
  });

  return `${prefix}${String(count + 1).padStart(4, "0")}`;
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Sesi tidak valid." },
      { status: 401 },
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const reason = searchParams.get("reason");

    const stockOuts = await prisma.stockOut.findMany({
      where: {
        ...(reason &&
          Object.values(StockOutReason).includes(reason as StockOutReason) && {
            reason: reason as StockOutReason,
          }),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
        items: {
          select: {
            id: true,
            quantity: true,
            unitPrice: true,
            batch: {
              select: {
                id: true,
                batchNumber: true,
                expiryDate: true,
                item: {
                  select: {
                    id: true,
                    code: true,
                    name: true,
                    unit: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: stockOuts,
    });
  } catch (error) {
    console.error("GET Stock Outs Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data stok keluar." },
      { status: 500 },
    );
  }
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

    const validatedFields = createStockOutSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validasi gagal.",
          errors: validatedFields.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { reason, notes, items } = validatedFields.data;

    const quantityByBatchId = new Map<string, number>();

    for (const item of items) {
      const current = quantityByBatchId.get(item.batchId) ?? 0;
      quantityByBatchId.set(item.batchId, current + item.quantity);
    }

    const result = await prisma.$transaction(async (tx) => {
      const batchIds = [...quantityByBatchId.keys()];

      const lockedBatches = await tx.$queryRaw<
        Array<{
          id: string;
          itemId: string;
          batchNumber: string;
          quantity: number;
          sellPrice: string;
        }>
      >`
        SELECT "id", "itemId", "batchNumber", "quantity", "sellPrice"
        FROM "batches"
        WHERE "id" IN (${Prisma.join(batchIds)})
        FOR UPDATE
      `;

      if (lockedBatches.length !== batchIds.length) {
        throw new Error("BATCH_NOT_FOUND");
      }

      const batchById = new Map(
        lockedBatches.map((batch) => [batch.id, batch]),
      );

      for (const [batchId, requestedQty] of quantityByBatchId) {
        const batch = batchById.get(batchId)!;

        if (requestedQty > batch.quantity) {
          throw new Error(
            `INSUFFICIENT_STOCK:${batch.batchNumber}:${requestedQty}:${batch.quantity}`,
          );
        }
      }

      const totalAmount = items.reduce((acc, item) => {
        const batch = batchById.get(item.batchId)!;

        return acc + item.quantity * Number(batch.sellPrice);
      }, 0);

      const referenceNo = await generateReferenceNumber();

      const stockOut = await tx.stockOut.create({
        data: {
          referenceNo,
          createdById: session.user.id,
          reason,
          totalAmount,
          notes: notes?.trim() || null,
          items: {
            create: items.map((item) => {
              const batch = batchById.get(item.batchId)!;

              return {
                batchId: item.batchId,
                quantity: item.quantity,
                unitPrice: batch.sellPrice,
              };
            }),
          },
        },
      });

      for (const [batchId, qty] of quantityByBatchId) {
        await tx.batch.update({
          where: { id: batchId },
          data: {
            quantity: {
              decrement: qty,
            },
          },
        });
      }

      return stockOut;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Stok keluar berhasil dicatat.",
        data: result,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST Stock Out Error:", error);

    if (error instanceof Error) {
      switch (error.message) {
        case "BATCH_NOT_FOUND":
          return NextResponse.json(
            { success: false, message: "Batch tidak ditemukan." },
            { status: 404 },
          );
        default:
          break;
      }

      if (error.message.startsWith("INSUFFICIENT_STOCK")) {
        const [, batchNumber, requested, available] = error.message.split(":");

        return NextResponse.json(
          {
            success: false,
            message: `Stok batch ${batchNumber} tidak mencukupi (diminta: ${requested}, tersedia: ${available}).`,
          },
          { status: 400 },
        );
      }
    }

    return NextResponse.json(
      { success: false, message: "Gagal mencatat stok keluar." },
      { status: 500 },
    );
  }
}
