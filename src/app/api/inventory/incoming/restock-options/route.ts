import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/prisma/config";

export async function GET(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      {
        success: false,
        message: "Sesi tidak valid.",
      },
      {
        status: 401,
      },
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json(
        {
          success: false,
          message: "itemId wajib diisi.",
        },
        {
          status: 400,
        },
      );
    }

    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where: {
        status: {
          in: ["PENDING", "PARTIAL"],
        },
        items: {
          some: {
            itemId,
            quantity: {
              gt: 0,
            },
          },
        },
      },

      select: {
        id: true,
        poNumber: true,
        status: true,

        supplier: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },

        items: {
          where: {
            itemId,
          },

          select: {
            id: true,
            itemId: true,
            quantity: true,
            receivedQty: true,
            batchNumber: true,
            expiryDate: true,
            unitPrice: true,

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

      orderBy: {
        createdAt: "asc",
      },
    });

    const result = purchaseOrders
      .map((po) => ({
        id: po.id,
        poNumber: po.poNumber,
        status: po.status,
        supplier: po.supplier,

        items: po.items
          .map((item) => ({
            id: item.id,
            itemId: item.itemId,

            orderedQty: item.quantity,
            receivedQty: item.receivedQty,

            remainingQty: Math.max(
              item.quantity - item.receivedQty,
              0,
            ),

            suggestedBatchNumber: item.batchNumber,
            suggestedExpiryDate: item.expiryDate,

            unitPrice: item.unitPrice,

            item: item.item,
          }))
          .filter((item) => item.remainingQty > 0),
      }))
      .filter((po) => po.items.length > 0);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("GET Restock Options Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil pilihan Purchase Order untuk restock.",
      },
      {
        status: 500,
      },
    );
  }
}