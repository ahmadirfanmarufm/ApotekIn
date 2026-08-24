import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/prisma/config";
import { POStatus } from "@/prisma/config";
import { createStockReceiptSchema } from "@/lib/validations/stock-receipt";

async function generateReceiptNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const prefix = `RC-${year}${month}${day}-`;

  const count = await prisma.stockReceipt.count({
    where: {
      receiptNumber: {
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
    const receipts = await prisma.stockReceipt.findMany({
      include: {
        purchaseOrder: {
          select: {
            id: true,
            poNumber: true,
          },
        },
        supplier: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        items: {
          select: {
            id: true,
            quantity: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: receipts,
    });
  } catch (error) {
    console.error("GET Stock Receipts Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data stok masuk." },
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

    const validatedFields = createStockReceiptSchema.safeParse(body);

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

    const { purchaseOrderId, invoiceNumber, notes, items } =
      validatedFields.data;

    const quantityByPoItemId = new Map<string, number>();

    for (const item of items) {
      const current = quantityByPoItemId.get(item.purchaseOrderItemId) ?? 0;
      quantityByPoItemId.set(item.purchaseOrderItemId, current + item.quantity);
    }

    const result = await prisma.$transaction(async (tx) => {
      const purchaseOrders = await tx.$queryRaw<
        Array<{
          id: string;
          poNumber: string;
          supplierId: string;
          status: POStatus;
        }>
      >`
        SELECT "id", "poNumber", "supplierId", "status"
        FROM "purchase_orders"
        WHERE "id" = ${purchaseOrderId}
        FOR UPDATE
      `;

      const purchaseOrder = purchaseOrders[0];

      if (!purchaseOrder) {
        throw new Error("PO_NOT_FOUND");
      }

      if (purchaseOrder.status === POStatus.COMPLETED) {
        throw new Error("PO_ALREADY_COMPLETED");
      }

      if (purchaseOrder.status === POStatus.CANCELLED) {
        throw new Error("PO_CANCELLED");
      }

      const poItemIds = [...quantityByPoItemId.keys()];

      const poItems = await tx.purchaseOrderItem.findMany({
        where: {
          id: { in: poItemIds },
          purchaseOrderId,
        },
      });

      if (poItems.length !== poItemIds.length) {
        throw new Error("PO_ITEM_MISMATCH");
      }

      const poItemById = new Map(poItems.map((item) => [item.id, item]));

      for (const [poItemId, requestedQty] of quantityByPoItemId) {
        const poItem = poItemById.get(poItemId)!;

        const remainingQty = poItem.quantity - poItem.receivedQty;

        if (remainingQty <= 0) {
          throw new Error(`ITEM_FULLY_RECEIVED:${poItem.id}`);
        }

        if (requestedQty > remainingQty) {
          throw new Error(
            `OVER_RECEIVING:${poItem.id}:${requestedQty}:${remainingQty}`,
          );
        }
      }

      const receiptNumber = await generateReceiptNumber();

      const stockReceipt = await tx.stockReceipt.create({
        data: {
          receiptNumber,
          purchaseOrderId,
          supplierId: purchaseOrder.supplierId,
          createdById: session.user.id,
          invoiceNumber: invoiceNumber || null,
          notes: notes || null,
          items: {
            create: items.map((item) => {
              const poItem = poItemById.get(item.purchaseOrderItemId)!;

              return {
                purchaseOrderItemId: poItem.id,
                itemId: poItem.itemId,
                quantity: item.quantity,
                unitPrice: poItem.unitPrice,
              };
            }),
          },
        },
      });

      for (const item of items) {
        const poItem = poItemById.get(item.purchaseOrderItemId)!;

        await tx.purchaseOrderItem.update({
          where: { id: poItem.id },
          data: {
            receivedQty: {
              increment: item.quantity,
            },
            batchNumber: item.batchNumber.trim(),
            expiryDate: new Date(item.expiryDate),
          },
        });

        const existingBatch = await tx.batch.findFirst({
          where: {
            itemId: poItem.itemId,
            batchNumber: item.batchNumber.trim(),
          },
        });

        const expiryDate = new Date(item.expiryDate);

        if (
          existingBatch &&
          existingBatch.expiryDate.getTime() === expiryDate.getTime()
        ) {
          await tx.batch.update({
            where: { id: existingBatch.id },
            data: {
              quantity: {
                increment: item.quantity,
              },
            },
          });

          await tx.stockReceiptItem.updateMany({
            where: {
              stockReceiptId: stockReceipt.id,
              purchaseOrderItemId: poItem.id,
            },
            data: {
              batchId: existingBatch.id,
            },
          });
        } else {
          const newBatch = await tx.batch.create({
            data: {
              batchNumber: item.batchNumber.trim(),
              itemId: poItem.itemId,
              quantity: item.quantity,
              initialQuantity: item.quantity,
              expiryDate,
              buyPrice: poItem.unitPrice,
              sellPrice: poItem.unitPrice,
            },
          });

          await tx.stockReceiptItem.updateMany({
            where: {
              stockReceiptId: stockReceipt.id,
              purchaseOrderItemId: poItem.id,
            },
            data: {
              batchId: newBatch.id,
            },
          });
        }
      }

      const updatedPoItems = await tx.purchaseOrderItem.findMany({
        where: { purchaseOrderId },
        select: {
          quantity: true,
          receivedQty: true,
        },
      });

      const isFullyReceived = updatedPoItems.every(
        (item) => item.receivedQty >= item.quantity,
      );

      const newStatus = isFullyReceived ? POStatus.COMPLETED : POStatus.PARTIAL;

      await tx.purchaseOrder.update({
        where: { id: purchaseOrderId },
        data: {
          status: newStatus,
          receivedAt: isFullyReceived ? new Date() : null,
        },
      });

      return stockReceipt;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Stok masuk berhasil dicatat.",
        data: result,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST Stock Receipt Error:", error);

    if (error instanceof Error) {
      switch (error.message) {
        case "PO_NOT_FOUND":
          return NextResponse.json(
            { success: false, message: "Purchase Order tidak ditemukan." },
            { status: 404 },
          );
        case "PO_ALREADY_COMPLETED":
          return NextResponse.json(
            {
              success: false,
              message:
                "Purchase Order sudah selesai diterima dan tidak dapat diterima lagi.",
            },
            { status: 409 },
          );
        case "PO_CANCELLED":
          return NextResponse.json(
            {
              success: false,
              message:
                "Purchase Order sudah dibatalkan dan tidak dapat diterima.",
            },
            { status: 409 },
          );
        case "PO_ITEM_MISMATCH":
          return NextResponse.json(
            {
              success: false,
              message:
                "Terdapat barang yang tidak sesuai dengan isi Purchase Order.",
            },
            { status: 400 },
          );
        default:
          break;
      }

      if (error.message.startsWith("ITEM_FULLY_RECEIVED")) {
        const poItemId = error.message.split(":")[1];

        return NextResponse.json(
          {
            success: false,
            message:
              "Seluruh jumlah untuk salah satu barang sudah diterima sebelumnya.",
            errors: { items: [`Item ${poItemId} sudah diterima penuh.`] },
          },
          { status: 409 },
        );
      }

      if (error.message.startsWith("OVER_RECEIVING")) {
        const [, poItemId, requested, remaining] = error.message.split(":");

        return NextResponse.json(
          {
            success: false,
            message: `Jumlah melebihi sisa barang yang harus diterima (sisa: ${remaining}).`,
            errors: {
              items: [
                `Item ${poItemId}: diminta ${requested}, sisa ${remaining}.`,
              ],
            },
          },
          { status: 400 },
        );
      }
    }

    return NextResponse.json(
      { success: false, message: "Gagal mencatat stok masuk." },
      { status: 500 },
    );
  }
}
