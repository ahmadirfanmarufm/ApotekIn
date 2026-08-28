import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/prisma/config";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(req: Request, context: RouteContext) {
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
    const { id } = await context.params;

    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: {
        id,
      },

      select: {
        id: true,
        poNumber: true,
        status: true,
        totalAmount: true,
        notes: true,
        createdAt: true,
        receivedAt: true,
        expectedDeliveryAt: true,

        supplier: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },

        createdBy: {
          select: {
            id: true,
            fullName: true,
          },
        },

        items: {
          select: {
            id: true,
            itemId: true,
            quantity: true,
            receivedQty: true,
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

          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!purchaseOrder) {
      return NextResponse.json(
        {
          success: false,
          message: "Purchase Order tidak ditemukan.",
        },
        {
          status: 404,
        },
      );
    }

    const data = {
      id: purchaseOrder.id,
      poNumber: purchaseOrder.poNumber,
      status: purchaseOrder.status,
      totalAmount: purchaseOrder.totalAmount,
      notes: purchaseOrder.notes,
      createdAt: purchaseOrder.createdAt,
      receivedAt: purchaseOrder.receivedAt,
      expectedDeliveryAt: purchaseOrder.expectedDeliveryAt,
      supplier: purchaseOrder.supplier,
      createdBy: purchaseOrder.createdBy ?? undefined,

      items: purchaseOrder.items.map((item) => ({
        id: item.id,
        itemId: item.itemId,

        orderedQty: item.quantity,

        receivedQty: item.receivedQty,

        remainingQty: Math.max(item.quantity - item.receivedQty, 0),

        unitPrice: item.unitPrice,

        item: item.item,
      })),
    };

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("GET Purchase Order Detail Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil detail purchase order.",
      },
      {
        status: 500,
      },
    );
  }
}
